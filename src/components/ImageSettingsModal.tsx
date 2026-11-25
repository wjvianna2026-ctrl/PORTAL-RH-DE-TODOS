import React, { useEffect, useState } from 'react';
import { Check, Image as ImageIcon, Maximize2, RotateCcw, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { mergeImageSettings } from '../context/ImagePolicyContext';
import { ATTACHED_ASSETS, DEFAULT_IMAGE_SETTINGS, GENERATED_ASSETS } from '../data/initialPortalData';
import {
  ImageAdaptationSettings,
  ImageBannerRatio,
  ImageFitMode,
  ImageQualityPreset,
} from '../types/portal';
import { StandardizedImage } from './StandardizedImage';

interface ImageSettingsModalProps {
  isOpen: boolean;
  settings?: ImageAdaptationSettings;
  onSave: (nextSettings: ImageAdaptationSettings) => void;
  onClose: () => void;
}

export const ImageSettingsModal: React.FC<ImageSettingsModalProps> = ({
  isOpen,
  settings,
  onSave,
  onClose,
}) => {
  const [draft, setDraft] = useState<ImageAdaptationSettings>(() =>
    mergeImageSettings(settings)
  );

  useEffect(() => {
    if (isOpen) {
      setDraft(mergeImageSettings(settings));
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const fitOptions: {
    id: ImageFitMode;
    title: string;
    description: string;
  }[] = [
    {
      id: 'blur-backdrop',
      title: 'Adaptação Inteligente Sem Cortes (Recomendado)',
      description:
        'Preserva 100% do conteúdo, QR Codes e textos de imagens verticais ou quadradas usando fundo editorial suavizado nas bordas.',
    },
    {
      id: 'adapt-contain',
      title: 'Enquadramento Integral com Fundo Sólido',
      description:
        'Encaixa a imagem inteira dentro do quadro padrão sobre fundo Verde Esmeralda (#11382B) sem nenhum recorte.',
    },
    {
      id: 'smart-crop',
      title: 'Preenchimento Total (Recorte Central)',
      description:
        'Preenche todo o quadro automaticamente centralizando a foto (ideal apenas para fotografias paisagem).',
    },
  ];

  const ratioOptions: { id: ImageBannerRatio; label: string; spec: string }[] = [
    { id: '16:9', label: '16:9 · Padrão Widescreen', spec: 'Capas de comunicados e manuais' },
    { id: '4:3', label: '4:3 · Editorial Clássico', spec: 'Cartões mais altos para informativos' },
    { id: '21:9', label: '21:9 · Panorâmico Signature', spec: 'Faixa cinematográfica horizontal' },
  ];

  const qualityOptions: { id: ImageQualityPreset; label: string; spec: string }[] = [
    { id: 'high', label: 'Alta Definição (1600px)', spec: 'Máxima nitidez para textos e plantas' },
    { id: 'balanced', label: 'Equilibrada (1280px)', spec: 'Padrão rápido com ótima nitidez' },
    { id: 'compact', label: 'Leve / Mobile (960px)', spec: 'Carregamento ultrarrápido em obra' },
  ];

  return (
    <div
      className="fixed inset-0 z-[55] flex items-center justify-center bg-[#11382B]/75 backdrop-blur-sm p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-settings-title"
    >
      <div className="w-full max-w-4xl bg-[#F8F7F4] border border-[#C5A467]/60 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 bg-[#11382B] text-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Maximize2 className="w-4 h-4 text-[#D8BC83] shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#D8BC83] truncate">
                Configuração do Sistema · Mídia &amp; Layout
              </p>
              <h3
                id="image-settings-title"
                className="font-serif text-lg sm:text-xl font-semibold truncate"
              >
                Padronização Automática de Imagens do Portal
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Fechar configuração de imagens"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          <div className="bg-white border border-[#C5A467]/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#C5A467] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#11382B]">
                  Regra Global Aplicada Automaticamente em Todo o Portal
                </p>
                <p className="text-xs text-[#1C2421]/70 leading-relaxed mt-0.5">
                  Qualquer imagem enviada em Comunicados, Manuais, Onboarding, Obras ou Guias
                  passa automaticamente a se adaptar ao tamanho e enquadramento definidos abaixo.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDraft({ ...DEFAULT_IMAGE_SETTINGS })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1C2421]/15 text-xs font-semibold text-[#11382B] hover:bg-[#F8F7F4] whitespace-nowrap self-start sm:self-center"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#C5A467]" />
              Restaurar Padrão
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left controls */}
            <div className="lg:col-span-7 space-y-5">
              {/* Fit Mode */}
              <div className="bg-white border border-[#1C2421]/12 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#11382B]">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#C5A467]" />
                  1. Como Adaptar Imagens de Tamanhos Diferentes
                </div>
                <div className="space-y-2.5">
                  {fitOptions.map((opt) => {
                    const active = draft.fitMode === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, fitMode: opt.id }))}
                        className={`w-full text-left p-3.5 rounded-xl border transition-colors ${
                          active
                            ? 'bg-[#11382B] text-white border-[#11382B]'
                            : 'bg-[#F8F7F4] text-[#1C2421] border-[#1C2421]/15 hover:border-[#C5A467]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold">{opt.title}</span>
                          {active && <Check className="w-4 h-4 text-[#D8BC83] shrink-0" />}
                        </div>
                        <p
                          className={`text-xs mt-1 leading-relaxed ${
                            active ? 'text-white/80' : 'text-[#1C2421]/65'
                          }`}
                        >
                          {opt.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div className="bg-white border border-[#1C2421]/12 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#11382B]">
                  <ImageIcon className="w-3.5 h-3.5 text-[#C5A467]" />
                  2. Proporção Padrão das Capas e Comunicados
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {ratioOptions.map((opt) => {
                    const active = draft.bannerAspectRatio === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, bannerAspectRatio: opt.id }))}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          active
                            ? 'bg-[#C5A467]/20 border-[#11382B] text-[#11382B]'
                            : 'bg-[#F8F7F4] border-[#1C2421]/15 text-[#1C2421]/80 hover:border-[#C5A467]'
                        }`}
                      >
                        <p className="text-xs font-bold">{opt.label}</p>
                        <p className="text-[11px] opacity-75 mt-0.5">{opt.spec}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quality & Finish */}
              <div className="bg-white border border-[#1C2421]/12 rounded-xl p-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-2.5">
                    3. Resolução e Otimização ao Enviar Imagens
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {qualityOptions.map((opt) => {
                      const active = draft.qualityPreset === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setDraft((d) => ({ ...d, qualityPreset: opt.id }))}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            active
                              ? 'bg-[#C5A467]/20 border-[#11382B] text-[#11382B]'
                              : 'bg-[#F8F7F4] border-[#1C2421]/15 text-[#1C2421]/80 hover:border-[#C5A467]'
                          }`}
                        >
                          <p className="text-xs font-bold">{opt.label}</p>
                          <p className="text-[11px] opacity-75 mt-0.5">{opt.spec}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#1C2421]/10">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-2">
                      Arredondamento dos Quadros
                    </p>
                    <div className="flex gap-2">
                      {(
                        [
                          { id: 'md', label: 'Sóbrio' },
                          { id: 'lg', label: 'Signature' },
                          { id: 'xl', label: 'Suave' },
                        ] as { id: ImageAdaptationSettings['roundedStyle']; label: string }[]
                      ).map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setDraft((d) => ({ ...d, roundedStyle: r.id }))}
                          className={`flex-1 px-2.5 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                            draft.roundedStyle === r.id
                              ? 'bg-[#11382B] text-white border-[#11382B]'
                              : 'bg-[#F8F7F4] text-[#1C2421]/80 border-[#1C2421]/15'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center gap-2.5">
                    <label className="flex items-center gap-2.5 text-xs font-medium text-[#11382B] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draft.goldBorder}
                        onChange={(e) => setDraft((d) => ({ ...d, goldBorder: e.target.checked }))}
                        className="w-4 h-4 accent-[#11382B] rounded"
                      />
                      Aplicar filete dourado Signature (#C5A467)
                    </label>
                    <label className="flex items-center gap-2.5 text-xs font-medium text-[#11382B] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draft.autoAdaptUploads}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, autoAdaptUploads: e.target.checked }))
                        }
                        className="w-4 h-4 accent-[#11382B] rounded"
                      />
                      Auto-adaptar novas imagens ao enviar
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Live Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-[#C5A467]/45 rounded-xl p-4 space-y-4 sticky top-0">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-[#C5A467] font-semibold">
                    Prévia em Tempo Real no Portal
                  </p>
                  <p className="text-xs text-[#1C2421]/70 mt-0.5">
                    Veja como imagens verticais (cartazes/QR) e fotos horizontais se comportam com
                    esta configuração:
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-[#11382B]">
                    Cartaz / Informativo Vertical ({draft.bannerAspectRatio})
                  </p>
                  <StandardizedImage
                    src={ATTACHED_ASSETS.hrRegistrationGuide}
                    alt="Prévia com informativo vertical"
                    ratioOverride={draft.bannerAspectRatio}
                    fitModeOverride={draft.fitMode}
                    rounded={draft.roundedStyle}
                    goldBorder={draft.goldBorder}
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-[#11382B]">
                    Fotografia de Empreendimento ({draft.bannerAspectRatio})
                  </p>
                  <StandardizedImage
                    src={GENERATED_ASSETS.auroraTower}
                    alt="Prévia com fotografia arquitetônica"
                    ratioOverride={draft.bannerAspectRatio}
                    fitModeOverride={draft.fitMode}
                    rounded={draft.roundedStyle}
                    goldBorder={draft.goldBorder}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 bg-white border-t border-[#1C2421]/10 flex flex-wrap items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[#1C2421]/70 hover:text-[#1C2421]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#11382B] text-white text-sm font-semibold hover:bg-[#11382B]/90 transition-colors"
          >
            <Check className="w-4 h-4 text-[#D8BC83]" />
            Salvar Configuração Global de Imagens
          </button>
        </div>
      </div>
    </div>
  );
};
