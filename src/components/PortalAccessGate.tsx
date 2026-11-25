import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Crown,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  AuthSessionUser,
  BrandConfig,
  PortalViewMode,
  UnactivatedCollaboratorHint,
} from '../types/portal';
import { BrandMonogram } from './BrandMonogram';

interface PortalAccessGateProps {
  onAuthenticated: (token: string, user: AuthSessionUser, viewMode: PortalViewMode) => void;
}

interface LoginContextResponse {
  brand: Pick<BrandConfig, 'companyName' | 'tagline' | 'heroImage' | 'customLogoUrl'>;
  needsBootstrap: boolean;
  masterName: string;
  activeGestoresCount: number;
  unactivatedCollaborators: UnactivatedCollaboratorHint[];
}

export const PortalAccessGate: React.FC<PortalAccessGateProps> = ({ onAuthenticated }) => {
  const [context, setContext] = useState<LoginContextResponse>({
    brand: {
      companyName: 'Cavalcante & Rolim',
      tagline: 'Signature Spaces',
      heroImage: '/src/assets/images/hero_signature_tower_1795629924873.jpg',
      customLogoUrl: '/assets/aistudio/PORTAL_RH_-_LOGO_C_R_eb82e443.jpg',
    },
    needsBootstrap: false,
    masterName: 'Willian Vianna',
    activeGestoresCount: 0,
    unactivatedCollaborators: [],
  });
  const [loadingContext, setLoadingContext] = useState(true);

  // Top-level access tab: Colaborador vs Gestor / Master
  const [portalProfileTab, setPortalProfileTab] = useState<'colaborador' | 'gestor'>('colaborador');

  // Collaborator mode sub-tab: normal login vs first-access activation
  const [collabAction, setCollabAction] = useState<'login' | 'activate'>('login');
  const [collabIdentifier, setCollabIdentifier] = useState('');
  const [collabPassword, setCollabPassword] = useState('');
  const [collabConfirmPassword, setCollabConfirmPassword] = useState('');
  const [showCollabPassword, setShowCollabPassword] = useState(false);

  // Gestor / Master mode state
  const [gestorKind, setGestorKind] = useState<'master' | 'gestor'>('master');
  const [gestorIdentifier, setGestorIdentifier] = useState('');
  const [gestorPassword, setGestorPassword] = useState('');
  const [gestorConfirmPassword, setGestorConfirmPassword] = useState('');
  const [showGestorPassword, setShowGestorPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoadingContext(true);
    fetch('/api/portal/login-context')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: LoginContextResponse | null) => {
        if (data && data.brand) {
          setContext(data);
          if (data.unactivatedCollaborators?.length > 0) {
            setCollabIdentifier((prev) => prev || data.unactivatedCollaborators[0].email);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingContext(false));
  }, []);

  const handleCollaboratorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!collabIdentifier.trim()) {
      setError('Informe seu e-mail corporativo ou nome cadastrado.');
      return;
    }

    if (collabAction === 'activate') {
      if (collabPassword.trim().length < 6) {
        setError('Defina uma senha pessoal com no mínimo 6 caracteres.');
        return;
      }
      if (collabPassword !== collabConfirmPassword) {
        setError('As senhas digitadas não coincidem.');
        return;
      }
    } else if (!collabPassword) {
      setError('Informe sua senha de acesso.');
      return;
    }

    setSubmitting(true);
    try {
      const endpoint =
        collabAction === 'activate'
          ? '/api/auth/collaborator/activate'
          : '/api/auth/collaborator/login';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: collabIdentifier.trim(),
          password: collabPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.token || !data.user) {
        if (data.needsActivation) {
          setCollabAction('activate');
        }
        throw new Error(data.error || 'Não foi possível validar suas credenciais.');
      }
      onAuthenticated(data.token, data.user, 'colaborador');
    } catch (err: any) {
      setError(err?.message || 'Falha ao autenticar no Modo Colaborador.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGestorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (context.needsBootstrap) {
      if (gestorPassword.trim().length < 6) {
        setError('A senha Master deve conter ao menos 6 caracteres.');
        return;
      }
      if (gestorPassword !== gestorConfirmPassword) {
        setError('As senhas digitadas não coincidem.');
        return;
      }
    } else if (gestorKind === 'gestor' && !gestorIdentifier.trim()) {
      setError('Informe o e-mail ou nome completo do Gestor cadastrado.');
      return;
    } else if (!gestorPassword) {
      setError('Informe sua senha de Gestor ou Master.');
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = context.needsBootstrap ? '/api/auth/bootstrap' : '/api/auth/login';
      const payload = context.needsBootstrap
        ? { password: gestorPassword }
        : {
            identifier: gestorKind === 'master' ? 'master' : gestorIdentifier.trim(),
            password: gestorPassword,
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.token || !data.user) {
        throw new Error(data.error || 'Falha na autenticação administrativa.');
      }
      onAuthenticated(data.token, data.user, 'gestor');
    } catch (err: any) {
      setError(err?.message || 'Credenciais administrativas inválidas.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8F7F4] text-[#1C2421] overflow-x-hidden">
      {/* Left Architectural Brand & Policy Panel */}
      <aside className="relative lg:w-5/12 xl:w-[46%] bg-[#11382B] text-white flex flex-col justify-between overflow-hidden lg:min-h-screen">
        <img
          src={context.brand.heroImage}
          alt="Cavalcante & Rolim Empreendimentos"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-35"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(160deg, rgba(17, 56, 43, 0.94) 0%, rgba(17, 56, 43, 0.82) 60%, rgba(12, 41, 32, 0.96) 100%)',
          }}
        />

        <div className="relative z-10 p-5 sm:p-10 lg:p-12 space-y-4 sm:space-y-6 lg:space-y-8">
          <BrandMonogram
            customLogoUrl={context.brand.customLogoUrl}
            companyName={context.brand.companyName}
            tagline={context.brand.tagline}
            variant="light"
          />

          <div className="space-y-2.5 sm:space-y-4 pt-1 sm:pt-4">
            <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.18em] sm:tracking-[0.22em] text-[#D8BC83]">
              Acesso Corporativo Protegido
            </p>
            <h1 className="font-serif text-2xl sm:text-4xl xl:text-5xl font-semibold leading-tight text-white text-balance">
              PORTAL RH DE TODOS
            </h1>
            <p className="text-xs sm:text-base text-white/80 leading-relaxed max-w-md">
              Ambiente oficial de Endomarketing, Manuais, Benefícios e Gamificação da{' '}
              <span className="text-[#D8BC83] font-medium">Cavalcante &amp; Rolim Empreendimentos</span>.
              Entre com seu login e senha para visualizar ou gerenciar a plataforma.
            </p>
          </div>
        </div>

        {/* Clear Role Governance Comparison */}
        <div className="relative z-10 px-5 pb-5 sm:px-10 sm:pb-10 lg:p-12 pt-0 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-3">
            <div className="bg-black/25 border border-[#C5A467]/35 rounded-xl p-3 sm:p-4 space-y-1">
              <p className="text-xs font-semibold text-[#D8BC83] flex items-center gap-2">
                <Users className="w-4 h-4 shrink-0" />
                Modo Colaborador (Leitura &amp; Interação)
              </p>
              <p className="text-[11px] sm:text-xs text-white/75 leading-relaxed">
                Acesso após login e senha individuais para consultar comunicados, benefícios, férias,
                manuais, ranking, mini-games e felicitações. Sem permissão de alteração estrutural.
              </p>
            </div>

            <div className="bg-black/25 border border-[#C5A467]/60 rounded-xl p-3 sm:p-4 space-y-1">
              <p className="text-xs font-semibold text-[#D8BC83] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                Modo Gestor / Master (Controle Completo)
              </p>
              <p className="text-[11px] sm:text-xs text-white/75 leading-relaxed">
                Permite inserir, corrigir e excluir registros, importar documentos, gerenciar usuários e
                alternar livremente para o Modo Colaborador.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-white/55 pt-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#C5A467] shrink-0" />
            <span>Cavalcante &amp; Rolim · Signature Spaces · Sessão verificada em servidor</span>
          </p>
        </div>
      </aside>

      {/* Right Authentication Workspace */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-10 lg:p-14">
        <div className="w-full max-w-lg bg-white border border-[#C5A467]/50 rounded-2xl shadow-xl overflow-hidden">
          {/* Mode Selector Tabs */}
          <div className="bg-[#11382B] p-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setPortalProfileTab('colaborador');
                setError('');
              }}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                portalProfileTab === 'colaborador'
                  ? 'bg-[#F8F7F4] text-[#11382B] shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4 text-[#C5A467]" />
              Modo Colaborador
            </button>

            <button
              type="button"
              onClick={() => {
                setPortalProfileTab('gestor');
                setError('');
              }}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                portalProfileTab === 'gestor'
                  ? 'bg-[#C5A467] text-[#11382B] shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Lock className="w-4 h-4" />
              Modo Gestor / Master
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {loadingContext ? (
              <div className="py-12 flex items-center justify-center gap-2 text-sm text-[#11382B]">
                <Loader2 className="w-4 h-4 animate-spin text-[#C5A467]" />
                Preparando ambiente seguro de acesso...
              </div>
            ) : portalProfileTab === 'colaborador' ? (
              <form onSubmit={handleCollaboratorSubmit} className="space-y-5">
                <div className="space-y-1">
                  <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#C5A467] font-semibold">
                    Visualização &amp; Interação do Colaborador
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#11382B]">
                    {collabAction === 'login'
                      ? 'Login do Colaborador'
                      : 'Primeiro Acesso · Ativar Senha'}
                  </h2>
                  <p className="text-xs text-[#1C2421]/70 leading-relaxed">
                    {collabAction === 'login'
                      ? 'Acesse o portal com seu e-mail corporativo e senha cadastrada.'
                      : 'Se o RH já pré-cadastrou seu nome, defina sua senha pessoal de acesso abaixo.'}
                  </p>
                </div>

                {/* Sub-mode switcher: Standard Login vs First-Run Activation */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#F8F7F4] border border-[#1C2421]/12 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setCollabAction('login');
                      setError('');
                    }}
                    className={`py-2 px-3 rounded-md text-xs font-semibold transition-colors ${
                      collabAction === 'login'
                        ? 'bg-[#11382B] text-white'
                        : 'text-[#1C2421]/70 hover:text-[#11382B]'
                    }`}
                  >
                    Já tenho senha
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCollabAction('activate');
                      setError('');
                      if (
                        context.unactivatedCollaborators.length > 0 &&
                        !context.unactivatedCollaborators.some(
                          (c) => c.email === collabIdentifier
                        )
                      ) {
                        setCollabIdentifier(context.unactivatedCollaborators[0].email);
                      }
                    }}
                    className={`py-2 px-3 rounded-md text-xs font-semibold transition-colors ${
                      collabAction === 'activate'
                        ? 'bg-[#11382B] text-white'
                        : 'text-[#1C2421]/70 hover:text-[#11382B]'
                    }`}
                  >
                    Primeiro Acesso ({context.unactivatedCollaborators.length})
                  </button>
                </div>

                {collabAction === 'activate' && context.unactivatedCollaborators.length > 0 ? (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1.5">
                      Selecione seu Cadastro Pré-Autorizado
                    </label>
                    <select
                      value={collabIdentifier}
                      onChange={(e) => setCollabIdentifier(e.target.value)}
                      className="w-full rounded-lg border border-[#1C2421]/20 bg-[#F8F7F4] px-3.5 py-2.5 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                    >
                      {context.unactivatedCollaborators.map((c) => (
                        <option key={c.id} value={c.email}>
                          {c.name} · {c.roleTitle} ({c.email})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1.5">
                      E-mail Corporativo ou Nome Completo
                    </label>
                    <input
                      type="text"
                      required
                      value={collabIdentifier}
                      onChange={(e) => setCollabIdentifier(e.target.value)}
                      placeholder="nome.sobrenome@cavalcanterolim.com.br"
                      className="w-full rounded-lg border border-[#1C2421]/20 bg-[#F8F7F4] px-3.5 py-2.5 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1.5">
                    {collabAction === 'activate' ? 'Criar Minha Senha (mín. 6 caracteres)' : 'Senha de Acesso'}
                  </label>
                  <div className="relative">
                    <input
                      type={showCollabPassword ? 'text' : 'password'}
                      required
                      value={collabPassword}
                      onChange={(e) => setCollabPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      className="w-full rounded-lg border border-[#1C2421]/20 bg-[#F8F7F4] pl-3.5 pr-10 py-2.5 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCollabPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1C2421]/50 hover:text-[#11382B]"
                      aria-label="Mostrar ou ocultar senha"
                    >
                      {showCollabPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {collabAction === 'activate' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1.5">
                      Confirmar Minha Senha
                    </label>
                    <input
                      type="password"
                      required
                      value={collabConfirmPassword}
                      onChange={(e) => setCollabConfirmPassword(e.target.value)}
                      placeholder="Repita a senha definida"
                      className="w-full rounded-lg border border-[#1C2421]/20 bg-[#F8F7F4] px-3.5 py-2.5 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                    />
                  </div>
                )}

                {collabAction === 'login' && context.unactivatedCollaborators.length > 0 && (
                  <p className="text-[11px] text-[#1C2421]/65 bg-[#F8F7F4] border border-[#1C2421]/10 rounded-lg px-3 py-2">
                    Primeiro acesso ao portal? Clique em{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setCollabAction('activate');
                        setError('');
                        setCollabIdentifier(context.unactivatedCollaborators[0].email);
                      }}
                      className="font-semibold text-[#11382B] underline hover:no-underline"
                    >
                      Primeiro Acesso ({context.unactivatedCollaborators.length} colaboradores aguardando ativação)
                    </button>{' '}
                    para criar sua senha individual.
                  </p>
                )}

                {error && (
                  <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#11382B] text-white text-sm font-semibold hover:bg-[#11382B]/90 disabled:opacity-50 transition-colors"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#D8BC83]" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-[#D8BC83]" />
                  )}
                  {collabAction === 'activate'
                    ? 'Ativar Senha e Entrar no Portal'
                    : 'Entrar no Modo Colaborador'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleGestorSubmit} className="space-y-5">
                <div className="space-y-1">
                  <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#C5A467] font-semibold">
                    Inserir · Corrigir · Excluir · Governança
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#11382B]">
                    {context.needsBootstrap
                      ? 'Configurar Acesso Master'
                      : 'Acesso Completo · Gestor'}
                  </h2>
                  <p className="text-xs text-[#1C2421]/70 leading-relaxed">
                    {context.needsBootstrap
                      ? `Primeiro acesso administrativo (${context.masterName}). Defina a senha soberana do Acesso Master.`
                      : 'Entre como Acesso Master ou Gestor autorizado para administrar conteúdos e usuários.'}
                  </p>
                </div>

                {!context.needsBootstrap && (
                  <div className="grid grid-cols-2 gap-2 p-1 bg-[#F8F7F4] border border-[#1C2421]/12 rounded-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setGestorKind('master');
                        setError('');
                      }}
                      className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition-colors ${
                        gestorKind === 'master'
                          ? 'bg-[#11382B] text-white'
                          : 'text-[#1C2421]/70 hover:text-[#11382B]'
                      }`}
                    >
                      <Crown className="w-3.5 h-3.5 text-[#D8BC83]" />
                      Acesso Master
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGestorKind('gestor');
                        setError('');
                      }}
                      className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition-colors ${
                        gestorKind === 'gestor'
                          ? 'bg-[#11382B] text-white'
                          : 'text-[#1C2421]/70 hover:text-[#11382B]'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#C5A467]" />
                      Outro Gestor ({context.activeGestoresCount})
                    </button>
                  </div>
                )}

                {context.needsBootstrap && (
                  <div className="bg-[#F8F7F4] border border-[#C5A467]/50 rounded-lg p-3.5 text-xs text-[#1C2421]/85 leading-relaxed flex items-start gap-2.5">
                    <KeyRound className="w-4 h-4 text-[#C5A467] shrink-0 mt-0.5" />
                    <span>
                      Após definir a senha Master de <strong>{context.masterName}</strong>, você poderá
                      incluir novos gestores, colaboradores e gerenciar toda a plataforma.
                    </span>
                  </div>
                )}

                {!context.needsBootstrap && gestorKind === 'gestor' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1.5">
                      E-mail ou Nome do Gestor
                    </label>
                    <input
                      type="text"
                      required
                      value={gestorIdentifier}
                      onChange={(e) => setGestorIdentifier(e.target.value)}
                      placeholder="gestor@cavalcanterolim.com.br"
                      className="w-full rounded-lg border border-[#1C2421]/20 bg-[#F8F7F4] px-3.5 py-2.5 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1.5">
                    {context.needsBootstrap
                      ? 'Criar Senha Master (mín. 6 caracteres)'
                      : gestorKind === 'master'
                        ? `Senha do Acesso Master (${context.masterName})`
                        : 'Senha Individual do Gestor'}
                  </label>
                  <div className="relative">
                    <input
                      type={showGestorPassword ? 'text' : 'password'}
                      required
                      value={gestorPassword}
                      onChange={(e) => setGestorPassword(e.target.value)}
                      placeholder="Digite a senha administrativa"
                      className="w-full rounded-lg border border-[#1C2421]/20 bg-[#F8F7F4] pl-3.5 pr-10 py-2.5 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGestorPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1C2421]/50 hover:text-[#11382B]"
                      aria-label="Mostrar ou ocultar senha"
                    >
                      {showGestorPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {context.needsBootstrap && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1.5">
                      Confirmar Senha Master
                    </label>
                    <input
                      type="password"
                      required
                      value={gestorConfirmPassword}
                      onChange={(e) => setGestorConfirmPassword(e.target.value)}
                      placeholder="Repita a senha Master"
                      className="w-full rounded-lg border border-[#1C2421]/20 bg-[#F8F7F4] px-3.5 py-2.5 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                    />
                  </div>
                )}

                {error && (
                  <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#C5A467] text-[#11382B] text-sm font-bold hover:bg-[#D8BC83] disabled:opacity-50 transition-colors"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  {context.needsBootstrap
                    ? 'Definir Senha Master e Entrar'
                    : 'Entrar no Modo Gestor'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
