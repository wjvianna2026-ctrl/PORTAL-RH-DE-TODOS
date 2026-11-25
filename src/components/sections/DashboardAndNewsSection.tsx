import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Bell,
  Building2,
  CheckCircle2,
  Crown,
  Edit3,
  Eye,
  FileUp,
  Gamepad2,
  ImagePlus,
  Lightbulb,
  Plus,
  ShieldAlert,
  Sparkles,
  ThumbsUp,
  Trash2,
  Trophy,
} from 'lucide-react';
import {
  Announcement,
  AnnouncementCategory,
  CollaboratorProfile,
  InteractiveChallenge,
  PortalData,
  PortalSectionId,
  RankingEntry,
} from '../../types/portal';
import { PendingOpportunity } from '../../utils/pendingOpportunities';
import { AdminEditEntity } from '../AdminEditModal';
import { StandardizedImage } from '../StandardizedImage';

interface DashboardSectionProps {
  portalData: PortalData;
  profile: CollaboratorProfile;
  pendingItems: PendingOpportunity[];
  totalAvailablePoints: number;
  isAdmin: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canImport?: boolean;
  onNavigate: (sec: PortalSectionId) => void;
  onSelectOpportunity: (item: PendingOpportunity) => void;
  onOpenEdit: (entity: AdminEditEntity) => void;
  onDeleteProject: (id: string) => void;
  onOpenDocumentImport: (target: 'comunicado' | 'manual' | 'onboarding') => void;
  onOpenAnnouncement: (item: Announcement) => void;
  onOpenChallenge: (challenge: InteractiveChallenge) => void;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  portalData,
  profile,
  pendingItems,
  totalAvailablePoints,
  isAdmin,
  canEdit,
  canDelete,
  canImport,
  onNavigate,
  onSelectOpportunity,
  onOpenEdit,
  onDeleteProject,
  onOpenDocumentImport,
  onOpenAnnouncement,
  onOpenChallenge,
}) => {
  const allowEdit = canEdit ?? isAdmin;
  const allowDelete = canDelete ?? isAdmin;
  const allowImport = canImport ?? isAdmin;
  const [rankingFilter, setRankingFilter] = useState<'geral' | 'meu-setor' | string>('geral');

  const totalOnboarding = portalData.onboardingSteps.length;
  const completedOnboarding = profile.completedOnboardingIds.length;
  const onboardingPct =
    totalOnboarding > 0 ? Math.round((completedOnboarding / totalOnboarding) * 100) : 0;

  const totalViews = portalData.announcements.reduce((sum, a) => sum + a.views, 0);
  const latestAnnouncement = portalData.announcements[0];

  // Combine peers + active collaborator into live ranking
  const { top10Ranking, currentUserRank, availableUnits } = useMemo(() => {
    const peers = portalData.rankingPeers || [];
    const currentUserEntry: RankingEntry = {
      id: 'current-user',
      name: profile.name,
      role: profile.role,
      sectorOrSite: profile.sectorOrSite,
      photoUrl: profile.photoUrl,
      points: profile.points,
      isCurrentUser: true,
    };

    const allCombined = [
      currentUserEntry,
      ...peers.filter((p) => p.name.toLowerCase() !== profile.name.toLowerCase()),
    ].sort((a, b) => b.points - a.points);

    const units = Array.from(new Set(allCombined.map((e) => e.sectorOrSite)));

    let filtered = allCombined;
    if (rankingFilter === 'meu-setor') {
      filtered = allCombined.filter((e) => e.sectorOrSite === profile.sectorOrSite);
    } else if (rankingFilter !== 'geral') {
      filtered = allCombined.filter((e) => e.sectorOrSite === rankingFilter);
    }

    const userPos = allCombined.findIndex((e) => e.isCurrentUser) + 1;

    return {
      top10Ranking: filtered.slice(0, 10),
      currentUserRank: userPos,
      availableUnits: units,
    };
  }, [portalData.rankingPeers, profile, rankingFilter]);

  return (
    <div className="space-y-10">
      {/* Executive Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#1C2421]/12 pb-5">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#C5A467] font-semibold">
            Painel Executivo · Signature Spaces
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#11382B] mt-1">
            Dashboard do Colaborador &amp; Obras
          </h2>
        </div>

        {(allowEdit || allowImport) && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {allowEdit && (
              <button
                type="button"
                onClick={() => onOpenEdit({ kind: 'brand', item: portalData.brand })}
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg border border-[#C5A467] text-xs font-medium text-[#11382B] hover:bg-[#C5A467]/10 transition-colors whitespace-nowrap"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#C5A467]" />
                Editar Capa &amp; Logotipo
              </button>
            )}
            {allowImport && (
              <button
                type="button"
                onClick={() => onOpenDocumentImport('comunicado')}
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg border border-[#11382B]/30 text-xs font-medium text-[#11382B] hover:bg-[#11382B]/5 transition-colors whitespace-nowrap"
              >
                <FileUp className="w-3.5 h-3.5 text-[#C5A467]" />
                Importar Arquivo
              </button>
            )}
            {allowEdit && (
              <button
                type="button"
                onClick={() => onOpenEdit({ kind: 'project' })}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg bg-[#11382B] text-white text-xs font-medium hover:bg-[#11382B]/90 transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 text-[#D8BC83]" />
                Inserir Nova Obra
              </button>
            )}
          </div>
        )}
      </div>

      {/* Unread Content & Pending Gamification Spotlight (Auto-highlighted on Portal Open) */}
      {pendingItems.length > 0 && (
        <div className="bg-[#11382B] text-white rounded-xl p-4 sm:p-6 border border-[#C5A467]/60 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#C5A467]/20 border border-[#C5A467] flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-[#D8BC83]" />
              </div>
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#D8BC83]">
                  Oportunidades em Aberto · Não Lidos
                </p>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-white">
                  Você tem {pendingItems.length} conteúdos e desafios valendo até{' '}
                  <span className="text-[#D8BC83] font-mono tabular-nums">
                    +{totalAvailablePoints} Signature Coins
                  </span>
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('gamificacao')}
              className="text-xs font-medium text-[#D8BC83] hover:text-white inline-flex items-center gap-1 whitespace-nowrap"
            >
              Ver prêmios disponíveis
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {pendingItems.slice(0, 3).map((opp) => (
              <button
                key={opp.id}
                type="button"
                onClick={() => onSelectOpportunity(opp)}
                className="text-left bg-black/25 hover:bg-black/35 border border-[#C5A467]/35 hover:border-[#D8BC83] rounded-lg p-4 transition-colors flex flex-col justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                    <span className="text-[#D8BC83] font-semibold">+{opp.points} Coins</span>
                    <span className="text-white/60">Pendente</span>
                  </div>
                  <p className="text-sm font-semibold text-white leading-snug line-clamp-2">
                    {opp.title}
                  </p>
                  <p className="text-[11px] text-white/65 truncate">{opp.subtitle}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#D8BC83] group-hover:translate-x-0.5 transition-transform">
                  Concluir agora
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-[#1C2421]/10 rounded-xl p-5 space-y-1.5">
          <p className="text-xs text-[#1C2421]/60 font-medium">Sua Posição no Ranking</p>
          <p className="font-mono tabular-nums text-3xl font-semibold text-[#11382B]">
            #{currentUserRank}
          </p>
          <p className="text-xs text-[#1C2421]/70 font-mono tabular-nums">
            {profile.points} Signature Coins
          </p>
        </div>

        <div className="bg-white border border-[#1C2421]/10 rounded-xl p-5 space-y-1.5">
          <p className="text-xs text-[#1C2421]/60 font-medium">Progresso de Onboarding</p>
          <p className="font-mono tabular-nums text-3xl font-semibold text-[#11382B]">
            {onboardingPct}%
          </p>
          <p className="text-xs text-[#1C2421]/70 font-mono tabular-nums">
            {completedOnboarding} de {totalOnboarding} módulos concluídos
          </p>
        </div>

        <div className="bg-white border border-[#1C2421]/10 rounded-xl p-5 space-y-1.5">
          <p className="text-xs text-[#1C2421]/60 font-medium">Aniversariantes de Dezembro</p>
          <p className="font-mono tabular-nums text-3xl font-semibold text-[#11382B]">
            {portalData.birthdays.length}
          </p>
          <button
            type="button"
            onClick={() => onNavigate('aniversariantes')}
            className="text-xs text-[#C5A467] hover:text-[#11382B] font-medium inline-flex items-center gap-1"
          >
            Enviar felicitações (+20 pts)
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white border border-[#1C2421]/10 rounded-xl p-5 space-y-1.5">
          <p className="text-xs text-[#1C2421]/60 font-medium">Engajamento em Comunicados</p>
          <p className="font-mono tabular-nums text-3xl font-semibold text-[#11382B]">
            {totalViews}
          </p>
          <button
            type="button"
            onClick={() => onNavigate('comunicados')}
            className="text-xs text-[#C5A467] hover:text-[#11382B] font-medium inline-flex items-center gap-1"
          >
            Ver murais ativos
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Ranking dos Melhores (Top 10 Signature Coins) + Obras Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Ranking dos Melhores */}
        <div className="lg:col-span-6 bg-white border border-[#C5A467]/45 rounded-xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-[#1C2421]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11382B] text-white">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-[#D8BC83] shrink-0" />
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold leading-none">
                  Ranking dos Melhores
                </h3>
                <p className="text-[11px] text-[#D8BC83] mt-1">
                  Top 10 colaboradores com mais Signature Coins
                </p>
              </div>
            </div>

            <select
              value={rankingFilter}
              onChange={(e) => setRankingFilter(e.target.value)}
              aria-label="Filtrar ranking por setor ou obra"
              className="w-full sm:w-auto sm:max-w-[230px] rounded-lg border border-[#C5A467]/60 bg-[#11382B] text-xs font-medium text-white px-3 py-2 focus:outline-none focus:border-[#D8BC83]"
            >
              <option value="geral">Ranking Geral (Empresa)</option>
              <option value="meu-setor">Apenas Meu Setor / Obra</option>
              {availableUnits.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          <div className="divide-y divide-[#1C2421]/8">
            {top10Ranking.length === 0 ? (
              <div className="p-6 text-center text-sm text-[#1C2421]/65">
                Nenhum colaborador encontrado neste filtro.
              </div>
            ) : (
              top10Ranking.map((entry, idx) => {
                const pos = idx + 1;
                const isTop3 = pos <= 3;
                return (
                  <div
                    key={entry.id}
                    className={`px-4 sm:px-5 py-3 flex items-center justify-between gap-3 transition-colors ${
                      entry.isCurrentUser ? 'bg-[#C5A467]/12' : 'hover:bg-[#F8F7F4]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-md font-mono tabular-nums text-xs font-bold flex items-center justify-center shrink-0 ${
                          pos === 1
                            ? 'bg-[#C5A467] text-[#11382B]'
                            : pos === 2
                              ? 'bg-[#11382B] text-[#D8BC83]'
                              : pos === 3
                                ? 'bg-[#11382B]/15 text-[#11382B]'
                                : 'text-[#1C2421]/60 bg-[#F8F7F4]'
                        }`}
                      >
                        {pos === 1 ? <Crown className="w-3.5 h-3.5" /> : `${pos}º`}
                      </span>

                      <div className="w-10 shrink-0">
                        <StandardizedImage
                          src={entry.photoUrl}
                          alt={entry.name}
                          aspectRatio="1:1"
                          rounded="full"
                          goldBorder={isTop3 || Boolean(entry.isCurrentUser)}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#11382B] truncate">
                          {entry.name}
                          {entry.isCurrentUser && (
                            <span className="ml-1.5 text-[11px] font-mono text-[#C5A467]">
                              (Você)
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-[#1C2421]/65 truncate">
                          {entry.role} · {entry.sectorOrSite}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono tabular-nums text-sm font-bold text-[#11382B]">
                        {entry.points}
                      </span>
                      <span className="block text-[10px] text-[#C5A467] font-medium">
                        Signature Coins
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Featured Highlight Card */}
        <div className="lg:col-span-6 space-y-6">
          {latestAnnouncement && (
            <div className="bg-white border border-[#1C2421]/10 rounded-xl overflow-hidden flex flex-col">
              <div className="p-4 pb-0">
                <StandardizedImage
                  src={latestAnnouncement.coverImage}
                  alt={latestAnnouncement.title}
                  aspectRatio="16:9"
                  rounded="lg"
                  goldBorder
                />
              </div>
              <div className="p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-mono uppercase tracking-[0.16em] text-[#C5A467] font-semibold">
                    Destaque Oficial · {latestAnnouncement.category} · {latestAnnouncement.publishedAt}
                  </p>
                  <h3 className="font-serif text-2xl font-semibold text-[#11382B] leading-snug">
                    {latestAnnouncement.title}
                  </h3>
                  <p className="text-sm text-[#1C2421]/80 leading-relaxed">
                    {latestAnnouncement.summary}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenAnnouncement(latestAnnouncement)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#11382B] text-white text-xs font-semibold hover:bg-[#11382B]/90 transition-colors"
                  >
                    Ler Comunicado (+30 pts)
                  </button>
                  {latestAnnouncement.challenge && (
                    <button
                      type="button"
                      onClick={() => onOpenChallenge(latestAnnouncement.challenge!)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#C5A467] text-xs font-semibold text-[#11382B] hover:bg-[#C5A467]/10 transition-colors"
                    >
                      <Gamepad2 className="w-4 h-4 text-[#C5A467]" />
                      Jogar Desafio
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Construction Projects Status Table (Desktop) & Responsive Cards (Mobile) */}
      <div className="bg-white border border-[#1C2421]/10 rounded-xl overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-[#1C2421]/10 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#11382B]">
              Acompanhamento de Obras &amp; Unidades C&amp;R
            </h3>
            <p className="text-xs text-[#1C2421]/65 mt-0.5">
              Cronograma físico, liderança residente e dias consecutivos sem acidentes
            </p>
          </div>
          <Building2 className="w-5 h-5 text-[#C5A467] shrink-0" />
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-[#1C2421]/10">
          {portalData.projects.map((proj) => (
            <div key={proj.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-[#11382B]">{proj.name}</p>
                  <p className="text-xs text-[#1C2421]/65">
                    {proj.location} · {proj.status}
                  </p>
                </div>
                <span className="font-mono tabular-nums text-xs font-semibold text-[#11382B] bg-[#F8F7F4] border border-[#C5A467]/40 px-2 py-0.5 rounded shrink-0">
                  {proj.progress}%
                </span>
              </div>

              <div className="w-full h-1.5 bg-[#1C2421]/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#11382B]"
                  style={{ width: `${Math.min(100, Math.max(0, proj.progress))}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-[#1C2421]/80 bg-[#F8F7F4] rounded-lg p-3">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#1C2421]/55">
                    Fase Atual
                  </span>
                  <span className="font-medium text-[#11382B]">{proj.phase}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#1C2421]/55">
                    Responsável
                  </span>
                  <span className="font-medium text-[#11382B]">{proj.engineer}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#1C2421]/55">
                    Dias s/ Acidentes
                  </span>
                  <span className="font-mono tabular-nums font-semibold text-[#11382B]">
                    {proj.safetyDaysWithoutAccidents} d
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#1C2421]/55">
                    Previsão
                  </span>
                  <span className="font-mono tabular-nums font-medium text-[#11382B]">
                    {proj.deliveryForecast}
                  </span>
                </div>
              </div>

              {(allowEdit || allowDelete) && (
                <div className="flex items-center justify-end gap-2 pt-1">
                  {allowEdit && (
                    <button
                      type="button"
                      onClick={() => onOpenEdit({ kind: 'project', item: proj })}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[#11382B] hover:bg-[#11382B]/10 rounded-md"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Editar
                    </button>
                  )}
                  {allowDelete && (
                    <button
                      type="button"
                      onClick={() => onDeleteProject(proj.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-red-700 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1C2421]/10 bg-[#F8F7F4] text-[11px] uppercase tracking-wider text-[#1C2421]/65">
                <th className="py-3 px-6 font-semibold">Empreendimento / Unidade</th>
                <th className="py-3 px-4 font-semibold">Fase Atual</th>
                <th className="py-3 px-4 font-semibold">Responsável</th>
                <th className="py-3 px-4 font-semibold text-right">Avanço</th>
                <th className="py-3 px-4 font-semibold text-right">Dias s/ Acidentes</th>
                <th className="py-3 px-6 font-semibold">Previsão</th>
                {(allowEdit || allowDelete) && (
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2421]/8 text-sm">
              {portalData.projects.map((proj) => (
                <tr key={proj.id} className="hover:bg-[#F8F7F4]/70 transition-colors">
                  <td className="py-3.5 px-6">
                    <p className="font-semibold text-[#11382B]">{proj.name}</p>
                    <p className="text-xs text-[#1C2421]/60">
                      {proj.location} · {proj.status}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[#1C2421]/80">{proj.phase}</td>
                  <td className="py-3.5 px-4 text-xs text-[#1C2421]/80 whitespace-nowrap">
                    {proj.engineer}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2.5 justify-end">
                      <div className="w-20 h-1.5 bg-[#1C2421]/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#11382B]"
                          style={{ width: `${Math.min(100, Math.max(0, proj.progress))}%` }}
                        />
                      </div>
                      <span className="font-mono tabular-nums text-xs font-semibold text-[#11382B]">
                        {proj.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-xs font-semibold text-[#11382B]">
                    {proj.safetyDaysWithoutAccidents} d
                  </td>
                  <td className="py-3.5 px-6 text-xs font-mono tabular-nums text-[#1C2421]/75 whitespace-nowrap">
                    {proj.deliveryForecast}
                  </td>
                  {(allowEdit || allowDelete) && (
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {allowEdit && (
                        <button
                          type="button"
                          onClick={() => onOpenEdit({ kind: 'project', item: proj })}
                          className="p-1.5 text-[#11382B] hover:bg-[#11382B]/10 rounded-md"
                          title="Editar Obra"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      {allowDelete && (
                        <button
                          type="button"
                          onClick={() => onDeleteProject(proj.id)}
                          className="p-1.5 text-red-700 hover:bg-red-50 rounded-md ml-1"
                          title="Excluir Obra"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface AnnouncementsSectionProps {
  announcements: Announcement[];
  profile: CollaboratorProfile;
  isAdmin: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canImport?: boolean;
  onOpenAnnouncement: (item: Announcement) => void;
  onReact: (id: string, reaction: 'applause' | 'insightful' | 'important') => void;
  onMarkRead: (id: string) => void;
  onOpenChallenge: (challenge: InteractiveChallenge) => void;
  onOpenEdit: (entity: AdminEditEntity) => void;
  onDelete: (id: string) => void;
  onOpenDocumentImport: (target: 'comunicado' | 'manual' | 'onboarding') => void;
  onChangeImage: (item: Announcement) => void;
}

export const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({
  announcements,
  profile,
  isAdmin,
  canEdit,
  canDelete,
  canImport,
  onOpenAnnouncement,
  onReact,
  onMarkRead,
  onOpenChallenge,
  onOpenEdit,
  onDelete,
  onOpenDocumentImport,
  onChangeImage,
}) => {
  const allowEdit = canEdit ?? isAdmin;
  const allowDelete = canDelete ?? isAdmin;
  const allowImport = canImport ?? isAdmin;
  const [filter, setFilter] = useState<'Todos' | AnnouncementCategory>('Todos');

  const categories: ('Todos' | AnnouncementCategory)[] = [
    'Todos',
    'Obras',
    'Institucional',
    'Eventos',
    'Urgente',
  ];

  const filtered =
    filter === 'Todos'
      ? announcements
      : announcements.filter((a) => a.category === filter);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#1C2421]/12 pb-5">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#C5A467] font-semibold">
            Comunicação Interna &amp; Endomarketing
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#11382B] mt-1">
            Mural de Comunicados &amp; Campanhas
          </h2>
        </div>

        {(allowEdit || allowImport) && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {allowImport && (
              <button
                type="button"
                onClick={() => onOpenDocumentImport('comunicado')}
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg border border-[#11382B]/30 text-xs font-medium text-[#11382B] hover:bg-[#11382B]/5 transition-colors whitespace-nowrap"
              >
                <FileUp className="w-3.5 h-3.5 text-[#C5A467]" />
                Importar Arquivo
              </button>
            )}
            {allowEdit && (
              <button
                type="button"
                onClick={() => onOpenEdit({ kind: 'announcement' })}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg bg-[#11382B] text-white text-xs font-medium hover:bg-[#11382B]/90 transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 text-[#D8BC83]" />
                Inserir Novo Comunicado
              </button>
            )}
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-white border border-[#1C2421]/10 rounded-lg">
        {categories.map((cat) => {
          const active = filter === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                active
                  ? 'bg-[#11382B] text-white'
                  : 'text-[#1C2421]/70 hover:text-[#11382B]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => {
          const isRead = profile.readAnnouncementIds.includes(item.id);
          const hasReacted = profile.reactedAnnouncementIds.includes(item.id);
          const challengePending =
            item.challenge && !profile.completedChallengeIds.includes(item.challenge.id);

          return (
            <article
              key={item.id}
              className={`bg-white border rounded-xl overflow-hidden flex flex-col justify-between ${
                !isRead ? 'border-[#C5A467]/75' : 'border-[#1C2421]/10'
              }`}
            >
              <div>
                <div className="p-4 pb-0 relative">
                  <StandardizedImage
                    src={item.coverImage}
                    alt={item.title}
                    aspectRatio="16:9"
                    rounded="lg"
                    goldBorder
                  />
                  {allowEdit && (
                    <button
                      type="button"
                      onClick={() => onChangeImage(item)}
                      className="absolute top-6 right-6 inline-flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-md bg-[#11382B]/90 text-white text-[11px] font-medium border border-[#C5A467] hover:bg-[#11382B]"
                    >
                      <ImagePlus className="w-3.5 h-3.5 text-[#D8BC83]" />
                      <span className="sm:hidden">Imagem</span>
                      <span className="hidden sm:inline">Alterar Imagem</span>
                    </button>
                  )}
                </div>

                <div className="p-4 sm:p-5 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#1C2421]/60">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#11382B]">{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{item.publishedAt}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                        <Eye className="w-3.5 h-3.5" />
                        {item.views}
                      </span>
                    </div>
                    {!isRead && (
                      <span className="text-[11px] font-mono font-semibold text-[#C5A467]">
                        Não lido · +30 pts
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#11382B] leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#1C2421]/75 leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>
                  <p className="text-xs text-[#1C2421]/55 pt-1">Por {item.author}</p>
                </div>
              </div>

              <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-[#1C2421]/8 space-y-3">
                {/* Reactions + Read Action */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={hasReacted}
                      onClick={() => onReact(item.id, 'applause')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#1C2421]/12 text-xs text-[#1C2421]/80 hover:border-[#C5A467] disabled:opacity-60 transition-colors"
                      title="Aplaudir"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-[#C5A467]" />
                      <span className="font-mono tabular-nums">{item.reactions.applause}</span>
                    </button>
                    <button
                      type="button"
                      disabled={hasReacted}
                      onClick={() => onReact(item.id, 'insightful')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#1C2421]/12 text-xs text-[#1C2421]/80 hover:border-[#C5A467] disabled:opacity-60 transition-colors"
                      title="Relevante"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-[#C5A467]" />
                      <span className="font-mono tabular-nums">{item.reactions.insightful}</span>
                    </button>
                    <button
                      type="button"
                      disabled={hasReacted}
                      onClick={() => onReact(item.id, 'important')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#1C2421]/12 text-xs text-[#1C2421]/80 hover:border-[#C5A467] disabled:opacity-60 transition-colors"
                      title="Prioritário"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-[#C5A467]" />
                      <span className="font-mono tabular-nums">{item.reactions.important}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onMarkRead(item.id)}
                    disabled={isRead}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                      isRead
                        ? 'bg-[#11382B]/10 text-[#11382B]'
                        : 'bg-[#C5A467] text-[#11382B] hover:bg-[#D8BC83]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isRead ? 'Compreendido (+30 pts)' : 'Li e Compreendi (+30 pts)'}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenAnnouncement(item)}
                    className="text-xs font-semibold text-[#11382B] hover:text-[#C5A467] transition-colors"
                  >
                    Abrir Leitura Editorial Completa →
                  </button>

                  {item.challenge && (
                    <button
                      type="button"
                      onClick={() => onOpenChallenge(item.challenge!)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#11382B] hover:text-[#C5A467] transition-colors"
                    >
                      <Gamepad2 className="w-3.5 h-3.5 text-[#C5A467]" />
                      {challengePending ? 'Desafio Pendente (+pts)' : 'Mini-Game Concluído'}
                    </button>
                  )}
                </div>

                {(allowEdit || allowDelete) && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1C2421]/8">
                    {allowEdit && (
                      <button
                        type="button"
                        onClick={() => onOpenEdit({ kind: 'announcement', item })}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs text-[#11382B] hover:bg-[#11382B]/10"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Editar
                      </button>
                    )}
                    {allowDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Excluir
                      </button>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
