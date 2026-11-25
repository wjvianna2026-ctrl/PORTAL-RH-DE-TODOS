import React, { useCallback, useEffect, useState } from 'react';
import {
  Crown,
  Edit3,
  History,
  ImagePlus,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  AccessRole,
  AccountStatus,
  AuditLogEntry,
  AuthSessionUser,
  ManagedAccount,
} from '../../types/portal';
import { ImageAutoCropModal } from '../ImageAutoCropModal';
import { MasterManagersPanel } from '../MasterManagersPanel';
import { StandardizedImage } from '../StandardizedImage';

interface AccessGovernanceSectionProps {
  adminToken: string;
  authUser: AuthSessionUser;
  onNotify: (message: string) => void;
  onDirectoryChanged?: () => void;
  onSelfProfileUpdated?: (updatedUser: AuthSessionUser) => void;
}

const DEFAULT_AVATARS = [
  '/src/assets/images/avatar_colaborador_1_1795629924319.jpg',
  '/src/assets/images/avatar_colaborador_2_1795629925418.jpg',
  '/src/assets/images/avatar_colaborador_3_1795629925432.jpg',
];

const SECTOR_OPTIONS = [
  'Matriz - Cavalcante e Rolim Empreendimentos',
  'Manta - Cavalcante e Rolim Design SPE',
  'Watal Patacho Eco Boutique Residence SPE',
  'Residencial Aurora Signature',
];

export const AccessGovernanceSection: React.FC<AccessGovernanceSectionProps> = ({
  adminToken,
  authUser,
  onNotify,
  onDirectoryChanged,
  onSelfProfileUpdated,
}) => {
  const [accounts, setAccounts] = useState<ManagedAccount[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<'todos' | 'gestores' | 'usuarios'>('todos');
  const [search, setSearch] = useState('');

  // Modal state for Create / Edit
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ManagedAccount | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [sectorOrSite, setSectorOrSite] = useState(SECTOR_OPTIONS[0]);
  const [accessRole, setAccessRole] = useState<AccessRole>('usuario');
  const [status, setStatus] = useState<AccountStatus>('Ativo');
  const [password, setPassword] = useState('');
  const [photoUrl, setPhotoUrl] = useState(DEFAULT_AVATARS[0]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [cropOpen, setCropOpen] = useState(false);

  const loadGovernanceData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/access/manage', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao carregar política de acesso.');
      }
      setAccounts(Array.isArray(data.accounts) ? data.accounts : []);
      setAuditLogs(Array.isArray(data.auditLogs) ? data.auditLogs : []);
    } catch (err: any) {
      onNotify(err?.message || 'Não foi possível carregar o diretório de acessos.');
    } finally {
      setLoading(false);
    }
  }, [adminToken, onNotify]);

  useEffect(() => {
    loadGovernanceData();
  }, [loadGovernanceData, authUser.name, authUser.photoUrl]);

  const openCreateModal = (defaultRole: 'gestor' | 'usuario') => {
    setEditingAccount(null);
    setName('');
    setEmail('');
    setRoleTitle('');
    setSectorOrSite(SECTOR_OPTIONS[0]);
    setAccessRole(defaultRole);
    setStatus('Ativo');
    setPassword('');
    setPhotoUrl(DEFAULT_AVATARS[defaultRole === 'gestor' ? 2 : 0]);
    setFormError('');
    setEditorOpen(true);
  };

  const openEditModal = (acc: ManagedAccount) => {
    setEditingAccount(acc);
    setName(acc.name);
    setEmail(acc.email);
    setRoleTitle(acc.roleTitle);
    setSectorOrSite(acc.sectorOrSite);
    setAccessRole(acc.accessRole);
    setStatus(acc.status);
    setPassword('');
    setPhotoUrl(acc.photoUrl);
    setFormError('');
    setEditorOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const isEdit = Boolean(editingAccount);
      const url = isEdit
        ? `/api/access/users/${encodeURIComponent(editingAccount!.id)}`
        : '/api/access/users';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name,
          email,
          roleTitle,
          sectorOrSite,
          accessRole,
          status,
          password: password.trim() || undefined,
          photoUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar cadastro.');
      }

      setAccounts(data.accounts || []);
      setAuditLogs(data.auditLogs || []);
      setEditorOpen(false);
      if (data.updatedSessionUser) {
        onSelfProfileUpdated?.(data.updatedSessionUser);
      }
      onNotify(
        isEdit
          ? `Cadastro de ${name} corrigido com sucesso.`
          : `${accessRole === 'gestor' ? 'Gestor' : 'Usuário'} ${name} incluído com sucesso.`
      );
      onDirectoryChanged?.();
    } catch (err: any) {
      setFormError(err?.message || 'Falha ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async (acc: ManagedAccount) => {
    try {
      const res = await fetch(`/api/access/users/${encodeURIComponent(acc.id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Não foi possível excluir este cadastro.');
      }
      setAccounts(data.accounts || []);
      setAuditLogs(data.auditLogs || []);
      onNotify(`Cadastro de ${acc.name} excluído por ${authUser.name}.`);
      onDirectoryChanged?.();
    } catch (err: any) {
      onNotify(err?.message || 'Erro ao excluir cadastro.');
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    const matchRole =
      roleFilter === 'todos'
        ? true
        : roleFilter === 'gestores'
          ? acc.accessRole === 'master' || acc.accessRole === 'gestor'
          : acc.accessRole === 'usuario';
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      acc.name.toLowerCase().includes(q) ||
      acc.email.toLowerCase().includes(q) ||
      acc.roleTitle.toLowerCase().includes(q) ||
      acc.sectorOrSite.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const canManageUsers =
    authUser.accessRole === 'master' || authUser.privileges?.canManageUsers !== false;

  const masterCount = accounts.filter((a) => a.accessRole === 'master').length;
  const gestoresCount = accounts.filter((a) => a.accessRole === 'gestor').length;
  const usuariosCount = accounts.filter((a) => a.accessRole === 'usuario').length;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#1C2421]/12 pb-5">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#C5A467] font-semibold">
            Governança &amp; Controle de Permissões · Somente Master e Gestores
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#11382B] mt-1">
            Política de Acesso, Gestores &amp; Usuários
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canManageUsers && (
            <button
              type="button"
              onClick={() => openCreateModal('usuario')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#11382B]/30 text-xs font-semibold text-[#11382B] hover:bg-[#11382B]/5 whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#C5A467]" />
              Incluir Usuário
            </button>
          )}
          {authUser.accessRole === 'master' && (
            <button
              type="button"
              onClick={() => openCreateModal('gestor')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#11382B] text-white text-xs font-semibold hover:bg-[#11382B]/90 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 text-[#D8BC83]" />
              Incluir Novo Gestor
            </button>
          )}
        </div>
      </div>

      {/* Active Manager Identification & 3-Tier Policy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-[#11382B] text-white rounded-xl p-4 sm:p-6 border border-[#C5A467]/55 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#D8BC83]">
              {authUser.accessRole === 'master' ? (
                <Crown className="w-4 h-4" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>
                {authUser.accessRole === 'master' ? 'Sessão Master Ativa' : 'Sessão de Gestor Ativa'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                const selfAcc = accounts.find((a) => a.id === authUser.id);
                if (selfAcc) openEditModal(selfAcc);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#C5A467] text-[#11382B] text-[11px] font-bold hover:bg-[#D8BC83] transition-colors shrink-0"
            >
              <Edit3 className="w-3 h-3" />
              Nome e Foto
            </button>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 shrink-0">
              <StandardizedImage
                src={authUser.photoUrl}
                alt={authUser.name}
                aspectRatio="1:1"
                rounded="full"
                goldBorder
              />
            </div>
            <div className="min-w-0">
              <p className="font-serif text-2xl font-semibold text-white truncate">
                {authUser.name}
              </p>
              <p className="text-xs text-white/75 mt-0.5 truncate">{authUser.roleTitle}</p>
              <p className="text-xs font-mono text-[#D8BC83] mt-1 truncate">{authUser.email}</p>
            </div>
          </div>
          <div className="pt-3 border-t border-white/15 grid grid-cols-3 gap-2 text-center">
            <div className="bg-black/20 rounded-lg p-2.5">
              <p className="font-mono tabular-nums text-lg font-bold text-[#D8BC83]">
                {masterCount}
              </p>
              <p className="text-[11px] text-white/70">Master</p>
            </div>
            <div className="bg-black/20 rounded-lg p-2.5">
              <p className="font-mono tabular-nums text-lg font-bold text-white">
                {gestoresCount}
              </p>
              <p className="text-[11px] text-white/70">Gestores</p>
            </div>
            <div className="bg-black/20 rounded-lg p-2.5">
              <p className="font-mono tabular-nums text-lg font-bold text-white">
                {usuariosCount}
              </p>
              <p className="text-[11px] text-white/70">Usuários</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white border border-[#1C2421]/10 rounded-xl p-4 sm:p-6 space-y-4">
          <h3 className="font-serif text-2xl font-semibold text-[#11382B]">
            Regras Oficiais da Política de Acesso
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#F8F7F4] border border-[#C5A467]/60 rounded-lg p-4 space-y-1.5">
              <p className="text-xs font-mono font-bold text-[#11382B] flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-[#C5A467]" />
                1. ACESSO MASTER
              </p>
              <p className="text-xs text-[#1C2421]/80 leading-relaxed">
                Conta soberana com controle total do portal. Não pode ser excluída nem rebaixada, aprova gestores e possui histórico integral de alterações.
              </p>
            </div>

            <div className="bg-[#F8F7F4] border border-[#1C2421]/12 rounded-lg p-4 space-y-1.5">
              <p className="text-xs font-mono font-bold text-[#11382B] flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#C5A467]" />
                2. MULTI-GESTORES
              </p>
              <p className="text-xs text-[#1C2421]/80 leading-relaxed">
                Mais de um Gestor pode atuar na plataforma. Somente Master ou Gestor ativo pode alterar conteúdos e incluir, corrigir ou excluir usuários e gestores.
              </p>
            </div>

            <div className="bg-[#F8F7F4] border border-[#1C2421]/12 rounded-lg p-4 space-y-1.5">
              <p className="text-xs font-mono font-bold text-[#11382B] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#C5A467]" />
                3. USUÁRIOS (COLABORADORES)
              </p>
              <p className="text-xs text-[#1C2421]/80 leading-relaxed">
                Acesso às funcionalidades exclusivas de colaborador (leitura, desafios, ranking, felicitações, férias e resgates), sem permissão administrativa.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Master-Only Gestores Management, Privileges & Promotion Component */}
      {authUser.accessRole === 'master' ? (
        <MasterManagersPanel
          adminToken={adminToken}
          accounts={accounts}
          onUpdated={(nextAccounts, nextLogs) => {
            setAccounts(nextAccounts);
            setAuditLogs(nextLogs);
            onDirectoryChanged?.();
          }}
          onNotify={onNotify}
        />
      ) : (
        <div className="bg-[#F8F7F4] border border-[#C5A467]/40 rounded-xl p-5 flex items-center gap-3 text-xs text-[#11382B]">
          <Crown className="w-5 h-5 text-[#C5A467] shrink-0" />
          <p>
            A edição de privilégios, suspensão de gestores e promoção de colaboradores a gestor são exclusivas do{' '}
            <strong>Gestor Master</strong>.
          </p>
        </div>
      )}

      {/* Filters & Accounts Directory */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-white border border-[#1C2421]/10 rounded-lg">
            {(
              [
                { id: 'todos', label: `Todos (${accounts.length})` },
                { id: 'gestores', label: `Master & Gestores (${masterCount + gestoresCount})` },
                { id: 'usuarios', label: `Usuários (${usuariosCount})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  roleFilter === tab.id
                    ? 'bg-[#11382B] text-white'
                    : 'text-[#1C2421]/70 hover:text-[#11382B]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-[#1C2421]/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, e-mail, cargo ou obra..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#1C2421]/15 bg-white text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
            />
          </div>
        </div>

        {loading ? (
          <div className="bg-white border border-[#1C2421]/10 rounded-xl p-10 flex items-center justify-center gap-2 text-sm text-[#11382B]">
            <Loader2 className="w-4 h-4 animate-spin text-[#C5A467]" />
            Carregando diretório de usuários e gestores...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredAccounts.map((acc) => {
              const isMaster = acc.accessRole === 'master';
              const isGestor = acc.accessRole === 'gestor';
              const canEditThis =
                authUser.accessRole === 'master' ||
                acc.id === authUser.id ||
                (!isMaster && !isGestor && canManageUsers);
              const canDeleteThis =
                !isMaster &&
                acc.id !== authUser.id &&
                (authUser.accessRole === 'master' || (!isGestor && canManageUsers));

              return (
                <div
                  key={acc.id}
                  className={`bg-white border rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4 ${
                    isMaster
                      ? 'border-[#C5A467]'
                      : isGestor
                        ? 'border-[#11382B]/40'
                        : 'border-[#1C2421]/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 shrink-0">
                      <StandardizedImage
                        src={acc.photoUrl}
                        alt={acc.name}
                        aspectRatio="1:1"
                        rounded="full"
                        goldBorder={isMaster || isGestor}
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span
                          className={`font-mono font-bold uppercase tracking-wider ${
                            isMaster
                              ? 'text-[#C5A467]'
                              : isGestor
                                ? 'text-[#11382B]'
                                : 'text-[#1C2421]/65'
                          }`}
                        >
                          {isMaster
                            ? 'Acesso Master'
                            : isGestor
                              ? 'Gestor Autorizado'
                              : 'Usuário Colaborador'}
                        </span>
                        <span
                          className={`font-mono text-[11px] font-semibold ${
                            acc.status === 'Ativo' ? 'text-emerald-800' : 'text-red-700'
                          }`}
                        >
                          {acc.status}
                        </span>
                      </div>

                      <h4 className="font-serif text-xl font-semibold text-[#11382B] truncate">
                        {acc.name}
                      </h4>
                      <p className="text-xs text-[#1C2421]/80 truncate">{acc.roleTitle}</p>
                      <p className="text-xs font-mono text-[#11382B]/80 truncate">{acc.email}</p>
                      <p className="text-[11px] text-[#1C2421]/60 truncate">{acc.sectorOrSite}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1C2421]/10 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#1C2421]/60">
                    <div className="truncate">
                      {acc.updatedByName
                        ? `Corrigido por ${acc.updatedByName} (${acc.updatedAt})`
                        : `Incluído por ${acc.createdByName} (${acc.createdAt})`}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {canEditThis && (
                        <button
                          type="button"
                          onClick={() => openEditModal(acc)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#11382B]/25 text-xs font-medium text-[#11382B] hover:bg-[#11382B]/5"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#C5A467]" />
                          Corrigir
                        </button>
                      )}
                      {canDeleteThis ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteAccount(acc)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-red-200 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Excluir
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-[#1C2421]/45">
                          {isMaster ? 'Protegido (Master)' : 'Sessão atual'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Audit Trail: Who Altered What */}
      <div className="bg-white border border-[#1C2421]/10 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1C2421]/10 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-2xl font-semibold text-[#11382B]">
              Registro de Alterações · Quem Fez Cada Ação
            </h3>
            <p className="text-xs text-[#1C2421]/65 mt-0.5">
              Rastreabilidade completa do Gestor ou Master responsável por inclusões, correções, exclusões e publicações
            </p>
          </div>
          <History className="w-5 h-5 text-[#C5A467]" />
        </div>

        <div className="divide-y divide-[#1C2421]/8 max-h-80 overflow-y-auto">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="min-w-0">
                <p className="font-semibold text-[#11382B]">
                  {log.actorName}{' '}
                  <span className="font-mono font-normal text-[#C5A467]">
                    ({log.actorRole === 'master' ? 'Master' : 'Gestor'} · {log.actorEmail})
                  </span>
                </p>
                <p className="text-[#1C2421]/75 mt-0.5">
                  {log.action} · <span className="font-medium">{log.targetLabel}</span>
                </p>
              </div>
              <span className="font-mono tabular-nums text-[#1C2421]/55 shrink-0">
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Create / Correct Modal */}
      {editorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#11382B]/75 backdrop-blur-sm p-3 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl bg-[#F8F7F4] border border-[#C5A467]/60 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 bg-[#11382B] text-white shrink-0">
              <h3 className="font-serif text-lg sm:text-xl font-semibold truncate">
                {editingAccount
                  ? `Corrigir Cadastro · ${editingAccount.name}`
                  : 'Incluir Novo Usuário ou Gestor'}
              </h3>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="p-1.5 rounded-lg text-white/75 hover:text-white hover:bg-white/10 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-4 sm:p-6 overflow-y-auto space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 shrink-0">
                  <StandardizedImage
                    src={photoUrl}
                    alt="Foto do cadastro"
                    aspectRatio="1:1"
                    rounded="full"
                    goldBorder
                  />
                </div>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setCropOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#11382B]/25 bg-white text-xs font-medium text-[#11382B] hover:bg-[#11382B]/5"
                  >
                    <ImagePlus className="w-3.5 h-3.5 text-[#C5A467]" />
                    Ajustar Foto (1:1 Automático)
                  </button>
                  <p className="text-[11px] text-[#1C2421]/60">
                    Enquadramento automático padrão Cavalcante &amp; Rolim.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome do colaborador ou gestor"
                    className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
                    E-mail Corporativo
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@cavalcanterolim.com.br"
                    className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
                    Cargo / Função
                  </label>
                  <input
                    type="text"
                    required
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="Ex: Analista de RH, Engenheiro Civil..."
                    className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
                    Unidade / Obra / Setor
                  </label>
                  <input
                    type="text"
                    list="cr-sector-list"
                    required
                    value={sectorOrSite}
                    onChange={(e) => setSectorOrSite(e.target.value)}
                    className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                  />
                  <datalist id="cr-sector-list">
                    {SECTOR_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
                    Nível de Permissão
                  </label>
                  {editingAccount?.accessRole === 'master' ? (
                    <div className="rounded-lg border border-[#C5A467] bg-white px-3.5 py-2 text-sm font-semibold text-[#11382B]">
                      Acesso Master (Fixo)
                    </div>
                  ) : (
                    <select
                      value={accessRole}
                      onChange={(e) => setAccessRole(e.target.value as AccessRole)}
                      className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                    >
                      <option value="usuario">Usuário (Somente Colaborador)</option>
                      {(authUser.accessRole === 'master' || accessRole === 'gestor') && (
                        <option value="gestor">Gestor (Acesso Completo ao Portal)</option>
                      )}
                    </select>
                  )}
                </div>

                {editingAccount && editingAccount.accessRole !== 'master' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
                      Situação do Acesso
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as AccountStatus)}
                      className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Suspenso">Suspenso</option>
                      <option value="Inativo">Inativo (Bloqueado)</option>
                    </select>
                  </div>
                )}
              </div>

              {accessRole !== 'master' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
                    {editingAccount?.hasPassword
                      ? `Redefinir Senha do ${accessRole === 'gestor' ? 'Gestor' : 'Colaborador'} (opcional)`
                      : `Senha de Acesso do ${accessRole === 'gestor' ? 'Gestor' : 'Colaborador'} (mínimo 6 caracteres)`}
                  </label>
                  <input
                    type="password"
                    required={!editingAccount}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      editingAccount?.hasPassword
                        ? 'Deixe em branco para manter a senha atual'
                        : `Crie a senha inicial deste ${accessRole === 'gestor' ? 'Gestor' : 'Colaborador'}`
                    }
                    className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                  />
                </div>
              )}

              {formError && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1C2421]/10">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-[#1C2421]/70 hover:text-[#1C2421]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#11382B] text-white text-sm font-medium hover:bg-[#11382B]/90 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingAccount ? 'Salvar Correção' : 'Confirmar Inclusão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ImageAutoCropModal
        isOpen={cropOpen}
        title="Foto de Perfil do Cadastro (1:1)"
        aspectRatio="1:1"
        currentImageUrl={photoUrl}
        onSave={(dataUrl) => setPhotoUrl(dataUrl)}
        onClose={() => setCropOpen(false)}
      />
    </div>
  );
};
