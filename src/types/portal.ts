export type AnnouncementCategory = 'Obras' | 'Institucional' | 'Eventos' | 'Urgente';

export type ManualArea = 'RH' | 'DP' | 'SST' | 'Qualidade' | 'Engenharia';

export type EligibilityRegime = 'Todos os Colaboradores' | 'Obra' | 'Escritório' | 'Liderança';

export type EligibilityTenure = 'Desde a Admissão' | 'Após 90 dias' | 'Após 6 meses';

export type ChallengeType = 'multiple_choice' | 'true_false' | 'matching' | 'decision_scenario';

export interface EditorialSection {
  id: string;
  heading: string;
  content: string;
}

export interface ChallengeQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MatchingPair {
  id: string;
  term: string;
  definition: string;
}

export interface InteractiveChallenge {
  id: string;
  title: string;
  type: ChallengeType;
  scenarioContext?: string;
  questions: ChallengeQuestion[];
  matchingPairs?: MatchingPair[];
  generatedByAI?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  category: AnnouncementCategory;
  summary: string;
  sections: EditorialSection[];
  coverImage: string;
  author: string;
  publishedAt: string;
  views: number;
  reactions: {
    applause: number;
    insightful: number;
    important: number;
  };
  originalFileId?: string;
  originalFileName?: string;
  originalPdfUrl?: string;
  embeddedGuideImage?: string;
  challenge?: InteractiveChallenge;
}

export interface Benefit {
  id: string;
  title: string;
  provider: string;
  eligibilityRegime: EligibilityRegime;
  eligibilityTenure: EligibilityTenure;
  description: string;
  howToRequest: string;
  coverageSummary: string;
}

export interface VacationEntry {
  id: string;
  employeeName: string;
  role: string;
  sectorOrSite: string;
  photoUrl: string;
  periodType: 'current_month' | 'next_month';
  startDate: string;
  endDate: string;
  focalPointName: string;
  focalPointRole: string;
}

export interface CongratulationMessage {
  id: string;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: string;
}

export interface BirthdayPerson {
  id: string;
  employeeName: string;
  role: string;
  sectorOrSite: string;
  photoUrl: string;
  birthDay: number;
  birthMonth: string;
  messages: CongratulationMessage[];
}

export interface OnboardingStep {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  coverImage: string;
  sections: EditorialSection[];
  originalPdfUrl?: string;
  originalFileName?: string;
  embeddedGuideImage?: string;
  challenge?: InteractiveChallenge;
}

export interface ManualDocument {
  id: string;
  code: string;
  title: string;
  area: ManualArea;
  summary: string;
  updatedAt: string;
  coverImage: string;
  sections: EditorialSection[];
  originalFileId?: string;
  originalFileName?: string;
  originalPdfUrl?: string;
  embeddedGuideImage?: string;
  challenge?: InteractiveChallenge;
}

export interface RankingEntry {
  id: string;
  name: string;
  role: string;
  sectorOrSite: string;
  photoUrl: string;
  points: number;
  isCurrentUser?: boolean;
}

export interface ConstructionProject {
  id: string;
  name: string;
  location: string;
  phase: string;
  progress: number;
  engineer: string;
  deliveryForecast: string;
  safetyDaysWithoutAccidents: number;
  status: 'Em Execução' | 'Acabamento' | 'Pré-Lançamento' | 'Entregue';
}

export interface GamificationRule {
  id: string;
  actionKey: string;
  label: string;
  description: string;
  points: number;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  requiredPoints: number;
  tierName: string;
}

export interface DepartmentContact {
  id: string;
  name: string;
  shortName: string;
  responsibleName: string;
  responsibleRole: string;
  whatsappNumber: string;
  email: string;
  hours: string;
  description: string;
}

export type ImageFitMode = 'blur-backdrop' | 'adapt-contain' | 'smart-crop';

export type ImageBannerRatio = '16:9' | '4:3' | '21:9';

export type ImageQualityPreset = 'high' | 'balanced' | 'compact';

export interface ImageAdaptationSettings {
  bannerAspectRatio: ImageBannerRatio;
  fitMode: ImageFitMode;
  qualityPreset: ImageQualityPreset;
  roundedStyle: 'md' | 'lg' | 'xl';
  goldBorder: boolean;
  autoAdaptUploads: boolean;
}

export interface BrandConfig {
  companyName: string;
  tagline: string;
  heroImage: string;
  heroHeadline: string;
  heroSubheadline: string;
  customLogoUrl?: string;
  imageSettings?: ImageAdaptationSettings;
}

export interface PortalData {
  brand: BrandConfig;
  projects: ConstructionProject[];
  announcements: Announcement[];
  benefits: Benefit[];
  vacations: VacationEntry[];
  birthdays: BirthdayPerson[];
  onboardingSteps: OnboardingStep[];
  manuals: ManualDocument[];
  gamificationRules: GamificationRule[];
  rewards: RewardItem[];
  departments: DepartmentContact[];
  rankingPeers?: RankingEntry[];
}

export interface PointsActivity {
  id: string;
  label: string;
  points: number;
  timestamp: string;
}

export interface CollaboratorProfile {
  name: string;
  role: string;
  sectorOrSite: string;
  photoUrl: string;
  points: number;
  dailyLoginClaimed: boolean;
  readAnnouncementIds: string[];
  completedManualIds: string[];
  completedOnboardingIds: string[];
  congratulatedBirthdayIds: string[];
  completedChallengeIds: string[];
  reactedAnnouncementIds: string[];
  activityLog: PointsActivity[];
}

export type AccessRole = 'master' | 'gestor' | 'usuario';

export interface ManagerPrivileges {
  canEditContent: boolean;
  canDeleteContent: boolean;
  canImportDocuments: boolean;
  canManageUsers: boolean;
}

export type AccountStatus = 'Ativo' | 'Suspenso' | 'Inativo';

export interface ManagedAccount {
  id: string;
  name: string;
  email: string;
  roleTitle: string;
  sectorOrSite: string;
  accessRole: AccessRole;
  status: AccountStatus;
  photoUrl: string;
  createdAt: string;
  createdByName: string;
  updatedAt?: string;
  updatedByName?: string;
  hasPassword?: boolean;
  privileges?: ManagerPrivileges;
}

export interface AuditLogEntry {
  id: string;
  actorName: string;
  actorEmail: string;
  actorRole: AccessRole;
  action: string;
  targetLabel: string;
  timestamp: string;
}

export type PortalViewMode = 'gestor' | 'colaborador';

export interface AuthSessionUser {
  id: string;
  name: string;
  email: string;
  roleTitle: string;
  sectorOrSite: string;
  photoUrl: string;
  accessRole: AccessRole;
  privileges?: ManagerPrivileges;
}

export interface UnactivatedCollaboratorHint {
  id: string;
  name: string;
  email: string;
  roleTitle: string;
  sectorOrSite: string;
}

export type PortalSectionId =
  | 'visao-geral'
  | 'comunicados'
  | 'beneficios'
  | 'ferias'
  | 'aniversariantes'
  | 'onboarding'
  | 'manuais'
  | 'gamificacao'
  | 'setores'
  | 'acesso';
