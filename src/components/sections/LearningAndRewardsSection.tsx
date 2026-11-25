import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Compass,
  Download,
  Edit3,
  ExternalLink,
  FileUp,
  Gamepad2,
  Gift,
  ImagePlus,
  Mail,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  CollaboratorProfile,
  DepartmentContact,
  GamificationRule,
  InteractiveChallenge,
  ManualArea,
  ManualDocument,
  OnboardingStep,
  RewardItem,
} from '../../types/portal';
import { AdminEditEntity } from '../AdminEditModal';
import { StandardizedImage } from '../StandardizedImage';

interface OnboardingSectionProps {
  steps: OnboardingStep[];
  profile: CollaboratorProfile;
  isAdmin: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canImport?: boolean;
  onOpenStep: (step: OnboardingStep) => void;
  onOpenChallenge: (challenge: InteractiveChallenge) => void;
  onOpenEdit: (entity: AdminEditEntity) => void;
  onDelete: (id: string) => void;
  onOpenDocumentImport: (target: 'comunicado' | 'manual' | 'onboarding') => void;
}

export const OnboardingSection: React.FC<OnboardingSectionProps> = ({
  steps,
  profile,
  isAdmin,
  canEdit,
  canDelete,
  canImport,
  onOpenStep,
  onOpenChallenge,
  onOpenEdit,
  onDelete,
  onOpenDocumentImport,
}) => {
  const allowEdit = canEdit ?? isAdmin;
  const allowDelete = canDelete ?? isAdmin;
  const allowImport = canImport ?? isAdmin;
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
  const completedCount = sortedSteps.filter((s) =>
    profile.completedOnboardingIds.includes(s.id)
  ).length;
  const pct = sortedSteps.length > 0 ? Math.round((completedCount / sortedSteps.length) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#1C2421]/12 pb-5">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#C5A467] font-semibold">
            Integração de Novos Talentos · +150 pts ao concluir tudo
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#11382B] mt-1">
            Trilha de Onboarding Signature Spaces
          </h2>
        </div>

        {(allowEdit || allowImport) && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {allowImport && (
              <button
                type="button"
                onClick={() => onOpenDocumentImport('onboarding')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#11382B]/30 text-xs font-medium text-[#11382B] hover:bg-[#11382B]/5 whitespace-nowrap"
              >
                <FileUp className="w-3.5 h-3.5 text-[#C5A467]" />
                Importar Módulo
              </button>
            )}
            {allowEdit && (
              <button
                type="button"
                onClick={() => onOpenEdit({ kind: 'onboarding' })}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#11382B] text-white text-xs font-medium hover:bg-[#11382B]/90 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 text-[#D8BC83]" />
                Nova Etapa
              </button>
            )}
          </div>
        )}
      </div>

      {/* Progress Banner */}
      <div className="bg-[#11382B] text-white rounded-xl p-4 sm:p-6 border border-[#C5A467]/45 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-[#D8BC83]" />
            <span className="font-serif text-xl font-semibold">
              Progresso da sua Integração C&amp;R
            </span>
          </div>
          <span className="font-mono tabular-nums text-sm font-semibold text-[#D8BC83]">
            {completedCount} de {sortedSteps.length} etapas ({pct}%)
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/15 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#C5A467] to-[#D8BC83] transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-white/75">
          {pct === 100
            ? 'Parabéns! Você completou todas as etapas do Onboarding Signature e conquistou o bônus de +150 pts.'
            : 'Conclua todas as etapas abaixo para desbloquear o bônus de +150 pts Signature.'}
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {sortedSteps.map((step) => {
          const isDone = profile.completedOnboardingIds.includes(step.id);
          return (
            <div
              key={step.id}
              className="bg-white border border-[#1C2421]/10 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-11 h-11 rounded-lg bg-[#11382B] text-[#D8BC83] border border-[#C5A467]/50 flex items-center justify-center font-mono font-semibold text-sm shrink-0">
                  {String(step.order).padStart(2, '0')}
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#1C2421]/60">
                    <span className="font-mono tabular-nums">{step.estimatedMinutes} min de leitura</span>
                    <span aria-hidden="true">·</span>
                    <span className={isDone ? 'text-emerald-800 font-semibold' : 'text-[#C5A467] font-medium'}>
                      {isDone ? 'Etapa Concluída' : 'Pendente'}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-[#11382B]">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#1C2421]/75 leading-relaxed">{step.subtitle}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenStep(step)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    isDone
                      ? 'bg-[#F8F7F4] text-[#11382B] border border-[#11382B]/20 hover:bg-[#11382B]/5'
                      : 'bg-[#11382B] text-white hover:bg-[#11382B]/90'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D8BC83]" />
                  {isDone ? 'Rever Conteúdo' : 'Estudar Etapa'}
                </button>

                {step.challenge && (
                  <button
                    type="button"
                    onClick={() => onOpenChallenge(step.challenge!)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#C5A467] text-xs font-medium text-[#11382B] hover:bg-[#C5A467]/10 whitespace-nowrap"
                  >
                    <Gamepad2 className="w-3.5 h-3.5 text-[#C5A467]" />
                    Mini-Game
                  </button>
                )}

                {(allowEdit || allowDelete) && (
                  <>
                    {allowEdit && (
                      <button
                        type="button"
                        onClick={() => onOpenEdit({ kind: 'onboarding', item: step })}
                        className="p-2 rounded-lg text-[#11382B] hover:bg-[#11382B]/10"
                        title="Editar Etapa"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    {allowDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(step.id)}
                        className="p-2 rounded-lg text-red-700 hover:bg-red-50"
                        title="Excluir Etapa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ManualsSectionProps {
  manuals: ManualDocument[];
  profile: CollaboratorProfile;
  sessionToken?: string | null;
  isAdmin: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canImport?: boolean;
  onOpenManual: (manual: ManualDocument) => void;
  onOpenChallenge: (challenge: InteractiveChallenge) => void;
  onOpenEdit: (entity: AdminEditEntity) => void;
  onDelete: (id: string) => void;
  onOpenDocumentImport: (target: 'comunicado' | 'manual' | 'onboarding') => void;
  onChangeImage: (manual: ManualDocument) => void;
}

export const ManualsSection: React.FC<ManualsSectionProps> = ({
  manuals,
  profile,
  sessionToken,
  isAdmin,
  canEdit,
  canDelete,
  canImport,
  onOpenManual,
  onOpenChallenge,
  onOpenEdit,
  onDelete,
  onOpenDocumentImport,
  onChangeImage,
}) => {
  const allowEdit = canEdit ?? isAdmin;
  const allowDelete = canDelete ?? isAdmin;
  const allowImport = canImport ?? isAdmin;
  const [areaFilter, setAreaFilter] = useState<'Todas' | ManualArea>('Todas');
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadProtectedFile = async (manual: ManualDocument) => {
    if (!manual.originalFileId || !sessionToken) return;
    setDownloadingId(manual.id);
    try {
      const res = await fetch(
        `/api/documents/download/${encodeURIComponent(manual.originalFileId)}`,
        {
          headers: { Authorization: `Bearer ${sessionToken}` },
        }
      );
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = manual.originalFileName || manual.title;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingId(null);
    }
  };

  const areas: ('Todas' | ManualArea)[] = ['Todas', 'RH', 'DP', 'SST', 'Qualidade', 'Engenharia'];

  const filtered = manuals.filter((m) => {
    const matchArea = areaFilter === 'Todas' || m.area === areaFilter;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      m.title.toLowerCase().includes(q) ||
      m.code.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q) ||
      m.area.toLowerCase().includes(q);
    return matchArea && matchSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#1C2421]/12 pb-5">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#C5A467] font-semibold">
            Normas &amp; Procedimentos Unificados · +50 pts por leitura
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#11382B] mt-1">
            Biblioteca de Manuais Internos
          </h2>
        </div>

        {(allowEdit || allowImport) && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {allowImport && (
              <button
                type="button"
                onClick={() => onOpenDocumentImport('manual')}
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg border border-[#11382B]/30 text-xs font-medium text-[#11382B] hover:bg-[#11382B]/5 whitespace-nowrap"
              >
                <FileUp className="w-3.5 h-3.5 text-[#C5A467]" />
                Importar Arquivo
              </button>
            )}
            {allowEdit && (
              <button
                type="button"
                onClick={() => onOpenEdit({ kind: 'manual' })}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg bg-[#11382B] text-white text-xs font-medium hover:bg-[#11382B]/90 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 text-[#D8BC83]" />
                Inserir Novo Manual
              </button>
            )}
          </div>
        )}
      </div>

      {/* Smart Search + Area Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-white border border-[#1C2421]/10 rounded-lg">
          {areas.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAreaFilter(a)}
              className={`px-3 sm:px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                areaFilter === a
                  ? 'bg-[#11382B] text-white'
                  : 'text-[#1C2421]/70 hover:text-[#11382B]'
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-[#1C2421]/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, norma ou assunto..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#1C2421]/15 bg-white text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
          />
        </div>
      </div>

      {/* Manuals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((manual) => {
          const isCompleted = profile.completedManualIds.includes(manual.id);
          const challengePending =
            manual.challenge && !profile.completedChallengeIds.includes(manual.challenge.id);

          return (
            <div
              key={manual.id}
              className={`bg-white border rounded-xl overflow-hidden flex flex-col justify-between ${
                !isCompleted ? 'border-[#C5A467]/75' : 'border-[#1C2421]/10'
              }`}
            >
              <div>
                <div className="p-4 pb-0 relative">
                  <StandardizedImage
                    src={manual.coverImage}
                    alt={manual.title}
                    aspectRatio="16:9"
                    rounded="lg"
                    goldBorder
                  />
                  {allowEdit && (
                    <button
                      type="button"
                      onClick={() => onChangeImage(manual)}
                      className="absolute top-6 right-6 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#11382B]/90 text-white text-[11px] border border-[#C5A467]"
                    >
                      <ImagePlus className="w-3 h-3 text-[#D8BC83]" />
                      Capa
                    </button>
                  )}
                </div>

                <div className="p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs text-[#1C2421]/60">
                    <span className="font-mono font-semibold text-[#11382B]">{manual.code}</span>
                    <span>
                      {!isCompleted ? (
                        <span className="font-mono font-semibold text-[#C5A467]">
                          Não lido · +50 pts
                        </span>
                      ) : (
                        `${manual.area} · ${manual.updatedAt}`
                      )}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#11382B] leading-snug">
                    {manual.title}
                  </h3>
                  <p className="text-xs text-[#1C2421]/75 leading-relaxed line-clamp-3">
                    {manual.summary}
                  </p>
                </div>
              </div>

              <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-[#1C2421]/8 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenManual(manual)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#11382B] text-white text-xs font-semibold hover:bg-[#11382B]/90 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#D8BC83]" />
                    {isCompleted ? 'Rever Manual' : 'Ler Manual (+50 pts)'}
                  </button>

                  {manual.challenge && (
                    <button
                      type="button"
                      onClick={() => onOpenChallenge(manual.challenge!)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[#C5A467] text-xs font-medium text-[#11382B] hover:bg-[#C5A467]/10"
                    >
                      <Gamepad2 className="w-3.5 h-3.5 text-[#C5A467]" />
                      {challengePending ? 'Desafio (+pts)' : 'Concluído'}
                    </button>
                  )}
                </div>

                {manual.originalPdfUrl ? (
                  <a
                    href={manual.originalPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={manual.originalFileName || manual.title}
                    className="inline-flex items-center gap-1.5 text-xs text-[#11382B]/80 hover:text-[#11382B] max-w-full"
                  >
                    <Download className="w-3.5 h-3.5 text-[#C5A467] shrink-0" />
                    <span className="truncate">
                      Baixar PDF original ({manual.originalFileName || manual.code})
                    </span>
                  </a>
                ) : (
                  manual.originalFileId && (
                    <button
                      type="button"
                      disabled={downloadingId === manual.id || !sessionToken}
                      onClick={() => handleDownloadProtectedFile(manual)}
                      className="inline-flex items-center gap-1.5 text-xs text-[#11382B]/80 hover:text-[#11382B] disabled:opacity-50 max-w-full text-left"
                    >
                      <Download className="w-3.5 h-3.5 text-[#C5A467] shrink-0" />
                      <span className="truncate">
                        {downloadingId === manual.id
                          ? 'Baixando arquivo...'
                          : `Baixar original (${manual.originalFileName || manual.code})`}
                      </span>
                    </button>
                  )
                )}

                {(allowEdit || allowDelete) && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1C2421]/8">
                    {allowEdit && (
                      <button
                        type="button"
                        onClick={() => onOpenEdit({ kind: 'manual', item: manual })}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[#11382B] hover:bg-[#11382B]/10"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Editar
                      </button>
                    )}
                    {allowDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(manual.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Excluir
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface GamificationSectionProps {
  profile: CollaboratorProfile;
  rules: GamificationRule[];
  rewards: RewardItem[];
  rhWhatsapp: string;
  isAdmin: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onOpenEdit: (entity: AdminEditEntity) => void;
  onDeleteRule: (id: string) => void;
  onDeleteReward: (id: string) => void;
}

export const GamificationSection: React.FC<GamificationSectionProps> = ({
  profile,
  rules,
  rewards,
  rhWhatsapp,
  isAdmin,
  canEdit,
  canDelete,
  onOpenEdit,
  onDeleteRule,
  onDeleteReward,
}) => {
  const allowEdit = canEdit ?? isAdmin;
  const allowDelete = canDelete ?? isAdmin;
  const sortedRewards = [...rewards].sort((a, b) => a.requiredPoints - b.requiredPoints);
  const cleanPhone = rhWhatsapp.replace(/\D/g, '') || '558287660143';

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#1C2421]/12 pb-5">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#C5A467] font-semibold">
            Programa C&amp;R Coins · Reconhecimento &amp; Experiência
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#11382B] mt-1">
            Política de Gamificação &amp; Resgate de Prêmios
          </h2>
        </div>

        {allowEdit && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenEdit({ kind: 'rule' })}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#11382B]/30 text-xs font-medium text-[#11382B] hover:bg-[#11382B]/5"
            >
              <Plus className="w-3.5 h-3.5 text-[#C5A467]" />
              Nova Regra
            </button>
            <button
              type="button"
              onClick={() => onOpenEdit({ kind: 'reward' })}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#11382B] text-white text-xs font-medium hover:bg-[#11382B]/90"
            >
              <Plus className="w-3.5 h-3.5 text-[#D8BC83]" />
              Novo Prêmio
            </button>
          </div>
        )}
      </div>

      {/* Points Balance Banner */}
      <div className="bg-[#11382B] text-white rounded-xl p-4 sm:p-8 border border-[#C5A467]/50 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-5 space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-[#D8BC83]">
            Seu Saldo Atual Signature
          </p>
          <p className="font-mono tabular-nums text-4xl sm:text-5xl font-bold text-white">
            {profile.points} <span className="text-lg sm:text-xl text-[#D8BC83] font-normal">pts</span>
          </p>
          <p className="text-xs text-white/75 pt-1">
            {profile.name} · {profile.role}
          </p>
        </div>

        <div className="lg:col-span-7 space-y-3">
          <p className="text-xs uppercase tracking-wider text-[#D8BC83] font-semibold">
            Histórico Recente de Pontuação
          </p>
          <div className="space-y-1.5">
            {profile.activityLog.slice(0, 4).map((act) => (
              <div
                key={act.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs bg-black/20 px-3.5 py-2 rounded-lg border border-white/10"
              >
                <span className="text-white/90 truncate">{act.label}</span>
                <span className="font-mono tabular-nums font-semibold text-[#D8BC83] shrink-0">
                  +{act.points} pts · {act.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rewards & WhatsApp Auto Redemption */}
      <div className="space-y-4">
        <h3 className="font-serif text-2xl font-semibold text-[#11382B]">
          Prêmios &amp; Metas de Resgate
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedRewards.map((reward) => {
            const unlocked = profile.points >= reward.requiredPoints;
            const pct = Math.min(100, Math.round((profile.points / reward.requiredPoints) * 100));
            const waText = encodeURIComponent(
              `Olá, Willian Vianna (RH Cavalcante & Rolim)! Gostaria de solicitar o resgate do meu prêmio no Portal Signature.\n\nColaborador: ${profile.name}\nPontuação Atual: ${profile.points} pts\nPrêmio Escolhido: ${reward.title} (${reward.requiredPoints} pts)`
            );
            const waLink = `https://wa.me/${cleanPhone}?text=${waText}`;

            return (
              <div
                key={reward.id}
                className={`bg-white rounded-xl p-4 sm:p-6 border flex flex-col justify-between space-y-4 ${
                  unlocked ? 'border-[#C5A467]' : 'border-[#1C2421]/10'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#C5A467]">{reward.tierName}</span>
                    <span className="font-mono tabular-nums font-semibold text-[#11382B]">
                      Meta: {reward.requiredPoints} pts
                    </span>
                  </div>
                  <h4 className="font-serif text-2xl font-semibold text-[#11382B]">{reward.title}</h4>
                  <p className="text-sm text-[#1C2421]/75 leading-relaxed">{reward.description}</p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1 font-mono tabular-nums">
                      <span className="text-[#1C2421]/65">
                        {unlocked
                          ? 'Meta atingida! Prêmio disponível'
                          : `Faltam ${reward.requiredPoints - profile.points} pts`}
                      </span>
                      <span className="font-semibold text-[#11382B]">{pct}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#1C2421]/10 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          unlocked ? 'bg-[#C5A467]' : 'bg-[#11382B]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {unlocked ? (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#C5A467] text-[#11382B] text-xs font-bold hover:bg-[#D8BC83] transition-colors text-center"
                    >
                      <Gift className="w-4 h-4 shrink-0" />
                      Resgatar Meu Prêmio via WhatsApp RH
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  ) : (
                    <div className="w-full text-center px-4 py-2.5 rounded-lg bg-[#F8F7F4] border border-[#1C2421]/10 text-xs font-medium text-[#1C2421]/55">
                      Continue interagindo para desbloquear
                    </div>
                  )}

                  {(allowEdit || allowDelete) && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1C2421]/8">
                      {allowEdit && (
                        <button
                          type="button"
                          onClick={() => onOpenEdit({ kind: 'reward', item: reward })}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[#11382B] hover:bg-[#11382B]/10"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Editar
                        </button>
                      )}
                      {allowDelete && (
                        <button
                          type="button"
                          onClick={() => onDeleteReward(reward.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Excluir
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official Gamification Rules Table */}
      <div className="bg-white border border-[#1C2421]/10 rounded-xl overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-[#1C2421]/10 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#11382B]">
              Regras Oficiais da Política de Gamificação
            </h3>
            <p className="text-xs text-[#1C2421]/65 mt-0.5">
              Critérios transparentes de pontuação no Portal Cavalcante &amp; Rolim
            </p>
          </div>
          <Sparkles className="w-5 h-5 text-[#C5A467] shrink-0" />
        </div>

        <div className="divide-y divide-[#1C2421]/10">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-semibold text-[#11382B]">{rule.label}</p>
                <p className="text-xs text-[#1C2421]/70 mt-0.5">{rule.description}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono tabular-nums text-sm font-bold text-[#11382B] bg-[#F8F7F4] border border-[#C5A467]/50 px-3 py-1 rounded-md">
                  +{rule.points} pts
                </span>
                {allowEdit && (
                  <button
                    type="button"
                    onClick={() => onOpenEdit({ kind: 'rule', item: rule })}
                    className="p-1.5 text-[#11382B] hover:bg-[#11382B]/10 rounded"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
                {allowDelete && (
                  <button
                    type="button"
                    onClick={() => onDeleteRule(rule.id)}
                    className="p-1.5 text-red-700 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface DepartmentsSectionProps {
  departments: DepartmentContact[];
  collaboratorName: string;
  isAdmin: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onOpenEdit: (entity: AdminEditEntity) => void;
  onDelete: (id: string) => void;
}

export const DepartmentsSection: React.FC<DepartmentsSectionProps> = ({
  departments,
  collaboratorName,
  isAdmin,
  canEdit,
  canDelete,
  onOpenEdit,
  onDelete,
}) => {
  const allowEdit = canEdit ?? isAdmin;
  const allowDelete = canDelete ?? isAdmin;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#1C2421]/12 pb-5">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#C5A467] font-semibold">
            Central de Atendimento Direto
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#11382B] mt-1">
            Fale com os Setores
          </h2>
        </div>

        {allowEdit && (
          <button
            type="button"
            onClick={() => onOpenEdit({ kind: 'department' })}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#11382B] text-white text-xs font-medium hover:bg-[#11382B]/90"
          >
            <Plus className="w-3.5 h-3.5 text-[#D8BC83]" />
            Adicionar Setor
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {departments.map((dep) => {
          const cleanPhone = dep.whatsappNumber.replace(/\D/g, '');
          const waMsg = encodeURIComponent(
            `Olá, ${dep.responsibleName}! Sou ${collaboratorName} e estou entrando em contato pelo Portal RH Cavalcante & Rolim (${dep.shortName}).`
          );
          const waUrl = `https://wa.me/${cleanPhone}?text=${waMsg}`;

          return (
            <div
              key={dep.id}
              className="bg-white border border-[#1C2421]/10 rounded-xl p-4 sm:p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-mono font-semibold text-[#C5A467]">{dep.shortName}</span>
                  <span className="text-[#1C2421]/60">{dep.hours}</span>
                </div>

                <h3 className="font-serif text-2xl font-semibold text-[#11382B]">{dep.name}</h3>

                <div className="bg-[#F8F7F4] border border-[#C5A467]/35 rounded-lg p-3.5">
                  <p className="text-sm font-semibold text-[#11382B]">{dep.responsibleName}</p>
                  <p className="text-xs text-[#1C2421]/70">{dep.responsibleRole}</p>
                </div>

                <p className="text-sm text-[#1C2421]/75 leading-relaxed">{dep.description}</p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-[#1C2421]/10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#11382B] text-white text-xs font-semibold hover:bg-[#11382B]/90 transition-colors whitespace-nowrap"
                  >
                    <MessageCircle className="w-4 h-4 text-[#D8BC83]" />
                    WhatsApp Direto
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`mailto:${dep.email}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#1C2421]/20 text-xs font-medium text-[#11382B] hover:bg-[#11382B]/5 transition-colors whitespace-nowrap"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#C5A467]" />
                    E-mail
                  </a>
                </div>

                {(allowEdit || allowDelete) && (
                  <div className="flex items-center justify-end gap-2 pt-2">
                    {allowEdit && (
                      <button
                        type="button"
                        onClick={() => onOpenEdit({ kind: 'department', item: dep })}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[#11382B] hover:bg-[#11382B]/10"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Editar Contato
                      </button>
                    )}
                    {allowDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(dep.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Excluir
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
