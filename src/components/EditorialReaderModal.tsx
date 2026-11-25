import React from 'react';
import { Award, BookOpen, CheckCircle2, Download, Gamepad2, X } from 'lucide-react';
import { BrandConfig, EditorialSection, InteractiveChallenge } from '../types/portal';
import { BrandMonogram } from './BrandMonogram';
import { StandardizedImage } from './StandardizedImage';

interface EditorialReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionToken?: string | null;
  brand: BrandConfig;
  kicker: string;
  title: string;
  subtitle?: string;
  metadataLine: string;
  coverImage?: string;
  sections: EditorialSection[];
  originalFileId?: string;
  originalFileName?: string;
  originalPdfUrl?: string;
  embeddedGuideImage?: string;
  isCompleted: boolean;
  completeLabel: string;
  pointsReward: number;
  onMarkComplete: () => void;
  challenge?: InteractiveChallenge;
  isChallengeCompleted?: boolean;
  onOpenChallenge?: (challenge: InteractiveChallenge) => void;
}

export const EditorialReaderModal: React.FC<EditorialReaderModalProps> = ({
  isOpen,
  onClose,
  sessionToken,
  brand,
  kicker,
  title,
  subtitle,
  metadataLine,
  coverImage,
  sections,
  originalFileId,
  originalFileName,
  originalPdfUrl,
  embeddedGuideImage,
  isCompleted,
  completeLabel,
  pointsReward,
  onMarkComplete,
  challenge,
  isChallengeCompleted,
  onOpenChallenge,
}) => {
  if (!isOpen) return null;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`editorial-sec-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAuthenticatedDownload = async () => {
    if (!originalFileId || !sessionToken) return;
    try {
      const res = await fetch(`/api/documents/download/${encodeURIComponent(originalFileId)}`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalFileName || 'documento';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // ignore download error
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#11382B]/75 backdrop-blur-sm p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editorial-doc-title"
    >
      <div className="w-full max-w-5xl max-h-[94vh] bg-[#F8F7F4] border border-[#C5A467]/60 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Institutional Header */}
        <header className="flex items-center justify-between gap-2 sm:gap-4 px-3.5 sm:px-6 py-3 sm:py-4 bg-[#11382B] text-white border-b border-[#C5A467]/40 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
            <BrandMonogram
              customLogoUrl={brand.customLogoUrl}
              companyName={brand.companyName}
              tagline={brand.tagline}
              variant="light"
              compact
            />
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.14em] sm:tracking-[0.2em] text-[#D8BC83] truncate">
                Template Editorial · {kicker}
              </p>
              <p className="text-[11px] sm:text-xs text-white/75 truncate">{metadataLine}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {originalPdfUrl ? (
              <a
                href={originalPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={originalFileName || 'documento.pdf'}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-lg border border-[#C5A467]/60 text-xs font-medium text-[#D8BC83] hover:bg-[#C5A467]/15 transition-colors whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span className="sm:hidden">PDF</span>
                <span className="hidden sm:inline">Baixar PDF Original</span>
              </a>
            ) : (
              originalFileId && (
                <button
                  type="button"
                  onClick={handleAuthenticatedDownload}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-lg border border-[#C5A467]/60 text-xs font-medium text-[#D8BC83] hover:bg-[#C5A467]/15 transition-colors whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5 shrink-0" />
                  <span className="sm:hidden">Baixar</span>
                  <span className="hidden sm:inline">Baixar Arquivo Original</span>
                </button>
              )
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Fechar leitura"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Editorial Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-10 py-6 sm:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              {/* Main Reading Column (65-75ch) */}
              <article className="lg:col-span-8 space-y-6 min-w-0">
                <div className="border-b border-[#1C2421]/15 pb-5 sm:pb-6">
                  <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#C5A467] font-semibold">
                    {kicker}
                  </p>
                  <h2
                    id="editorial-doc-title"
                    className="font-serif text-2xl sm:text-4xl font-semibold text-[#11382B] leading-tight mt-2 text-balance"
                  >
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-sm sm:text-base text-[#1C2421]/80 mt-3 leading-relaxed">
                      {subtitle}
                    </p>
                  )}
                  <p className="text-xs text-[#1C2421]/55 mt-3 font-sans">{metadataLine}</p>
                </div>

                {coverImage && (
                  <StandardizedImage
                    src={coverImage}
                    alt={title}
                    aspectRatio="16:9"
                    rounded="lg"
                    goldBorder
                  />
                )}

                <div className="space-y-7 pt-2 max-w-[68ch]">
                  {sections.map((section, idx) => (
                    <section
                      key={section.id}
                      id={`editorial-sec-${section.id}`}
                      className="scroll-mt-6 space-y-2.5"
                    >
                      <h3 className="font-serif text-2xl font-semibold text-[#11382B]">
                        {section.heading}
                      </h3>
                      <p
                        className={`text-[15.5px] leading-[1.78] text-[#1C2421]/90 whitespace-pre-line ${
                          idx === 0
                            ? 'first-letter:text-4xl first-letter:font-serif first-letter:font-semibold first-letter:text-[#11382B] first-letter:float-left first-letter:mr-2.5 first-letter:leading-none'
                            : ''
                        }`}
                      >
                        {section.content}
                      </p>
                    </section>
                  ))}
                </div>

                {embeddedGuideImage && (
                  <div className="pt-4 border-t border-[#1C2421]/15 space-y-2">
                    <p className="text-xs font-mono uppercase tracking-wider text-[#C5A467] font-semibold">
                      Infográfico Oficial Anexo
                    </p>
                    <div className="rounded-xl overflow-hidden border border-[#C5A467]/50 bg-white">
                      <img
                        src={embeddedGuideImage}
                        alt="Guia visual anexo"
                        referrerPolicy="no-referrer"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  </div>
                )}
              </article>

              {/* Lateral Table of Contents & Actions */}
              <aside className="lg:col-span-4 lg:sticky lg:top-6 space-y-5">
                <div className="bg-white border border-[#1C2421]/10 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#11382B]">
                    <BookOpen className="w-4 h-4 text-[#C5A467]" />
                    Índice Lateral
                  </div>
                  <nav className="space-y-1.5 border-t border-[#1C2421]/10 pt-3">
                    {sections.map((sec, idx) => (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => scrollToSection(sec.id)}
                        className="w-full text-left text-xs text-[#1C2421]/75 hover:text-[#11382B] py-1 transition-colors flex items-start gap-2"
                      >
                        <span className="font-mono text-[#C5A467] shrink-0">
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        <span className="leading-snug">{sec.heading}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Gamification Read Confirmation */}
                <div className="bg-[#11382B] text-white rounded-xl p-5 border border-[#C5A467]/40 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#D8BC83]">
                    <span className="font-medium">Pontuação de Leitura</span>
                    <span className="font-mono tabular-nums font-semibold">+{pointsReward} pts</span>
                  </div>
                  <button
                    type="button"
                    onClick={onMarkComplete}
                    disabled={isCompleted}
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                      isCompleted
                        ? 'bg-white/10 text-[#D8BC83] cursor-default'
                        : 'bg-[#C5A467] text-[#11382B] hover:bg-[#D8BC83]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isCompleted ? 'Leitura Confirmada' : completeLabel}
                  </button>

                  {challenge && onOpenChallenge && (
                    <div className="pt-3 border-t border-white/15 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/80">Desafio Vinculado</span>
                        <span className="font-mono text-[#D8BC83] text-[11px]">
                          +25 pts/acerto
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenChallenge(challenge)}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#C5A467]/60 text-xs font-medium text-white hover:bg-white/10 transition-colors"
                      >
                        <Gamepad2 className="w-4 h-4 text-[#D8BC83]" />
                        {isChallengeCompleted ? 'Jogar Desafio Novamente' : 'Iniciar Mini-Game Interativo'}
                      </button>
                      {isChallengeCompleted && (
                        <p className="text-[11px] text-[#D8BC83] flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5" />
                          Desafio concluído com pontos registrados.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
