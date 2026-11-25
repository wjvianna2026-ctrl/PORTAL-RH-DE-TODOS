import React from 'react';
import {
  Award,
  BookOpen,
  Building2,
  CalendarDays,
  Compass,
  Crown,
  Gift,
  HeartHandshake,
  Lock,
  Megaphone,
  MessageCircle,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import {
  AuthSessionUser,
  BrandConfig,
  CollaboratorProfile,
  PortalSectionId,
} from '../types/portal';
import { BrandMonogram } from './BrandMonogram';
import { StandardizedImage } from './StandardizedImage';

export interface PublicCollaboratorOption {
  id: string;
  name: string;
  roleTitle: string;
  sectorOrSite: string;
  photoUrl: string;
}

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: PortalSectionId;
  onSelectSection: (section: PortalSectionId) => void;
  brand: BrandConfig;
  profile: CollaboratorProfile;
  collaboratorOptions?: PublicCollaboratorOption[];
  onSwitchCollaborator?: (opt: PublicCollaboratorOption) => void;
  countsBySection?: Record<PortalSectionId, number>;
  isAdmin: boolean;
  canUseGestorMode: boolean;
  authUser: AuthSessionUser | null;
  onOpenAdminAuth: () => void;
  onSwitchToGestorMode: () => void;
  onOpenManagerOptions?: () => void;
  onSwitchToColaboradorMode: () => void;
  onLogout: () => void;
}

const NAV_ITEMS: {
  id: PortalSectionId;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}[] = [
  {
    id: 'visao-geral',
    label: 'Dashboard & Obras',
    subtitle: 'Indicadores, ranking e canteiros ativos',
    icon: <Building2 className="w-4 h-4" />,
  },
  {
    id: 'comunicados',
    label: 'Mural de Comunicados',
    subtitle: 'Campanhas, obras e avisos urgentes',
    icon: <Megaphone className="w-4 h-4" />,
  },
  {
    id: 'beneficios',
    label: 'Benefícios & Elegibilidade',
    subtitle: 'Quem tem direito e solicitações',
    icon: <HeartHandshake className="w-4 h-4" />,
  },
  {
    id: 'ferias',
    label: 'Programação de Férias',
    subtitle: 'Mês atual, próximo mês e pontos focais',
    icon: <CalendarDays className="w-4 h-4" />,
  },
  {
    id: 'aniversariantes',
    label: 'Aniversariantes do Mês',
    subtitle: 'Mural interativo de felicitações',
    icon: <Gift className="w-4 h-4" />,
  },
  {
    id: 'onboarding',
    label: 'Onboarding Signature',
    subtitle: 'Trilha de integração de talentos',
    icon: <Compass className="w-4 h-4" />,
  },
  {
    id: 'manuais',
    label: 'Biblioteca de Manuais',
    subtitle: 'RH, DP, SST, Qualidade e Engenharia',
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    id: 'gamificacao',
    label: 'Pontos & Prêmios Signature',
    subtitle: 'Regras, desafios e resgate RH',
    icon: <Award className="w-4 h-4" />,
  },
  {
    id: 'setores',
    label: 'Fale com os Setores',
    subtitle: 'Atendimento direto RH, DP, SST e Qualidade',
    icon: <MessageCircle className="w-4 h-4" />,
  },
  {
    id: 'acesso',
    label: 'Política de Acesso & Equipe',
    subtitle: 'Master, gestores, colaboradores e auditoria',
    icon: <ShieldCheck className="w-4 h-4" />,
    adminOnly: true,
  },
];

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeSection,
  onSelectSection,
  brand,
  profile,
  collaboratorOptions = [],
  onSwitchCollaborator,
  countsBySection,
  isAdmin,
  canUseGestorMode,
  authUser,
  onOpenAdminAuth,
  onSwitchToGestorMode,
  onOpenManagerOptions,
  onSwitchToColaboradorMode,
  onLogout,
}) => {
  if (!isOpen) return null;

  const nextMilestone =
    profile.points < 500
      ? 500
      : profile.points < 1000
        ? 1000
        : profile.points < 1500
          ? 1500
          : 2500;
  const progressPercent = Math.min(100, Math.round((profile.points / nextMilestone) * 100));

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Menu do Portal">
      <div
        className="fixed inset-0 bg-[#11382B]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <aside className="relative z-10 w-[90vw] max-w-sm bg-[#11382B] text-white h-full flex flex-col border-r border-[#C5A467]/35 shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-4 sm:py-5 border-b border-[#C5A467]/25">
          <BrandMonogram
            customLogoUrl={brand.customLogoUrl}
            companyName={brand.companyName}
            tagline={brand.tagline}
            variant="light"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Authenticated Profile & Points */}
        <div className="px-6 py-4 bg-black/15 border-b border-[#C5A467]/20 space-y-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 shrink-0">
              <StandardizedImage
                src={isAdmin && authUser ? authUser.photoUrl : profile.photoUrl}
                alt={isAdmin && authUser ? authUser.name : profile.name}
                aspectRatio="1:1"
                rounded="full"
                goldBorder
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {isAdmin && authUser ? authUser.name : profile.name}
              </p>
              <p className="text-xs text-white/70 truncate">
                {isAdmin && authUser ? authUser.roleTitle : profile.role}
              </p>
              <p className="text-[11px] text-[#D8BC83] font-mono tabular-nums mt-0.5">
                {isAdmin && authUser
                  ? `${authUser.accessRole === 'master' ? 'Acesso Master' : 'Gestor da Página'}`
                  : `${profile.points} pts Signature · Modo Colaborador`}
              </p>
            </div>
          </div>

          {isAdmin && authUser && onOpenManagerOptions && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenManagerOptions();
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-[#C5A467]/20 border border-[#C5A467]/55 text-[11px] font-semibold text-[#D8BC83] hover:bg-[#C5A467]/30 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Opções do Gestor · Alterar Nome e Foto
            </button>
          )}

          {canUseGestorMode && !isAdmin && collaboratorOptions.length > 0 && onSwitchCollaborator && (
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/55 mb-1">
                Pré-visualizar Perfil de Colaborador
              </label>
              <select
                value={profile.name}
                onChange={(e) => {
                  const found = collaboratorOptions.find((o) => o.name === e.target.value);
                  if (found) onSwitchCollaborator(found);
                }}
                className="w-full rounded-md bg-[#0C2920] border border-[#C5A467]/35 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#D8BC83]"
              >
                {collaboratorOptions.map((opt) => (
                  <option key={opt.id} value={opt.name}>
                    {opt.name} · {opt.roleTitle}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between text-[11px] text-white/70 mb-1">
              <span>Próximo nível</span>
              <span className="font-mono tabular-nums text-[#D8BC83]">
                {profile.points} / {nextMilestone} pts
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#C5A467] to-[#D8BC83] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {visibleItems.map((item) => {
            const isActive = activeSection === item.id;
            const pendingCount = countsBySection?.[item.id] || 0;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectSection(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-[#C5A467]/20 text-white border border-[#C5A467]/50'
                    : 'text-white/80 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-[#D8BC83]' : 'text-[#C5A467]/80'}>
                  {item.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight truncate">{item.label}</p>
                  <p className="text-[11px] text-white/55 truncate mt-0.5">{item.subtitle}</p>
                </div>
                {pendingCount > 0 && (
                  <span
                    className="font-mono tabular-nums text-[11px] font-bold px-2 py-0.5 rounded bg-[#C5A467] text-[#11382B] shrink-0"
                    aria-label={`${pendingCount} pendências`}
                  >
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Role Mode Option Buttons Footer */}
        <div className="p-4 border-t border-[#C5A467]/25 bg-black/25 space-y-2.5">
          {authUser && (
            <div className="flex items-center justify-between text-xs text-[#D8BC83] px-1">
              <span className="inline-flex items-center gap-1.5 font-semibold truncate">
                {authUser.accessRole === 'master' ? (
                  <Crown className="w-3.5 h-3.5 shrink-0" />
                ) : authUser.accessRole === 'gestor' ? (
                  <UserCheck className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <Users className="w-3.5 h-3.5 shrink-0" />
                )}
                <span className="truncate">
                  {authUser.accessRole === 'master'
                    ? 'Master'
                    : authUser.accessRole === 'gestor'
                      ? 'Gestor'
                      : 'Colaborador'}
                  : {authUser.name}
                </span>
              </span>
            </div>
          )}

          <p className="text-[10px] uppercase tracking-wider text-white/55 px-1">
            Opções de Troca de Modo
          </p>

          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => {
                if (isAdmin) onSwitchToColaboradorMode();
                onClose();
              }}
              className={`w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                !isAdmin
                  ? 'bg-white text-[#11382B]'
                  : 'border border-white/25 text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Modo Colaborador (Visualizar &amp; Interagir)
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (isAdmin && onOpenManagerOptions) {
                  onOpenManagerOptions();
                } else if (canUseGestorMode) {
                  onSwitchToGestorMode();
                } else {
                  onOpenAdminAuth();
                }
              }}
              className={`w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                isAdmin
                  ? 'bg-[#C5A467] text-[#11382B] hover:bg-[#D8BC83]'
                  : 'border border-[#C5A467]/70 text-[#D8BC83] hover:bg-[#C5A467]/15'
              }`}
            >
              {isAdmin ? (
                <SlidersHorizontal className="w-3.5 h-3.5" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              {isAdmin
                ? 'Opções do Gestor (Nome, Foto & Equipe)'
                : canUseGestorMode
                  ? 'Voltar ao Modo Gestor (Inserir · Corrigir · Excluir)'
                  : 'Modo Gestor (Login Administrativo)'}
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg border border-red-400/40 text-red-200 hover:bg-red-500/15 text-xs font-semibold transition-colors"
            >
              Sair da Conta (Tela de Login)
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

