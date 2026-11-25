import {
  Announcement,
  CollaboratorProfile,
  InteractiveChallenge,
  ManualDocument,
  OnboardingStep,
  PortalData,
  PortalSectionId,
} from '../types/portal';

export interface PendingOpportunity {
  id: string;
  kind: 'comunicado' | 'manual' | 'onboarding' | 'desafio' | 'aniversario';
  title: string;
  subtitle: string;
  points: number;
  targetSection: PortalSectionId;
  announcement?: Announcement;
  manual?: ManualDocument;
  onboardingStep?: OnboardingStep;
  challenge?: InteractiveChallenge;
}

export interface PendingSummary {
  items: PendingOpportunity[];
  totalAvailablePoints: number;
  countsBySection: Record<PortalSectionId, number>;
}

export function computePendingOpportunities(
  portalData: PortalData,
  profile: CollaboratorProfile
): PendingSummary {
  const items: PendingOpportunity[] = [];
  const countsBySection: Record<PortalSectionId, number> = {
    'visao-geral': 0,
    comunicados: 0,
    beneficios: 0,
    ferias: 0,
    aniversariantes: 0,
    onboarding: 0,
    manuais: 0,
    gamificacao: 0,
    setores: 0,
    acesso: 0,
  };

  // 1. Unread Comunicados (+30 pts)
  for (const ann of portalData.announcements) {
    if (!profile.readAnnouncementIds.includes(ann.id)) {
      countsBySection.comunicados += 1;
      items.push({
        id: `pend-ann-${ann.id}`,
        kind: 'comunicado',
        title: ann.title,
        subtitle: `Comunicado não lido · ${ann.category}`,
        points: 30,
        targetSection: 'comunicados',
        announcement: ann,
      });
    }
    if (ann.challenge && !profile.completedChallengeIds.includes(ann.challenge.id)) {
      countsBySection.comunicados += 1;
      const qCount =
        ann.challenge.type === 'matching'
          ? ann.challenge.matchingPairs?.length || 3
          : ann.challenge.questions.length || 1;
      items.push({
        id: `pend-ch-ann-${ann.challenge.id}`,
        kind: 'desafio',
        title: ann.challenge.title,
        subtitle: `Mini-Game pendente (Comunicado: ${ann.category})`,
        points: qCount * 25 + 50,
        targetSection: 'comunicados',
        challenge: ann.challenge,
      });
    }
  }

  // 2. Unread Manuais (+50 pts)
  for (const man of portalData.manuals) {
    if (!profile.completedManualIds.includes(man.id)) {
      countsBySection.manuais += 1;
      items.push({
        id: `pend-man-${man.id}`,
        kind: 'manual',
        title: man.title,
        subtitle: `Manual não concluído · ${man.code}`,
        points: 50,
        targetSection: 'manuais',
        manual: man,
      });
    }
    if (man.challenge && !profile.completedChallengeIds.includes(man.challenge.id)) {
      countsBySection.manuais += 1;
      const qCount =
        man.challenge.type === 'matching'
          ? man.challenge.matchingPairs?.length || 3
          : man.challenge.questions.length || 1;
      items.push({
        id: `pend-ch-man-${man.challenge.id}`,
        kind: 'desafio',
        title: man.challenge.title,
        subtitle: `Quiz pendente (${man.code})`,
        points: qCount * 25 + 50,
        targetSection: 'manuais',
        challenge: man.challenge,
      });
    }
  }

  // 3. Incomplete Onboarding Steps
  const incompleteOnboarding = portalData.onboardingSteps.filter(
    (s) => !profile.completedOnboardingIds.includes(s.id)
  );
  if (incompleteOnboarding.length > 0) {
    countsBySection.onboarding = incompleteOnboarding.length;
    for (const step of incompleteOnboarding) {
      items.push({
        id: `pend-onb-${step.id}`,
        kind: 'onboarding',
        title: step.title,
        subtitle: `Onboarding Etapa ${String(step.order).padStart(2, '0')} · Rumo aos +150 pts`,
        points: incompleteOnboarding.length === 1 ? 150 : 30,
        targetSection: 'onboarding',
        onboardingStep: step,
      });
    }
  }

  // 4. Un-congratulated Birthdays (+20 pts each)
  for (const bday of portalData.birthdays) {
    if (!profile.congratulatedBirthdayIds.includes(bday.id)) {
      countsBySection.aniversariantes += 1;
      items.push({
        id: `pend-bday-${bday.id}`,
        kind: 'aniversario',
        title: `Parabéns para ${bday.employeeName}`,
        subtitle: `${bday.birthDay} de ${bday.birthMonth} · ${bday.sectorOrSite}`,
        points: 20,
        targetSection: 'aniversariantes',
      });
    }
  }

  const totalAvailablePoints = items.reduce((sum, item) => sum + item.points, 0);

  return {
    items,
    totalAvailablePoints,
    countsBySection,
  };
}
