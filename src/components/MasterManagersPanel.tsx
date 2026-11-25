import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Ban,
  Check,
  CheckCircle2,
  Crown,
  KeyRound,
  Loader2,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
  X,
} from 'lucide-react';
import {
  AuditLogEntry,
  ManagedAccount,
  ManagerPrivileges,
} from '../types/portal';
import { StandardizedImage } from './StandardizedImage';

interface MasterManagersPanelProps {
  adminToken: string;
  accounts: ManagedAccount[];
  onUpdated: (accounts: ManagedAccount[], auditLogs: AuditLogEntry[]) => void;
  onNotify: (message: string) => void;
}

const DEFAULT_PRIVILEGES: ManagerPrivileges = {
  canEditContent: true,
  canDeleteContent: true,
  canImportDocuments: true,
  canManageUsers: true,
};

const PRIVILEGE_ITEMS: {
  key: keyof ManagerPrivileges;
  label: string;
  description: string;
}[] = [
  {
    key: 'canEditContent',
    label: 'Inserir e Corrigir Conteúdos',
    description: 'Comunicados, obras, benefícios, férias, aniversariantes e manuais',
  },
  {
    key: 'canDeleteContent',
    label: 'Excluir Registros',
    description: 'Remover publicações, itens de módulos e documentos',
  },
  {
    key: 'canImportDocuments',
    label: 'Importação Universal & IA',
    description: 'Enviar arquivos PDF/Office e gerar desafios interativos',
  },
  {
    key: 'canManageUsers',
    label: 'Gerir Colaboradores',
    description: 'Incluir, corrigir e excluir usuários colaboradores',
  },
];

const SECTOR_OPTIONS = [
  'Matriz - Cavalcante e Rolim Empreendimentos',
  'Manta - Cavalcante e Rolim Design SPE',
  'Watal Patacho Eco Boutique Residence SPE',
  'Residencial Aurora Signature',
];

export const MasterManagersPanel: React.FC<MasterManagersPanelProps> = ({
  adminToken,
  accounts,
  onUpdated,
  onNotify,
}) => {
  const [managerFilter, setManagerFilter] = useState<'todos' | 'ativos' | 'suspensos'>('todos');
  const [suspendingId, setSuspendingId] = useState<string | null>(null);

  // Edit Privileges Modal State
  const [editingManager, setEditingManager] = useState<ManagedAccount | null>(null);
  const [editRoleTitle, setEditRoleTitle] = useState('');
  const [editSectorOrSite, setEditSectorOrSite] = useState('');
  const [editPrivileges, setEditPrivileges] = useState<ManagerPrivileges>({ ...DEFAULT_PRIVILEGES });
  const [editPassword, setEditPassword] = useState('');
  const [savingPrivileges, setSavingPrivileges] = useState(false);
  const [editError, setEditError] = useState('');

  // Dedicated Promote Collaborator to Gestor Form State
  const eligibleCollaborators = useMemo(
    () => accounts.filter((a) => a.accessRole === 'usuario' && a.status === 'Ativo'),
    [accounts]
  );

  const [selectedCollabId, setSelectedCollabId] = useState('');
  const [promoRoleTitle, setPromoRoleTitle] = useState('');
  const [promoSector, setPromoSector] = useState(SECTOR_OPTIONS[0]);
  const [promoPrivileges, setPromoPrivileges] = useState<ManagerPrivileges>({
    ...DEFAULT_PRIVILEGES,
  });
  const [promoPassword, setPromoPassword] = useState('');
  const [promoting, setPromoting] = useState(false);
  const [promoError, setPromoError] = useState('');

  const selectedCollaborator = useMemo(
    () => eligibleCollaborators.find((c) => c.id === selectedCollabId) || null,
    [eligibleCollaborators, selectedCollabId]
  );

  useEffect(() => {
    if (eligibleCollaborators.length === 0) {
      setSelectedCollabId('');
      return;
    }
    const stillExists = eligibleCollaborators.some((c) => c.id === selectedCollabId);
    if (!stillExists) {
      const first = eligibleCollaborators[0];
      setSelectedCollabId(first.id);
      setPromoRoleTitle(`Gestor · ${first.roleTitle}`);
      setPromoSector(first.sectorOrSite);
      setPromoPassword('');
      setPromoError('');
    }
  }, [eligibleCollaborators, selectedCollabId]);

  const handleSelectCollaboratorForPromo = (id: string) => {
    setSelectedCollabId(id);
    setPromoError('');
    setPromoPassword('');
    const found = eligibleCollaborators.find((c) => c.id === id);
    if (found) {
      setPromoRoleTitle(`Gestor · ${found.roleTitle}`);
      setPromoSector(found.sectorOrSite);
    }
  };

  const allManagers = useMemo(
    () => accounts.filter((a) => a.accessRole === 'master' || a.accessRole === 'gestor'),
    [accounts]
  );

  const filteredManagers = useMemo(
    () =>
      allManagers.filter((m) => {
        if (managerFilter === 'ativos') return m.status === 'Ativo';
        if (managerFilter === 'suspensos') return m.status !== 'Ativo';
        return true;
      }),
    [allManagers, managerFilter]
  );

  const activeGestoresCount = allManagers.filter(
    (m) => m.accessRole === 'gestor' && m.status === 'Ativo'
  ).length;
  const suspendedGestoresCount = allManagers.filter(
    (m) => m.accessRole === 'gestor' && m.status !== 'Ativo'
  ).length;

  const openPrivilegeEditor = (manager: ManagedAccount) => {
    setEditingManager(manager);
    setEditRoleTitle(manager.roleTitle);
    setEditSectorOrSite(manager.sectorOrSite);
    setEditPrivileges(manager.privileges ? { ...manager.privileges } : { ...DEFAULT_PRIVILEGES });
    setEditPassword('');
    setEditError('');
  };

  const handleSavePrivileges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingManager) return;
    setEditError('');
    setSavingPrivileges(true);
    try {
      const res = await fetch(
        `/api/access/managers/${encodeURIComponent(editingManager.id)}/privileges`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            roleTitle: editRoleTitle,
            sectorOrSite: editSectorOrSite,
            privileges: editPrivileges,
            password: editPassword.trim() || undefined,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao atualizar privilégios do gestor.');
      }
      onUpdated(data.accounts || [], data.auditLogs || []);
      setEditingManager(null);
      onNotify(`Privilégios do gestor ${editingManager.name} atualizados pelo Acesso Master.`);
    } catch (err: any) {
      setEditError(err?.message || 'Não foi possível salvar os privilégios.');
    } finally {
      setSavingPrivileges(false);
    }
  };

  const handleToggleSuspend = async (manager: ManagedAccount) => {
    const targetStatus = manager.status === 'Ativo' ? 'Suspenso' : 'Ativo';
    setSuspendingId(manager.id);
    try {
      const res = await fetch(
        `/api/access/managers/${encodeURIComponent(manager.id)}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ status: targetStatus }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Não foi possível alterar o status do gestor.');
      }
      onUpdated(data.accounts || [], data.auditLogs || []);
      onNotify(
        targetStatus === 'Suspenso'
          ? `Acesso de ${manager.name} suspenso imediatamente.`
          : `Acesso de ${manager.name} reativado com sucesso.`
      );
    } catch (err: any) {
      onNotify(err?.message || 'Falha ao atualizar status do gestor.');
    } finally {
      setSuspendingId(null);
    }
  };

  const handlePromoteCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollaborator) return;
    setPromoError('');

    if (!selectedCollaborator.hasPassword && promoPassword.trim().length < 6) {
      setPromoError(
        'Este colaborador ainda não ativou senha própria. Defina uma senha inicial de no mínimo 6 caracteres.'
      );
      return;
    }

    setPromoting(true);
    try {
      const res = await fetch('/api/access/managers/promote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          collaboratorId: selectedCollaborator.id,
          roleTitle: promoRoleTitle,
          sectorOrSite: promoSector,
          privileges: promoPrivileges,
          password: promoPassword.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Não foi possível concluir a promoção a Gestor.');
      }
      onUpdated(data.accounts || [], data.auditLogs || []);
      setPromoPassword('');
      onNotify(`${selectedCollaborator.name} promovido(a) a Gestor com sucesso!`);
    } catch (err: any) {
      setPromoError(err?.message || 'Erro ao promover colaborador.');
    } finally {
      setPromoting(false);
    }
  };

  return (
    <section
      aria-labelledby="master-managers-title"
      className="bg-white border border-[#C5A467]/60 rounded-2xl overflow-hidden shadow-xs"
    >
      {/* Master Panel Header */}
      <div className="bg-[#11382B] text-white px-4 sm:px-6 py-5 border-b border-[#C5A467]/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#D8BC83] flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 shrink-0" />
            Painel Exclusivo do Gestor Master
          </p>
          <h3 id="master-managers-title" className="font-serif text-2xl sm:text-3xl font-semibold mt-1">
            Gestores Cadastrados, Privilégios &amp; Promoções
          </h3>
          <p className="text-xs text-white/75 mt-1">
            Visualize todos os gestores, ajuste privilégios granulares, suspenda acessos instantaneamente ou promova colaboradores.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 shrink-0 text-center">
          <div className="bg-black/25 border border-[#C5A467]/30 rounded-lg px-2.5 sm:px-3.5 py-2">
            <p className="font-mono tabular-nums text-lg font-bold text-[#D8BC83]">
              {activeGestoresCount + 1}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-white/70">Ativos</p>
          </div>
          <div className="bg-black/25 border border-white/15 rounded-lg px-2.5 sm:px-3.5 py-2">
            <p className="font-mono tabular-nums text-lg font-bold text-white">
              {suspendedGestoresCount}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-white/70">Suspensos</p>
          </div>
          <div className="bg-black/25 border border-white/15 rounded-lg px-2.5 sm:px-3.5 py-2">
            <p className="font-mono tabular-nums text-lg font-bold text-white">
              {eligibleCollaborators.length}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-white/70">Elegíveis</p>
          </div>
        </div>
      </div>

      {/* Main Split Workspace: Left = Registered Gestores List | Right = Dedicated Promotion Form */}
      <div className="p-4 sm:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Column 1: List of All Registered Gestores */}
        <div className="xl:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="font-serif text-xl font-semibold text-[#11382B]">
              Lista de Gestores Cadastrados ({filteredManagers.length})
            </h4>

            <div className="inline-flex items-center p-1 bg-[#F8F7F4] border border-[#1C2421]/12 rounded-lg">
              {(
                [
                  { id: 'todos', label: 'Todos' },
                  { id: 'ativos', label: 'Ativos' },
                  { id: 'suspensos', label: 'Suspensos' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setManagerFilter(tab.id)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    managerFilter === tab.id
                      ? 'bg-[#11382B] text-white'
                      : 'text-[#1C2421]/70 hover:text-[#11382B]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3.5">
            {filteredManagers.map((mgr) => {
              const isMaster = mgr.accessRole === 'master';
              const isSuspended = mgr.status !== 'Ativo';
              const privs = mgr.privileges || DEFAULT_PRIVILEGES;

              return (
                <div
                  key={mgr.id}
                  className={`rounded-xl border p-4 sm:p-5 space-y-4 transition-colors ${
                    isMaster
                      ? 'bg-[#F8F7F4] border-[#C5A467]'
                      : isSuspended
                        ? 'bg-red-50/40 border-red-200'
                        : 'bg-[#F8F7F4]/60 border-[#1C2421]/15'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-12 h-12 shrink-0">
                        <StandardizedImage
                          src={mgr.photoUrl}
                          alt={mgr.name}
                          aspectRatio="1:1"
                          rounded="full"
                          goldBorder={!isSuspended}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                          <span
                            className={`font-bold uppercase tracking-wider ${
                              isMaster ? 'text-[#C5A467]' : 'text-[#11382B]'
                            }`}
                          >
                            {isMaster ? 'Acesso Master Soberano' : 'Gestor Cadastrado'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={`font-semibold ${
                              mgr.status === 'Ativo'
                                ? 'text-emerald-800'
                                : 'text-red-700'
                            }`}
                          >
                            {mgr.status}
                          </span>
                        </div>
                        <p className="font-serif text-xl font-semibold text-[#11382B] truncate mt-0.5">
                          {mgr.name}
                        </p>
                        <p className="text-xs text-[#1C2421]/80 truncate">{mgr.roleTitle}</p>
                        <p className="text-[11px] font-mono text-[#11382B]/75 truncate mt-0.5">
                          {mgr.email} · {mgr.sectorOrSite}
                        </p>
                      </div>
                    </div>

                    {!isMaster && (
                      <div className="flex flex-wrap sm:flex-col items-stretch sm:items-end gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => openPrivilegeEditor(mgr)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11382B] text-white text-xs font-semibold hover:bg-[#11382B]/90 transition-colors whitespace-nowrap"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-[#D8BC83]" />
                          Editar Privilégios
                        </button>

                        <button
                          type="button"
                          disabled={suspendingId === mgr.id}
                          onClick={() => handleToggleSuspend(mgr)}
                          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap disabled:opacity-50 ${
                            isSuspended
                              ? 'border-emerald-700/30 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              : 'border-red-300 bg-white text-red-700 hover:bg-red-50'
                          }`}
                        >
                          {suspendingId === mgr.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : isSuspended ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Ban className="w-3.5 h-3.5" />
                          )}
                          {isSuspended ? 'Reativar Acesso' : 'Suspender Acesso'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Privileges Matrix Summary */}
                  <div className="pt-3 border-t border-[#1C2421]/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                    {PRIVILEGE_ITEMS.map((item) => {
                      const enabled = isMaster ? true : Boolean(privs[item.key]);
                      return (
                        <div
                          key={item.key}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border ${
                            enabled
                              ? 'bg-white border-[#C5A467]/40 text-[#11382B] font-medium'
                              : 'bg-black/5 border-transparent text-[#1C2421]/45 line-through'
                          }`}
                        >
                          <Check
                            className={`w-3 h-3 shrink-0 ${
                              enabled ? 'text-[#C5A467]' : 'text-[#1C2421]/30'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Dedicated Collaborator-to-Gestor Promotion Form */}
        <div className="xl:col-span-5 bg-[#F8F7F4] border border-[#C5A467]/55 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="border-b border-[#1C2421]/10 pb-3">
            <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#C5A467] font-semibold">
              Formulário Dedicado · Promoção
            </p>
            <h4 className="font-serif text-xl font-semibold text-[#11382B] mt-0.5 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#C5A467]" />
              Promover Colaborador a Gestor
            </h4>
            <p className="text-xs text-[#1C2421]/70 mt-1">
              Selecione um colaborador ativo, defina o escopo de privilégios e libere acesso administrativo.
            </p>
          </div>

          {eligibleCollaborators.length === 0 ? (
            <div className="bg-white border border-[#1C2421]/10 rounded-lg p-5 text-xs text-[#1C2421]/70 text-center">
              Todos os colaboradores ativos cadastrados já foram promovidos ou não há colaboradores disponíveis no momento.
            </div>
          ) : (
            <form onSubmit={handlePromoteCollaborator} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1.5">
                  Colaborador Selecionado
                </label>
                <select
                  value={selectedCollabId}
                  onChange={(e) => handleSelectCollaboratorForPromo(e.target.value)}
                  className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2.5 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                >
                  {eligibleCollaborators.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.roleTitle}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCollaborator && (
                <div className="bg-white border border-[#1C2421]/12 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-11 h-11 shrink-0">
                    <StandardizedImage
                      src={selectedCollaborator.photoUrl}
                      alt={selectedCollaborator.name}
                      aspectRatio="1:1"
                      rounded="full"
                      goldBorder
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#11382B] truncate">
                      {selectedCollaborator.name}
                    </p>
                    <p className="text-[11px] text-[#1C2421]/70 truncate">
                      {selectedCollaborator.email}
                    </p>
                    <p className="text-[10px] font-mono text-[#C5A467] mt-0.5">
                      {selectedCollaborator.hasPassword
                        ? 'Possui senha ativa no portal'
                        : 'Sem senha definida · Crie uma senha abaixo'}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
                    Cargo / Função como Gestor
                  </label>
                  <input
                    type="text"
                    required
                    value={promoRoleTitle}
                    onChange={(e) => setPromoRoleTitle(e.target.value)}
                    placeholder="Ex: Gestor de Obras / Coordenação de RH"
                    className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
                    Obra / Setor de Atuação
                  </label>
                  <input
                    type="text"
                    list="master-promo-sectors"
                    required
                    value={promoSector}
                    onChange={(e) => setPromoSector(e.target.value)}
                    className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                  />
                  <datalist id="master-promo-sectors">
                    {SECTOR_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Granular Privileges Checkboxes */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B]">
                  Privilégios Atribuídos ao Novo Gestor
                </label>
                <div className="space-y-2">
                  {PRIVILEGE_ITEMS.map((item) => (
                    <label
                      key={item.key}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-[#1C2421]/12 cursor-pointer hover:border-[#C5A467] transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={promoPrivileges[item.key]}
                        onChange={(e) =>
                          setPromoPrivileges((prev) => ({
                            ...prev,
                            [item.key]: e.target.checked,
                          }))
                        }
                        className="mt-0.5 accent-[#11382B]"
                      />
                      <span className="text-xs leading-snug">
                        <strong className="block text-[#11382B]">{item.label}</strong>
                        <span className="text-[11px] text-[#1C2421]/65">{item.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
                  {selectedCollaborator?.hasPassword
                    ? 'Nova Senha de Gestor (opcional · mantém atual se vazio)'
                    : 'Definir Senha Inicial do Novo Gestor (mín. 6 caracteres)'}
                </label>
                <input
                  type="password"
                  required={!selectedCollaborator?.hasPassword}
                  value={promoPassword}
                  onChange={(e) => setPromoPassword(e.target.value)}
                  placeholder={
                    selectedCollaborator?.hasPassword
                      ? 'Deixe em branco para manter a senha atual'
                      : 'Crie a senha de acesso administrativo'
                  }
                  className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                />
              </div>

              {promoError && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {promoError}
                </p>
              )}

              <button
                type="submit"
                disabled={promoting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#C5A467] text-[#11382B] text-xs font-bold hover:bg-[#D8BC83] disabled:opacity-50 transition-colors"
              >
                {promoting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUpRight className="w-4 h-4" />
                )}
                Confirmar Promoção a Gestor
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Modal: Edit Gestor Privileges & Password */}
      {editingManager && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#11382B]/75 backdrop-blur-sm p-3 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-privileges-title"
        >
          <div className="w-full max-w-lg bg-[#F8F7F4] border border-[#C5A467]/60 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 bg-[#11382B] text-white shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <ShieldCheck className="w-4 h-4 text-[#D8BC83] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#D8BC83]">
                    Controle Master de Privilégios
                  </p>
                  <h3 id="edit-privileges-title" className="font-serif text-lg sm:text-xl font-semibold truncate">
                    Privilégios · {editingManager.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingManager(null)}
                className="p-1.5 rounded-lg text-white/75 hover:text-white hover:bg-white/10 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrivileges} className="p-4 sm:p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
                    Cargo do Gestor
                  </label>
                  <input
                    type="text"
                    required
                    value={editRoleTitle}
                    onChange={(e) => setEditRoleTitle(e.target.value)}
                    className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
                    Setor / Obra
                  </label>
                  <input
                    type="text"
                    required
                    value={editSectorOrSite}
                    onChange={(e) => setEditSectorOrSite(e.target.value)}
                    className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B]">
                  Permissões Administrativas Permitidas
                </label>
                {PRIVILEGE_ITEMS.map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start gap-2.5 p-3 rounded-lg bg-white border border-[#1C2421]/12 cursor-pointer hover:border-[#C5A467] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={editPrivileges[item.key]}
                      onChange={(e) =>
                        setEditPrivileges((prev) => ({
                          ...prev,
                          [item.key]: e.target.checked,
                        }))
                      }
                      className="mt-0.5 accent-[#11382B]"
                    />
                    <span className="text-xs leading-snug">
                      <strong className="block text-[#11382B]">{item.label}</strong>
                      <span className="text-[11px] text-[#1C2421]/65">{item.description}</span>
                    </span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#C5A467]" />
                  {editingManager.hasPassword
                    ? 'Redefinir Senha do Gestor (opcional)'
                    : 'Definir Senha do Gestor (opcional · mín. 6 caracteres)'}
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Deixe em branco para manter inalterada"
                  className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                />
              </div>

              {editError && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {editError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1C2421]/10">
                <button
                  type="button"
                  onClick={() => setEditingManager(null)}
                  className="px-4 py-2 rounded-lg text-sm text-[#1C2421]/70 hover:text-[#1C2421]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingPrivileges}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#11382B] text-white text-xs font-semibold hover:bg-[#11382B]/90 disabled:opacity-50"
                >
                  {savingPrivileges ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 text-[#D8BC83]" />
                  )}
                  Salvar Privilégios do Gestor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
