import React, { useEffect, useState } from 'react';
import { Crown, KeyRound, Loader2, Lock, ShieldCheck, UserCheck, X } from 'lucide-react';
import { AuthSessionUser } from '../types/portal';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (token: string, user: AuthSessionUser) => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [needsBootstrap, setNeedsBootstrap] = useState(false);
  const [masterName, setMasterName] = useState('Willian Vianna');
  const [activeGestoresCount, setActiveGestoresCount] = useState(0);
  const [loginKind, setLoginKind] = useState<'master' | 'gestor'>('master');
  const [identifier, setIdentifier] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setPassword('');
    setConfirmPassword('');
    setIdentifier('');
    setLoginKind('master');
    setCheckingStatus(true);
    fetch('/api/auth/status')
      .then((res) => res.json())
      .then((data) => {
        setNeedsBootstrap(Boolean(data.needsBootstrap));
        if (data.masterName) setMasterName(data.masterName);
        if (typeof data.activeGestoresCount === 'number') {
          setActiveGestoresCount(data.activeGestoresCount);
        }
      })
      .catch(() => {
        setError('Não foi possível verificar o status administrativo.');
      })
      .finally(() => setCheckingStatus(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (needsBootstrap) {
      if (password.trim().length < 6) {
        setError('A senha Master deve conter ao menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setError('As senhas digitadas não coincidem.');
        return;
      }
    } else if (loginKind === 'gestor' && !identifier.trim()) {
      setError('Informe o e-mail ou nome completo do Gestor cadastrado.');
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = needsBootstrap ? '/api/auth/bootstrap' : '/api/auth/login';
      const payload = needsBootstrap
        ? { password }
        : {
            identifier: loginKind === 'master' ? 'master' : identifier.trim(),
            password,
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.token || !data.user) {
        throw new Error(data.error || 'Falha na autenticação.');
      }
      onAuthenticated(data.token, data.user);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao autenticar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#11382B]/75 backdrop-blur-sm p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-auth-title"
    >
      <div className="w-full max-w-md bg-[#F8F7F4] border border-[#C5A467]/60 rounded-xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 bg-[#11382B] text-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Lock className="w-4 h-4 text-[#D8BC83] shrink-0" />
            <h3 id="admin-auth-title" className="font-serif text-lg sm:text-xl font-semibold truncate">
              Acesso Completo · Gestor &amp; Master
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Fechar login"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto">
          {checkingStatus ? (
            <div className="py-8 flex items-center justify-center gap-2 text-sm text-[#11382B]">
              <Loader2 className="w-4 h-4 animate-spin text-[#C5A467]" />
              Verificando política de acesso...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {needsBootstrap ? (
                <div className="bg-white border border-[#C5A467]/50 rounded-lg p-3.5 text-xs text-[#1C2421]/85 leading-relaxed">
                  <p className="font-semibold text-[#11382B] mb-1 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#C5A467]" />
                    Configuração Inicial · Acesso Master ({masterName})
                  </p>
                  Defina a senha soberana do Acesso Master. Após configurada, você poderá cadastrar outros Gestores e Usuários na plataforma.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-white border border-[#1C2421]/12 rounded-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginKind('master');
                        setError('');
                      }}
                      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                        loginKind === 'master'
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
                        setLoginKind('gestor');
                        setError('');
                      }}
                      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                        loginKind === 'gestor'
                          ? 'bg-[#11382B] text-white'
                          : 'text-[#1C2421]/70 hover:text-[#11382B]'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#C5A467]" />
                      Outro Gestor ({activeGestoresCount})
                    </button>
                  </div>

                  <p className="text-xs text-[#1C2421]/75 leading-relaxed">
                    {loginKind === 'master'
                      ? `Entrar como conta Master (${masterName}) para controle completo do portal, gestão de usuários, gestores e auditoria.`
                      : 'Entre com o e-mail corporativo e a senha individual cadastrada por um Gestor ou pelo Acesso Master.'}
                  </p>
                </>
              )}

              {!needsBootstrap && loginKind === 'gestor' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1.5">
                    E-mail ou Nome do Gestor
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="gestor@cavalcanterolim.com.br"
                    className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2.5 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1.5">
                  {needsBootstrap
                    ? 'Criar Senha Master'
                    : loginKind === 'master'
                      ? 'Senha do Acesso Master'
                      : 'Senha Individual do Gestor'}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2.5 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                />
              </div>

              {needsBootstrap && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1.5">
                    Confirmar Senha Master
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha criada"
                    className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2.5 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                  />
                </div>
              )}

              {error && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm text-[#1C2421]/70 hover:text-[#1C2421]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#11382B] text-white text-sm font-medium hover:bg-[#11382B]/90 disabled:opacity-50 transition-colors"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-[#D8BC83]" />
                  )}
                  {needsBootstrap ? 'Definir Master e Entrar' : 'Liberar Acesso Completo'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

