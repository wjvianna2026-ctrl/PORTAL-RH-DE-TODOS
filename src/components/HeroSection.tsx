import React from 'react';
import { ArrowRight, Award, Building2, ImagePlus, Megaphone, Sparkles } from 'lucide-react';
import { BrandConfig, CollaboratorProfile, ConstructionProject, PortalSectionId } from '../types/portal';

interface HeroSectionProps {
  brand: BrandConfig;
  profile: CollaboratorProfile;
  projects: ConstructionProject[];
  totalAnnouncements: number;
  isAdmin: boolean;
  onNavigate: (section: PortalSectionId) => void;
  onEditHeroImage: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  brand,
  profile,
  projects,
  totalAnnouncements,
  isAdmin,
  onNavigate,
  onEditHeroImage,
}) => {
  const firstName = profile.name.split(' ')[0];
  const avgProgress =
    projects.length > 0
      ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)
      : 0;
  const maxSafeDays =
    projects.length > 0
      ? Math.max(...projects.map((p) => p.safetyDaysWithoutAccidents))
      : 0;

  return (
    <section className="relative w-full overflow-hidden">
      {/* Full-bleed Architectural Hero Banner */}
      <div className="relative min-h-[450px] sm:min-h-[580px] flex flex-col justify-between overflow-hidden bg-[#11382B]">
        <img
          src={brand.heroImage}
          alt="Empreendimento Cavalcante & Rolim Signature Spaces em construção"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Deep Emerald 65% Architectural Gradient Scrim */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, rgba(17, 56, 43, 0.88) 0%, rgba(17, 56, 43, 0.65) 55%, rgba(17, 56, 43, 0.45) 100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#11382B] via-transparent to-[#11382B]/40" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-10 pt-5 sm:pt-8 pb-10 sm:pb-14 flex-1 flex flex-col justify-between gap-8">
          <div className="flex justify-end min-h-[28px]">
            {isAdmin && (
              <button
                type="button"
                onClick={onEditHeroImage}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#11382B]/90 border border-[#C5A467] text-[11px] sm:text-xs font-medium text-[#D8BC83] hover:bg-[#11382B] transition-colors shadow-lg"
              >
                <ImagePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="sm:hidden">Alterar Capa (16:9)</span>
                <span className="hidden sm:inline">Alterar Foto da Capa (Auto-Ajuste 16:9)</span>
              </button>
            )}
          </div>

          <div className="max-w-3xl space-y-4 sm:space-y-5">
            <p className="text-[11px] sm:text-xs font-sans font-medium uppercase tracking-[0.16em] sm:tracking-[0.22em] text-[#D8BC83] leading-relaxed">
              Bem-vindo(a), {firstName} · {profile.sectorOrSite}
            </p>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] sm:leading-[1.08] tracking-tight text-balance">
              {brand.heroHeadline}
            </h1>

            <p className="text-sm sm:text-lg text-white/85 leading-relaxed max-w-2xl">
              {brand.heroSubheadline}
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('comunicados')}
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-lg bg-[#C5A467] text-[#11382B] text-sm font-semibold hover:bg-[#D8BC83] transition-colors whitespace-nowrap"
              >
                <Megaphone className="w-4 h-4 shrink-0" />
                Destaques do Dia ({totalAnnouncements})
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('gamificacao')}
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-lg border border-[#C5A467]/70 bg-[#11382B]/65 text-white text-sm font-medium hover:bg-[#11382B]/90 transition-colors whitespace-nowrap"
              >
                <Award className="w-4 h-4 text-[#D8BC83] shrink-0" />
                Meus Pontos:{' '}
                <span className="font-mono tabular-nums text-[#D8BC83]">{profile.points} pts</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width 4-Column Executive KPI Strip Below Hero */}
      <div className="bg-[#11382B] border-t border-[#C5A467]/30 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-10 py-5 sm:py-6 grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-5 lg:gap-0 lg:divide-x divide-[#C5A467]/20">
          <div className="lg:pr-6">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.14em] sm:tracking-[0.18em] text-[#D8BC83]/85">
              Empreendimentos Ativos
            </p>
            <p className="font-mono tabular-nums text-xl sm:text-3xl font-semibold text-white mt-1">
              {projects.length} obras
            </p>
            <p className="text-[11px] sm:text-xs text-white/65 mt-0.5">Padrão Signature Spaces</p>
          </div>

          <div className="lg:px-6">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.14em] sm:tracking-[0.18em] text-[#D8BC83]/85">
              Avanço Físico Médio
            </p>
            <p className="font-mono tabular-nums text-xl sm:text-3xl font-semibold text-white mt-1">
              {avgProgress}%
            </p>
            <p className="text-[11px] sm:text-xs text-white/65 mt-0.5">Cronograma consolidado</p>
          </div>

          <div className="pt-4 border-t border-[#C5A467]/20 lg:border-t-0 lg:pt-0 lg:px-6">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.14em] sm:tracking-[0.18em] text-[#D8BC83]/85">
              Recorde de Segurança
            </p>
            <p className="font-mono tabular-nums text-xl sm:text-3xl font-semibold text-white mt-1">
              {maxSafeDays} dias
            </p>
            <p className="text-[11px] sm:text-xs text-white/65 mt-0.5">Sem acidentes com afastamento</p>
          </div>

          <div className="pt-4 border-t border-[#C5A467]/20 lg:border-t-0 lg:pt-0 lg:pl-6 flex flex-col justify-between">
            <div>
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.14em] sm:tracking-[0.18em] text-[#D8BC83]/85">
                Sua Jornada Signature
              </p>
              <p className="font-mono tabular-nums text-xl sm:text-3xl font-semibold text-[#D8BC83] mt-1">
                {profile.points} pts
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('visao-geral')}
              className="text-[11px] sm:text-xs text-white/80 hover:text-[#D8BC83] inline-flex items-center gap-1 mt-1 transition-colors self-start"
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              Ver painel de obras
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
