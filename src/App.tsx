import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Award, Bell, Crown, Lock, LogOut, Maximize2, Menu, ShieldCheck, SlidersHorizontal, Users, X } from 'lucide-react';
import { AccessModeOptionsButton } from './components/AccessModeOptionsButton';
import { AdminAuthModal } from './components/AdminAuthModal';
import { AdminEditEntity, AdminEditModal } from './components/AdminEditModal';
import { BrandMonogram } from './components/BrandMonogram';
import { DocumentImportModal } from './components/DocumentImportModal';
import { EditorialReaderModal } from './components/EditorialReaderModal';
import { FloatingSupportButton } from './components/FloatingSupportButton';
import { HeroSection } from './components/HeroSection';
import { ImageAutoCropModal } from './components/ImageAutoCropModal';
import { ImageSettingsModal } from './components/ImageSettingsModal';
import { ManagerOptionsModal } from './components/ManagerOptionsModal';
import { MiniGameModal } from './components/MiniGameModal';
import {
  NavigationDrawer,
  PublicCollaboratorOption,
} from './components/NavigationDrawer';
import { NotificationsCenterModal } from './components/NotificationsCenterModal';
import { PortalAccessGate } from './components/PortalAccessGate';
import { StandardizedImage } from './components/StandardizedImage';
import { ImagePolicyProvider } from './context/ImagePolicyContext';
import { AccessGovernanceSection } from './components/sections/AccessGovernanceSection';
import {
  AnnouncementsSection,
  DashboardSection,
} from './components/sections/DashboardAndNewsSection';
import {
  DepartmentsSection,
  GamificationSection,
  ManualsSection,
  OnboardingSection,
} from './components/sections/LearningAndRewardsSection';
import {
  BenefitsSection,
  BirthdaysSection,
  VacationsSection,
} from './components/sections/PeopleModulesSection';
import {
  INITIAL_COLLABORATOR_PROFILE,
  INITIAL_PORTAL_DATA,
} from './data/initialPortalData';
import {
  Announcement,
  AuthSessionUser,
  BirthdayPerson,
  CollaboratorProfile,
  InteractiveChallenge,
  ManualDocument,
  OnboardingStep,
  PortalData,
  PortalSectionId,
  PortalViewMode,
  VacationEntry,
} from './types/portal';
import {
  computePendingOpportunities,
  PendingOpportunity,
} from './utils/pendingOpportunities';

type EditorialTarget =
  | { type: 'announcement'; item: Announcement }
  | { type: 'manual'; item: ManualDocument }
  | { type: 'onboarding'; item: OnboardingStep };

export default function App() {
  const [portalData, setPortalData] = useState<PortalData>(INITIAL_PORTAL_DATA);
  const [profile, setProfile] = useState<CollaboratorProfile>(() => ({
    ...INITIAL_COLLABORATOR_PROFILE,
    points: INITIAL_COLLABORATOR_PROFILE.points + 10,
    dailyLoginClaimed: true,
    activityLog: [
      {
        id: 'act-daily-login',
        label: 'Acesso diário ao Portal Cavalcante & Rolim',
        points: 10,
        timestamp: 'Agora',
      },
      ...INITIAL_COLLABORATOR_PROFILE.activityLog,
    ],
  }));

  const [activeSection, setActiveSection] = useState<PortalSectionId>('visao-geral');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Authenticated Session Token, Actor & Active Mode held strictly in React memory
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [sessionUser, setSessionUser] = useState<AuthSessionUser | null>(null);
  const [activeMode, setActiveMode] = useState<PortalViewMode>('colaborador');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [managerOptionsOpen, setManagerOptionsOpen] = useState(false);
  const [imageSettingsOpen, setImageSettingsOpen] = useState(false);
  const [openOptionsAfterAuth, setOpenOptionsAfterAuth] = useState(false);

  const [publicAccessSummary, setPublicAccessSummary] = useState<{
    masterName: string;
    masterRoleTitle?: string;
    masterPhotoUrl?: string;
    activeGestoresCount: number;
    activeUsersCount: number;
    collaboratorProfiles: PublicCollaboratorOption[];
    lastChange: {
      actorName: string;
      actorRole: string;
      action: string;
      timestamp: string;
    } | null;
  }>({
    masterName: 'Willian Vianna',
    masterRoleTitle: 'Responsável pelo Setor de RH · Acesso Master',
    masterPhotoUrl: '/src/assets/images/avatar_colaborador_3_1795629925432.jpg',
    activeGestoresCount: 0,
    activeUsersCount: 0,
    collaboratorProfiles: [],
    lastChange: null,
  });

  // Modals
  const [editorialTarget, setEditorialTarget] = useState<EditorialTarget | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<InteractiveChallenge | null>(null);
  const [editEntity, setEditEntity] = useState<AdminEditEntity | null>(null);
  const [importModalState, setImportModalState] = useState<{
    open: boolean;
    target: 'comunicado' | 'manual' | 'onboarding';
  }>({ open: false, target: 'manual' });
  const [quickCropTarget, setQuickCropTarget] = useState<{
    title: string;
    aspectRatio: '16:9' | '1:1';
    currentImageUrl: string;
    onApply: (dataUrl: string) => void;
  } | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const canUseGestorMode = Boolean(
    sessionToken &&
      sessionUser &&
      (sessionUser.accessRole === 'master' || sessionUser.accessRole === 'gestor')
  );
  const isAdmin = canUseGestorMode && activeMode === 'gestor';
  const effectiveAdminToken = isAdmin ? sessionToken : null;
  const isMasterSession = Boolean(isAdmin && sessionUser?.accessRole === 'master');
  const canEditContent = Boolean(
    isAdmin && (isMasterSession || sessionUser?.privileges?.canEditContent !== false)
  );
  const canDeleteContent = Boolean(
    isAdmin && (isMasterSession || sessionUser?.privileges?.canDeleteContent !== false)
  );
  const canImportDocuments = Boolean(
    isAdmin && (isMasterSession || sessionUser?.privileges?.canImportDocuments !== false)
  );

  const pendingSummary = useMemo(
    () => computePendingOpportunities(portalData, profile),
    [portalData, profile]
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((curr) => (curr === msg ? null : curr));
    }, 4200);
  };

  const refreshPublicSummary = useCallback(
    (tokenOverride?: string) => {
      const tokenToUse = tokenOverride || sessionToken;
      if (!tokenToUse) return;
      fetch('/api/access/public-summary', {
        headers: { Authorization: `Bearer ${tokenToUse}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.masterName) {
            setPublicAccessSummary(data);
          }
        })
        .catch(() => {});
    },
    [sessionToken]
  );

  const fetchAuthenticatedPortalData = useCallback((tokenToUse: string) => {
    fetch('/api/portal', {
      headers: { Authorization: `Bearer ${tokenToUse}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.brand && Array.isArray(data.announcements)) {
          setPortalData(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!sessionToken) return;
    fetchAuthenticatedPortalData(sessionToken);
    refreshPublicSummary(sessionToken);
  }, [sessionToken, fetchAuthenticatedPortalData, refreshPublicSummary]);

  const handleGateAuthenticated = (
    token: string,
    user: AuthSessionUser,
    viewMode: PortalViewMode
  ) => {
    setSessionToken(token);
    setSessionUser(user);
    setActiveMode(viewMode);
    setProfile((prev) => ({
      ...prev,
      name: user.name,
      role: user.roleTitle,
      sectorOrSite: user.sectorOrSite,
      photoUrl: user.photoUrl,
    }));
    showToast(
      `Bem-vindo(a), ${user.name}! ${
        viewMode === 'gestor'
          ? 'Modo Gestor ativo (inserir, corrigir e excluir).'
          : 'Modo Colaborador ativo (visualização e interação).'
      }`
    );
  };

  const handleSwitchToColaboradorMode = () => {
    setActiveMode('colaborador');
    setManagerOptionsOpen(false);
    setOpenOptionsAfterAuth(false);
    if (activeSection === 'acesso') {
      setActiveSection('visao-geral');
    }
    showToast('Modo Colaborador ativado: apenas visualização e interação.');
  };

  const handleSwitchToGestorMode = () => {
    if (canUseGestorMode) {
      setActiveMode('gestor');
      showToast('Modo Gestor ativado: permissões de inserir, corrigir e excluir liberadas.');
      return;
    }
    setOpenOptionsAfterAuth(false);
    setAuthModalOpen(true);
  };

  const handleOpenManagerOptions = () => {
    if (canUseGestorMode) {
      setActiveMode('gestor');
      setManagerOptionsOpen(true);
      return;
    }
    setOpenOptionsAfterAuth(true);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    setSessionToken(null);
    setSessionUser(null);
    setActiveMode('colaborador');
    setManagerOptionsOpen(false);
    setOpenOptionsAfterAuth(false);
    setDrawerOpen(false);
    setActiveSection('visao-geral');
    setPortalData(INITIAL_PORTAL_DATA);
  };

  const handleManagerProfileUpdated = (updatedUser: AuthSessionUser) => {
    const previousName = sessionUser?.name;
    setSessionUser(updatedUser);
    setProfile((prev) => ({
      ...prev,
      name: updatedUser.name,
      role: updatedUser.roleTitle,
      sectorOrSite: updatedUser.sectorOrSite,
      photoUrl: updatedUser.photoUrl,
    }));
    refreshPublicSummary();
    if (updatedUser.accessRole === 'master') {
      setPortalData((prev) => ({
        ...prev,
        rankingPeers: prev.rankingPeers?.map((peer) =>
          peer.id === 'rank-3' || (previousName && peer.name === previousName)
            ? {
                ...peer,
                name: updatedUser.name,
                role: updatedUser.roleTitle,
                sectorOrSite: updatedUser.sectorOrSite,
                photoUrl: updatedUser.photoUrl,
              }
            : peer
        ),
      }));
    }
    showToast(`Nome e foto do gestor "${updatedUser.name}" atualizados com sucesso.`);
  };

  const handleSwitchCollaborator = (opt: PublicCollaboratorOption) => {
    setProfile((prev) => ({
      ...prev,
      name: opt.name,
      role: opt.roleTitle,
      sectorOrSite: opt.sectorOrSite,
      photoUrl: opt.photoUrl,
    }));
    showToast(`Pré-visualizando como Colaborador: ${opt.name}`);
  };

  const syncPortalToServer = async (
    nextData: PortalData,
    successMessage?: string
  ): Promise<boolean> => {
    setPortalData(nextData);
    if (!effectiveAdminToken) return false;
    try {
      const res = await fetch('/api/portal', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${effectiveAdminToken}`,
        },
        body: JSON.stringify(nextData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        fetchAuthenticatedPortalData(effectiveAdminToken);
        showToast(err.error || 'Erro ao salvar alterações no servidor.');
        return false;
      }
      refreshPublicSummary();
      if (successMessage) showToast(successMessage);
      return true;
    } catch {
      fetchAuthenticatedPortalData(effectiveAdminToken);
      showToast('Falha de conexão ao sincronizar alterações.');
      return false;
    }
  };

  const awardPoints = (amount: number, reason: string) => {
    if (amount <= 0) return;
    setProfile((prev) => ({
      ...prev,
      points: prev.points + amount,
      activityLog: [
        {
          id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          label: reason,
          points: amount,
          timestamp: 'Agora',
        },
        ...prev.activityLog,
      ],
    }));
    showToast(`+${amount} Pontos Signature: ${reason}`);
  };

  const handleNavigate = (sec: PortalSectionId) => {
    setActiveSection(sec);
    const mainEl = document.getElementById('portal-workspace');
    if (mainEl) {
      mainEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // --- Collaborator Interactions ---
  const handleOpenAnnouncement = (item: Announcement) => {
    setEditorialTarget({ type: 'announcement', item });
    setPortalData((prev) => ({
      ...prev,
      announcements: prev.announcements.map((a) =>
        a.id === item.id ? { ...a, views: a.views + 1 } : a
      ),
    }));
    if (sessionToken) {
      fetch(`/api/announcements/${encodeURIComponent(item.id)}/view`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionToken}` },
      }).catch(() => {});
    }
  };

  const handleSelectOpportunity = (item: PendingOpportunity) => {
    if (item.kind === 'comunicado' && item.announcement) {
      handleOpenAnnouncement(item.announcement);
      return;
    }
    if (item.kind === 'manual' && item.manual) {
      setEditorialTarget({ type: 'manual', item: item.manual });
      return;
    }
    if (item.kind === 'onboarding' && item.onboardingStep) {
      setEditorialTarget({ type: 'onboarding', item: item.onboardingStep });
      return;
    }
    if (item.kind === 'desafio' && item.challenge) {
      setActiveChallenge(item.challenge);
      return;
    }
    handleNavigate(item.targetSection);
  };

  const handleMarkAnnouncementRead = (id: string) => {
    if (profile.readAnnouncementIds.includes(id)) return;
    const rulePts =
      portalData.gamificationRules.find((r) => r.actionKey === 'read_announcement')?.points || 30;
    setProfile((prev) => ({
      ...prev,
      readAnnouncementIds: [...prev.readAnnouncementIds, id],
    }));
    awardPoints(rulePts, 'Leitura de comunicado confirmada');
  };

  const handleReactAnnouncement = async (
    id: string,
    reaction: 'applause' | 'insightful' | 'important'
  ) => {
    if (profile.reactedAnnouncementIds.includes(id)) return;
    setProfile((prev) => ({
      ...prev,
      reactedAnnouncementIds: [...prev.reactedAnnouncementIds, id],
    }));
    setPortalData((prev) => ({
      ...prev,
      announcements: prev.announcements.map((a) =>
        a.id === id
          ? {
              ...a,
              reactions: {
                ...a.reactions,
                [reaction]: a.reactions[reaction] + 1,
              },
            }
          : a
      ),
    }));
    if (sessionToken) {
      fetch(`/api/announcements/${encodeURIComponent(id)}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ reaction }),
      }).catch(() => {});
    }
  };

  const handleMarkManualComplete = (id: string) => {
    if (profile.completedManualIds.includes(id)) return;
    const rulePts =
      portalData.gamificationRules.find((r) => r.actionKey === 'complete_manual')?.points || 50;
    setProfile((prev) => ({
      ...prev,
      completedManualIds: [...prev.completedManualIds, id],
    }));
    awardPoints(rulePts, 'Conclusão de leitura de Manual Interno');
  };

  const handleMarkOnboardingComplete = (id: string) => {
    if (profile.completedOnboardingIds.includes(id)) return;
    const nextCompleted = [...profile.completedOnboardingIds, id];
    const allStepIds = portalData.onboardingSteps.map((s) => s.id);
    const finishedAll = allStepIds.every((sid) => nextCompleted.includes(sid));

    setProfile((prev) => ({
      ...prev,
      completedOnboardingIds: nextCompleted,
    }));

    if (finishedAll) {
      const rulePts =
        portalData.gamificationRules.find((r) => r.actionKey === 'complete_onboarding')?.points ||
        150;
      awardPoints(rulePts, 'Conclusão integral da Trilha de Onboarding!');
    } else {
      showToast('Etapa de Onboarding concluída! Continue para ganhar +150 pts ao final.');
    }
  };

  const handleSendCongratulation = async (birthdayId: string, message: string) => {
    if (!sessionToken) return;
    const res = await fetch(`/api/birthdays/${encodeURIComponent(birthdayId)}/congratulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        senderName: profile.name,
        senderRole: profile.role,
        message,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Erro ao enviar felicitação.');
      return;
    }

    setPortalData((prev) => ({
      ...prev,
      birthdays: prev.birthdays.map((b) =>
        b.id === birthdayId ? { ...b, messages: data.messages } : b
      ),
    }));

    if (!profile.congratulatedBirthdayIds.includes(birthdayId)) {
      const rulePts =
        portalData.gamificationRules.find((r) => r.actionKey === 'congratulate')?.points || 20;
      setProfile((prev) => ({
        ...prev,
        congratulatedBirthdayIds: [...prev.congratulatedBirthdayIds, birthdayId],
      }));
      awardPoints(rulePts, 'Felicitação enviada no mural de aniversariante');
    } else {
      showToast('Felicitação publicada no mural!');
    }
  };

  const handleChallengeComplete = (result: {
    challengeId: string;
    correctCount: number;
    totalCount: number;
    earnedPoints: number;
    perfectBonus: boolean;
  }) => {
    if (profile.completedChallengeIds.includes(result.challengeId)) return;
    setProfile((prev) => ({
      ...prev,
      completedChallengeIds: [...prev.completedChallengeIds, result.challengeId],
    }));
    if (result.earnedPoints > 0) {
      awardPoints(
        result.earnedPoints,
        result.perfectBonus
          ? `Mini-Game gabaritado (${result.correctCount}/${result.totalCount})`
          : `Mini-Game concluído (${result.correctCount}/${result.totalCount} acertos)`
      );
    }
  };

  // --- Admin CRUD Save & Delete ---
  const handleAdminSave = (kind: AdminEditEntity['kind'], itemData: any) => {
    if (!canEditContent) {
      showToast('Seu perfil de Gestor não possui permissão para editar conteúdos.');
      return;
    }
    const next = structuredClone(portalData);

    const upsert = <T extends { id: string }>(arr: T[], item: T): T[] => {
      const idx = arr.findIndex((x) => x.id === item.id);
      if (idx >= 0) {
        const copy = [...arr];
        copy[idx] = item;
        return copy;
      }
      return [item, ...arr];
    };

    switch (kind) {
      case 'brand':
        next.brand = itemData;
        break;
      case 'project':
        next.projects = upsert(next.projects, itemData);
        break;
      case 'announcement':
        next.announcements = upsert(next.announcements, itemData);
        break;
      case 'benefit':
        next.benefits = upsert(next.benefits, itemData);
        break;
      case 'vacation':
        next.vacations = upsert(next.vacations, itemData);
        break;
      case 'birthday':
        next.birthdays = upsert(next.birthdays, itemData);
        break;
      case 'onboarding':
        next.onboardingSteps = upsert(next.onboardingSteps, itemData);
        break;
      case 'manual':
        next.manuals = upsert(next.manuals, itemData);
        break;
      case 'department':
        next.departments = upsert(next.departments, itemData);
        break;
      case 'rule':
        next.gamificationRules = upsert(next.gamificationRules, itemData);
        break;
      case 'reward':
        next.rewards = upsert(next.rewards, itemData);
        break;
    }

    void syncPortalToServer(next, 'Conteúdo atualizado no portal com sucesso.');
  };

  const handleDeleteByKey = (
    key:
      | 'projects'
      | 'announcements'
      | 'benefits'
      | 'vacations'
      | 'birthdays'
      | 'onboardingSteps'
      | 'manuals'
      | 'departments'
      | 'gamificationRules'
      | 'rewards',
    id: string
  ) => {
    if (!canDeleteContent) {
      showToast('Seu perfil de Gestor não possui permissão para excluir registros.');
      return;
    }
    const next = structuredClone(portalData);
    (next[key] as any[]) = (next[key] as any[]).filter((item) => item.id !== id);
    void syncPortalToServer(next, 'Registro removido pelo Modo Gestor.');
  };

  const rhDepartment = portalData.departments.find((d) => d.shortName === 'RH') || portalData.departments[0];

  const TOP_NAV_LINKS: { id: PortalSectionId; label: string }[] = [
    { id: 'visao-geral', label: 'Obras' },
    { id: 'comunicados', label: 'Comunicados' },
    { id: 'beneficios', label: 'Benefícios' },
    { id: 'manuais', label: 'Manuais' },
    { id: 'gamificacao', label: 'Gamificação' },
  ];

  if (!sessionToken || !sessionUser) {
    return (
      <ImagePolicyProvider settings={portalData.brand.imageSettings}>
        <PortalAccessGate onAuthenticated={handleGateAuthenticated} />
      </ImagePolicyProvider>
    );
  }

  return (
    <ImagePolicyProvider settings={portalData.brand.imageSettings}>
      <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#1C2421] overflow-x-hidden">
      {/* Top Navigation Bar — Strict 3-Zone Contract */}
      <header className="sticky top-0 z-30 bg-[#11382B]/95 backdrop-blur-md border-b border-[#C5A467]/35 text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-8 h-16 flex items-center justify-between gap-2 sm:gap-6">
          {/* Zone 1: Brand Title / Monogram */}
          <button
            type="button"
            onClick={() => handleNavigate('visao-geral')}
            className="text-left focus:outline-none min-w-0 flex-1 md:flex-initial"
          >
            <BrandMonogram
              customLogoUrl={portalData.brand.customLogoUrl}
              companyName={portalData.brand.companyName}
              tagline={portalData.brand.tagline}
              variant="light"
            />
          </button>

          {/* Zone 2: 5 Concise Single-Line Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/80">
            {TOP_NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleNavigate(link.id)}
                  className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                    isActive
                      ? 'text-[#D8BC83] border-[#C5A467]'
                      : 'border-transparent hover:text-white hover:border-[#C5A467]/50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Access Mode Options Dropdown, Notification Bell & Menu Trigger */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="hidden sm:block">
              <AccessModeOptionsButton
                sessionUser={sessionUser}
                activeMode={activeMode}
                canUseGestorMode={canUseGestorMode}
                variant="header"
                onSwitchToColaborador={handleSwitchToColaboradorMode}
                onSwitchToGestor={handleSwitchToGestorMode}
                onOpenManagerOptions={handleOpenManagerOptions}
                onOpenGovernance={() => handleNavigate('acesso')}
                onLogout={handleLogout}
              />
            </div>

            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              className="relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg border border-[#C5A467]/45 text-white hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
              aria-label={`Abrir notificações (${pendingSummary.items.length} pendentes)`}
            >
              <Bell className="w-4 h-4 text-[#D8BC83]" />
              {pendingSummary.items.length > 0 && (
                <span className="font-mono tabular-nums text-[11px] font-bold px-1.5 py-0.5 rounded bg-[#D8BC83] text-[#11382B] leading-none">
                  {pendingSummary.items.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg bg-[#C5A467] text-[#11382B] text-xs font-semibold hover:bg-[#D8BC83] transition-colors whitespace-nowrap shrink-0"
              aria-label="Abrir Menu do Portal"
            >
              <Menu className="w-4 h-4" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Active Sub-Ribbon (visible when Gestor/Master is in Modo Gestor) */}
      {isAdmin && (
        <div className="bg-[#C5A467] text-[#11382B] px-3 sm:px-8 py-2 text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <div className="inline-flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 shrink-0">
              <StandardizedImage
                src={sessionUser.photoUrl}
                alt={sessionUser.name}
                aspectRatio="1:1"
                rounded="full"
              />
            </div>
            {sessionUser.accessRole === 'master' ? (
              <Crown className="w-4 h-4 shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 shrink-0" />
            )}
            <span className="truncate">
              Modo Gestor ({sessionUser.accessRole === 'master' ? 'Master' : 'Gestor'}):{' '}
              <strong>{sessionUser.name}</strong>
              <span className="hidden md:inline"> · Inserir, corrigir e excluir habilitados</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setManagerOptionsOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md bg-[#11382B] text-[#D8BC83] hover:bg-[#11382B]/90 transition-colors whitespace-nowrap"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Opções do Gestor</span>
              <span className="hidden sm:inline">(Nome e Foto)</span>
            </button>
            {canEditContent && (
              <button
                type="button"
                onClick={() => setImageSettingsOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md bg-white/85 text-[#11382B] hover:bg-white transition-colors whitespace-nowrap"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Padrão de Imagens</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => handleNavigate('acesso')}
              className="underline hover:no-underline whitespace-nowrap"
            >
              Política de Acesso
              <span className="hidden sm:inline"> &amp; Equipe</span>
            </button>
            <button
              type="button"
              onClick={handleSwitchToColaboradorMode}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/80 text-[#11382B] hover:bg-white transition-colors whitespace-nowrap"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Modo Colaborador</span>
            </button>
          </div>
        </div>
      )}

      {/* Full-Bleed Architectural Hero */}
      <HeroSection
        brand={portalData.brand}
        profile={profile}
        projects={portalData.projects}
        totalAnnouncements={portalData.announcements.length}
        isAdmin={canEditContent}
        onNavigate={handleNavigate}
        onEditHeroImage={() =>
          setQuickCropTarget({
            title: 'Foto Principal da Capa (Hero 16:9)',
            aspectRatio: '16:9',
            currentImageUrl: portalData.brand.heroImage,
            onApply: (dataUrl) => {
              const next = {
                ...portalData,
                brand: { ...portalData.brand, heroImage: dataUrl },
              };
              void syncPortalToServer(
                next,
                'Foto principal atualizada com enquadramento automático.'
              );
            },
          })
        }
      />

      {/* Explicit Access Policy & Gestor <-> Colaborador Mode Switch Strip */}
      <div id="portal-workspace" className="bg-white border-b border-[#1C2421]/10 scroll-mt-16">
        <div className="bg-[#F8F7F4] border-b border-[#1C2421]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="text-xs text-[#1C2421]/80 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 min-w-0">
              <div className="w-7 h-7 shrink-0">
                <StandardizedImage
                  src={
                    isAdmin
                      ? sessionUser.photoUrl
                      : publicAccessSummary.masterPhotoUrl ||
                        '/src/assets/images/avatar_colaborador_3_1795629925432.jpg'
                  }
                  alt={isAdmin ? sessionUser.name : publicAccessSummary.masterName}
                  aspectRatio="1:1"
                  rounded="full"
                  goldBorder
                />
              </div>
              <span>
                {isAdmin ? 'Gestor Ativo:' : 'Sessão:'}{' '}
                <strong className="text-[#11382B]">{sessionUser.name}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[11px] font-semibold text-[#11382B]">
                {isAdmin
                  ? 'Modo Gestor (Inserir · Corrigir · Excluir)'
                  : 'Modo Colaborador (Visualizar & Interagir)'}
              </span>
              {publicAccessSummary.lastChange && (
                <>
                  <span aria-hidden="true" className="hidden sm:inline">
                    ·
                  </span>
                  <span className="text-[#1C2421]/70">
                    Última atualização:{' '}
                    <strong className="text-[#11382B]">
                      {publicAccessSummary.lastChange.actorName}
                    </strong>{' '}
                    ({publicAccessSummary.lastChange.timestamp})
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <div
                className="inline-flex items-center p-0.5 rounded-lg bg-white border border-[#1C2421]/15"
                role="group"
                aria-label="Alternar entre Modo Gestor e Modo Colaborador"
              >
                <button
                  type="button"
                  onClick={handleSwitchToColaboradorMode}
                  className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                    !isAdmin
                      ? 'bg-[#11382B] text-white'
                      : 'text-[#1C2421]/75 hover:text-[#11382B]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-[#D8BC83]" />
                  Modo Colaborador
                </button>
                <button
                  type="button"
                  onClick={handleSwitchToGestorMode}
                  className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                    isAdmin
                      ? 'bg-[#C5A467] text-[#11382B]'
                      : 'text-[#11382B] hover:bg-[#C5A467]/15'
                  }`}
                >
                  {canUseGestorMode ? (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-[#C5A467]" />
                  )}
                  Modo Gestor
                </button>
              </div>

              <AccessModeOptionsButton
                sessionUser={sessionUser}
                activeMode={activeMode}
                canUseGestorMode={canUseGestorMode}
                variant="workspace"
                onSwitchToColaborador={handleSwitchToColaboradorMode}
                onSwitchToGestor={handleSwitchToGestorMode}
                onOpenManagerOptions={handleOpenManagerOptions}
                onOpenGovernance={() => handleNavigate('acesso')}
                onLogout={handleLogout}
              />

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 bg-white text-red-700 text-xs font-semibold hover:bg-red-50 transition-colors whitespace-nowrap"
                title="Encerrar sessão atual e retornar à tela de login"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center gap-2 overflow-x-auto">
          {(
            [
              { id: 'visao-geral', label: 'Dashboard & Obras' },
              { id: 'comunicados', label: 'Comunicados' },
              { id: 'beneficios', label: 'Benefícios' },
              { id: 'ferias', label: 'Férias' },
              { id: 'aniversariantes', label: 'Aniversariantes' },
              { id: 'onboarding', label: 'Onboarding' },
              { id: 'manuais', label: 'Manuais' },
              { id: 'gamificacao', label: 'Gamificação & Prêmios' },
              { id: 'setores', label: 'Fale com os Setores' },
              ...(isAdmin
                ? [{ id: 'acesso' as PortalSectionId, label: 'Política de Acesso & Equipe' }]
                : []),
            ] as { id: PortalSectionId; label: string }[]
          ).map((tab) => {
            const active = activeSection === tab.id;
            const pendingCount = pendingSummary.countsBySection[tab.id] || 0;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#11382B] text-white'
                    : 'text-[#1C2421]/70 hover:text-[#11382B] hover:bg-[#F8F7F4]'
                }`}
              >
                <span>{tab.label}</span>
                {pendingCount > 0 && (
                  <span
                    className={`font-mono tabular-nums text-[10px] font-bold px-1.5 py-0.5 rounded leading-none ${
                      active ? 'bg-[#C5A467] text-[#11382B]' : 'bg-[#11382B] text-[#D8BC83]'
                    }`}
                  >
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10">
        {activeSection === 'visao-geral' && (
          <DashboardSection
            portalData={portalData}
            profile={profile}
            pendingItems={pendingSummary.items}
            totalAvailablePoints={pendingSummary.totalAvailablePoints}
            isAdmin={isAdmin}
            canEdit={canEditContent}
            canDelete={canDeleteContent}
            canImport={canImportDocuments}
            onNavigate={handleNavigate}
            onSelectOpportunity={handleSelectOpportunity}
            onOpenEdit={setEditEntity}
            onDeleteProject={(id) => handleDeleteByKey('projects', id)}
            onOpenDocumentImport={(target) => setImportModalState({ open: true, target })}
            onOpenAnnouncement={handleOpenAnnouncement}
            onOpenChallenge={setActiveChallenge}
          />
        )}

        {activeSection === 'comunicados' && (
          <AnnouncementsSection
            announcements={portalData.announcements}
            profile={profile}
            isAdmin={isAdmin}
            canEdit={canEditContent}
            canDelete={canDeleteContent}
            canImport={canImportDocuments}
            onOpenAnnouncement={handleOpenAnnouncement}
            onReact={handleReactAnnouncement}
            onMarkRead={handleMarkAnnouncementRead}
            onOpenChallenge={setActiveChallenge}
            onOpenEdit={setEditEntity}
            onDelete={(id) => handleDeleteByKey('announcements', id)}
            onOpenDocumentImport={(target) => setImportModalState({ open: true, target })}
            onChangeImage={(item) =>
              setQuickCropTarget({
                title: `Capa do Comunicado: ${item.title}`,
                aspectRatio: '16:9',
                currentImageUrl: item.coverImage,
                onApply: (dataUrl) => {
                  const next = {
                    ...portalData,
                    announcements: portalData.announcements.map((a) =>
                      a.id === item.id ? { ...a, coverImage: dataUrl } : a
                    ),
                  };
                  void syncPortalToServer(next, 'Imagem do comunicado padronizada.');
                },
              })
            }
          />
        )}

        {activeSection === 'beneficios' && (
          <BenefitsSection
            benefits={portalData.benefits}
            isAdmin={isAdmin}
            canEdit={canEditContent}
            canDelete={canDeleteContent}
            onOpenEdit={setEditEntity}
            onDelete={(id) => handleDeleteByKey('benefits', id)}
          />
        )}

        {activeSection === 'ferias' && (
          <VacationsSection
            vacations={portalData.vacations}
            isAdmin={isAdmin}
            canEdit={canEditContent}
            canDelete={canDeleteContent}
            onOpenEdit={setEditEntity}
            onDelete={(id) => handleDeleteByKey('vacations', id)}
            onChangeImage={(v: VacationEntry) =>
              setQuickCropTarget({
                title: `Foto do Colaborador: ${v.employeeName}`,
                aspectRatio: '1:1',
                currentImageUrl: v.photoUrl,
                onApply: (dataUrl) => {
                  const next = {
                    ...portalData,
                    vacations: portalData.vacations.map((entry) =>
                      entry.id === v.id ? { ...entry, photoUrl: dataUrl } : entry
                    ),
                  };
                  void syncPortalToServer(next, 'Foto padronizada em formato 1:1.');
                },
              })
            }
          />
        )}

        {activeSection === 'aniversariantes' && (
          <BirthdaysSection
            birthdays={portalData.birthdays}
            profile={profile}
            isAdmin={isAdmin}
            canEdit={canEditContent}
            canDelete={canDeleteContent}
            onSendCongratulation={handleSendCongratulation}
            onOpenEdit={setEditEntity}
            onDelete={(id) => handleDeleteByKey('birthdays', id)}
            onChangeImage={(b: BirthdayPerson) =>
              setQuickCropTarget({
                title: `Foto do Aniversariante: ${b.employeeName}`,
                aspectRatio: '1:1',
                currentImageUrl: b.photoUrl,
                onApply: (dataUrl) => {
                  const next = {
                    ...portalData,
                    birthdays: portalData.birthdays.map((person) =>
                      person.id === b.id ? { ...person, photoUrl: dataUrl } : person
                    ),
                  };
                  void syncPortalToServer(next, 'Foto do aniversariante padronizada.');
                },
              })
            }
          />
        )}

        {activeSection === 'onboarding' && (
          <OnboardingSection
            steps={portalData.onboardingSteps}
            profile={profile}
            isAdmin={isAdmin}
            canEdit={canEditContent}
            canDelete={canDeleteContent}
            canImport={canImportDocuments}
            onOpenStep={(step) => setEditorialTarget({ type: 'onboarding', item: step })}
            onOpenChallenge={setActiveChallenge}
            onOpenEdit={setEditEntity}
            onDelete={(id) => handleDeleteByKey('onboardingSteps', id)}
            onOpenDocumentImport={(target) => setImportModalState({ open: true, target })}
          />
        )}

        {activeSection === 'manuais' && (
          <ManualsSection
            manuals={portalData.manuals}
            profile={profile}
            sessionToken={sessionToken}
            isAdmin={isAdmin}
            canEdit={canEditContent}
            canDelete={canDeleteContent}
            canImport={canImportDocuments}
            onOpenManual={(manual) => setEditorialTarget({ type: 'manual', item: manual })}
            onOpenChallenge={setActiveChallenge}
            onOpenEdit={setEditEntity}
            onDelete={(id) => handleDeleteByKey('manuals', id)}
            onOpenDocumentImport={(target) => setImportModalState({ open: true, target })}
            onChangeImage={(manual) =>
              setQuickCropTarget({
                title: `Capa do Manual: ${manual.title}`,
                aspectRatio: '16:9',
                currentImageUrl: manual.coverImage,
                onApply: (dataUrl) => {
                  const next = {
                    ...portalData,
                    manuals: portalData.manuals.map((m) =>
                      m.id === manual.id ? { ...m, coverImage: dataUrl } : m
                    ),
                  };
                  void syncPortalToServer(next, 'Capa do manual padronizada.');
                },
              })
            }
          />
        )}

        {activeSection === 'gamificacao' && (
          <GamificationSection
            profile={profile}
            rules={portalData.gamificationRules}
            rewards={portalData.rewards}
            rhWhatsapp={rhDepartment?.whatsappNumber || '558287660143'}
            isAdmin={isAdmin}
            canEdit={canEditContent}
            canDelete={canDeleteContent}
            onOpenEdit={setEditEntity}
            onDeleteRule={(id) => handleDeleteByKey('gamificationRules', id)}
            onDeleteReward={(id) => handleDeleteByKey('rewards', id)}
          />
        )}

        {activeSection === 'setores' && (
          <DepartmentsSection
            departments={portalData.departments}
            collaboratorName={profile.name}
            isAdmin={isAdmin}
            canEdit={canEditContent}
            canDelete={canDeleteContent}
            onOpenEdit={setEditEntity}
            onDelete={(id) => handleDeleteByKey('departments', id)}
          />
        )}

        {activeSection === 'acesso' && isAdmin && effectiveAdminToken && (
          <AccessGovernanceSection
            adminToken={effectiveAdminToken}
            authUser={sessionUser}
            onNotify={showToast}
            onDirectoryChanged={refreshPublicSummary}
            onSelfProfileUpdated={handleManagerProfileUpdated}
          />
        )}
      </main>

      {/* Clean Institutional Footer */}
      <footer className="bg-[#11382B] text-white border-t border-[#C5A467]/35 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <BrandMonogram
            customLogoUrl={portalData.brand.customLogoUrl}
            companyName={portalData.brand.companyName}
            tagline={portalData.brand.tagline}
            variant="light"
          />
          <div className="text-xs text-white/70 space-y-1 md:text-right">
            <p className="text-white/90 font-medium">
              PORTAL RH DE TODOS · Cavalcante &amp; Rolim Empreendimentos
            </p>
            <p>
              Gestor da Página: {publicAccessSummary.masterName} · WhatsApp RH +55 (82) 98766-0143
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Support Hub */}
      <FloatingSupportButton
        departments={portalData.departments}
        collaboratorName={profile.name}
      />

      {/* Animated Side Navigation Drawer */}
      <NavigationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeSection={activeSection}
        onSelectSection={handleNavigate}
        brand={portalData.brand}
        profile={profile}
        collaboratorOptions={publicAccessSummary.collaboratorProfiles}
        onSwitchCollaborator={handleSwitchCollaborator}
        countsBySection={pendingSummary.countsBySection}
        isAdmin={isAdmin}
        canUseGestorMode={canUseGestorMode}
        authUser={sessionUser}
        onOpenAdminAuth={() => {
          setOpenOptionsAfterAuth(false);
          setAuthModalOpen(true);
        }}
        onSwitchToGestorMode={handleSwitchToGestorMode}
        onOpenManagerOptions={handleOpenManagerOptions}
        onSwitchToColaboradorMode={handleSwitchToColaboradorMode}
        onLogout={handleLogout}
      />

      {/* Notifications & Pending Points Center */}
      <NotificationsCenterModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        items={pendingSummary.items}
        totalAvailablePoints={pendingSummary.totalAvailablePoints}
        onSelectOpportunity={handleSelectOpportunity}
      />

      {/* Standardized Editorial Reader Modal */}
      {editorialTarget && (
        <EditorialReaderModal
          isOpen
          onClose={() => setEditorialTarget(null)}
          sessionToken={sessionToken}
          brand={portalData.brand}
          kicker={
            editorialTarget.type === 'announcement'
              ? editorialTarget.item.category
              : editorialTarget.type === 'manual'
                ? `${editorialTarget.item.code} · ${editorialTarget.item.area}`
                : `Onboarding · Etapa ${String(editorialTarget.item.order).padStart(2, '0')}`
          }
          title={editorialTarget.item.title}
          subtitle={
            editorialTarget.type === 'onboarding'
              ? editorialTarget.item.subtitle
              : editorialTarget.item.summary
          }
          metadataLine={
            editorialTarget.type === 'announcement'
              ? `Por ${editorialTarget.item.author} · ${editorialTarget.item.publishedAt}`
              : editorialTarget.type === 'manual'
                ? `Atualização: ${editorialTarget.item.updatedAt}`
                : `Tempo estimado: ${editorialTarget.item.estimatedMinutes} minutos`
          }
          coverImage={editorialTarget.item.coverImage}
          sections={editorialTarget.item.sections}
          originalFileId={
            editorialTarget.type !== 'onboarding' ? editorialTarget.item.originalFileId : undefined
          }
          originalFileName={editorialTarget.item.originalFileName}
          originalPdfUrl={editorialTarget.item.originalPdfUrl}
          embeddedGuideImage={editorialTarget.item.embeddedGuideImage}
          isCompleted={
            editorialTarget.type === 'announcement'
              ? profile.readAnnouncementIds.includes(editorialTarget.item.id)
              : editorialTarget.type === 'manual'
                ? profile.completedManualIds.includes(editorialTarget.item.id)
                : profile.completedOnboardingIds.includes(editorialTarget.item.id)
          }
          completeLabel={
            editorialTarget.type === 'announcement'
              ? 'Li e Compreendi'
              : editorialTarget.type === 'manual'
                ? 'Concluir Leitura do Manual'
                : 'Concluir Etapa de Integração'
          }
          pointsReward={
            editorialTarget.type === 'announcement'
              ? 30
              : editorialTarget.type === 'manual'
                ? 50
                : 150
          }
          onMarkComplete={() => {
            if (editorialTarget.type === 'announcement') {
              handleMarkAnnouncementRead(editorialTarget.item.id);
            } else if (editorialTarget.type === 'manual') {
              handleMarkManualComplete(editorialTarget.item.id);
            } else {
              handleMarkOnboardingComplete(editorialTarget.item.id);
            }
          }}
          challenge={editorialTarget.item.challenge}
          isChallengeCompleted={
            editorialTarget.item.challenge
              ? profile.completedChallengeIds.includes(editorialTarget.item.challenge.id)
              : false
          }
          onOpenChallenge={(ch) => setActiveChallenge(ch)}
        />
      )}

      {/* Interactive AI Mini-Game Modal */}
      <MiniGameModal
        key={activeChallenge?.id || 'closed'}
        challenge={activeChallenge}
        alreadyCompleted={
          activeChallenge ? profile.completedChallengeIds.includes(activeChallenge.id) : false
        }
        onClose={() => setActiveChallenge(null)}
        onComplete={handleChallengeComplete}
      />

      {/* Restricted Master & Multi-Gestor Auth Modal (when elevating from Modo Colaborador) */}
      <AdminAuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setOpenOptionsAfterAuth(false);
        }}
        onAuthenticated={(token, user) => {
          setSessionToken(token);
          setSessionUser(user);
          setActiveMode('gestor');
          setProfile((prev) => ({
            ...prev,
            name: user.name,
            role: user.roleTitle,
            sectorOrSite: user.sectorOrSite,
            photoUrl: user.photoUrl,
          }));
          refreshPublicSummary(token);
          showToast(
            `Modo Gestor liberado para ${user.name} (${
              user.accessRole === 'master' ? 'Master' : 'Gestor'
            }).`
          );
          if (openOptionsAfterAuth) {
            setOpenOptionsAfterAuth(false);
            setManagerOptionsOpen(true);
          }
        }}
      />

      {/* Page Manager Options Modal (Edit Name, Photo, Role & Quick Actions) */}
      {isAdmin && effectiveAdminToken && (
        <ManagerOptionsModal
          isOpen={managerOptionsOpen}
          adminToken={effectiveAdminToken}
          authUser={sessionUser}
          onClose={() => setManagerOptionsOpen(false)}
          onProfileUpdated={handleManagerProfileUpdated}
          onOpenGovernance={() => handleNavigate('acesso')}
          onEditBrand={() => setEditEntity({ kind: 'brand', item: portalData.brand })}
          onOpenImageSettings={() => setImageSettingsOpen(true)}
          onOpenDocumentImport={() => setImportModalState({ open: true, target: 'manual' })}
          onSwitchToUserMode={handleSwitchToColaboradorMode}
        />
      )}

      {/* System-Wide Image Adaptation Configuration Modal */}
      {isAdmin && canEditContent && (
        <ImageSettingsModal
          isOpen={imageSettingsOpen}
          settings={portalData.brand.imageSettings}
          onSave={(nextSettings) => {
            const nextPortal = {
              ...portalData,
              brand: {
                ...portalData.brand,
                imageSettings: nextSettings,
              },
            };
            void syncPortalToServer(
              nextPortal,
              `Configuração global de imagens atualizada (${nextSettings.bannerAspectRatio}).`
            );
          }}
          onClose={() => setImageSettingsOpen(false)}
        />
      )}

      {/* Universal Document Importer Modal */}
      <DocumentImportModal
        isOpen={importModalState.open}
        adminToken={effectiveAdminToken}
        defaultTarget={importModalState.target}
        onClose={() => setImportModalState((s) => ({ ...s, open: false }))}
        onPublishAnnouncement={(item) => {
          const next = { ...portalData, announcements: [item, ...portalData.announcements] };
          void syncPortalToServer(next, 'Comunicado importado e desafio IA gerado!');
        }}
        onPublishManual={(item) => {
          const next = { ...portalData, manuals: [item, ...portalData.manuals] };
          void syncPortalToServer(next, 'Manual importado no layout padrão com desafio IA!');
        }}
        onPublishOnboarding={(item) => {
          const next = {
            ...portalData,
            onboardingSteps: [
              ...portalData.onboardingSteps,
              { ...item, order: portalData.onboardingSteps.length + 1 },
            ],
          };
          void syncPortalToServer(next, 'Módulo de Onboarding importado com sucesso!');
        }}
      />

      {/* Admin Unified Edit Modal */}
      <AdminEditModal
        entity={editEntity}
        adminToken={effectiveAdminToken}
        onClose={() => setEditEntity(null)}
        onSave={handleAdminSave}
        onWarning={(msg) => showToast(msg)}
        onOpenImageSettings={() => setImageSettingsOpen(true)}
      />

      {/* Quick Image Auto-Crop Modal */}
      <ImageAutoCropModal
        isOpen={Boolean(quickCropTarget)}
        title={quickCropTarget?.title || 'Alterar Imagem'}
        aspectRatio={quickCropTarget?.aspectRatio || '16:9'}
        currentImageUrl={quickCropTarget?.currentImageUrl}
        onSave={(dataUrl) => {
          quickCropTarget?.onApply(dataUrl);
        }}
        onClose={() => setQuickCropTarget(null)}
      />

      {/* Points / Action Toast */}
      {toast && (
        <div className="fixed bottom-20 sm:bottom-5 left-3 right-3 sm:right-auto sm:left-5 sm:max-w-sm z-50 bg-[#11382B] text-white border border-[#C5A467] rounded-xl px-4 py-3 shadow-2xl flex items-center gap-3">
          <Award className="w-5 h-5 text-[#D8BC83] shrink-0" />
          <p className="text-xs font-medium leading-snug flex-1">{toast}</p>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-white/60 hover:text-white"
            aria-label="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      </div>
    </ImagePolicyProvider>
  );
}
