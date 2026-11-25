import React, { useEffect, useRef, useState } from 'react';
import { Check, ImagePlus, SlidersHorizontal, X } from 'lucide-react';
import { getExportSpec, useImagePolicy } from '../context/ImagePolicyContext';
import { ImageAdaptationSettings, ImageFitMode } from '../types/portal';
import { StandardizedImage } from './StandardizedImage';

interface ImageAutoCropModalProps {
  isOpen: boolean;
  title: string;
  aspectRatio: '16:9' | '1:1';
  currentImageUrl?: string;
  onSave: (standardizedDataUrl: string) => void;
  onClose: () => void;
}

/**
 * Motor de Padronização e Adaptação Automática de Imagens:
 * Adapta qualquer imagem recebida às dimensões padrão configuradas no sistema
 * (com opções de Adaptação Integral Sem Cortes ou Recorte Inteligente 16:9/4:3/21:9/1:1).
 */
async function processAndStandardizeImage(
  file: File,
  aspectRatio: '16:9' | '1:1',
  settings: ImageAdaptationSettings,
  fitMode: ImageFitMode
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const spec = getExportSpec(aspectRatio, settings);
        const targetWidth = spec.width;
        const targetHeight = spec.height;
        const targetRatio = targetWidth / targetHeight;
        const sourceRatio = img.width / img.height;

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Falha ao inicializar processador gráfico.'));
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Fundo padrão institucional Cavalcante & Rolim
        ctx.fillStyle = '#11382B';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        if (fitMode === 'smart-crop') {
          let sx = 0;
          let sy = 0;
          let sWidth = img.width;
          let sHeight = img.height;

          if (sourceRatio > targetRatio) {
            sWidth = img.height * targetRatio;
            sx = (img.width - sWidth) / 2;
          } else if (sourceRatio < targetRatio) {
            sHeight = img.width / targetRatio;
            sy = (img.height - sHeight) / 2;
          }

          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
        } else {
          // Adaptação integral sem cortar bordas ou textos da imagem
          if (fitMode === 'blur-backdrop') {
            let bgSx = 0;
            let bgSy = 0;
            let bgSw = img.width;
            let bgSh = img.height;
            if (sourceRatio > targetRatio) {
              bgSw = img.height * targetRatio;
              bgSx = (img.width - bgSw) / 2;
            } else if (sourceRatio < targetRatio) {
              bgSh = img.width / targetRatio;
              bgSy = (img.height - bgSh) / 2;
            }
            ctx.save();
            ctx.filter = 'blur(26px) brightness(0.62)';
            ctx.drawImage(
              img,
              bgSx,
              bgSy,
              bgSw,
              bgSh,
              -24,
              -24,
              targetWidth + 48,
              targetHeight + 48
            );
            ctx.restore();
          }

          const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
          const drawWidth = img.width * scale;
          const drawHeight = img.height * scale;
          const dx = (targetWidth - drawWidth) / 2;
          const dy = (targetHeight - drawHeight) / 2;
          ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, drawWidth, drawHeight);
        }

        resolve(canvas.toDataURL('image/jpeg', spec.quality));
      };
      img.onerror = () => reject(new Error('Não foi possível ler o arquivo de imagem.'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Erro na leitura do arquivo.'));
    reader.readAsDataURL(file);
  });
}

export const ImageAutoCropModal: React.FC<ImageAutoCropModalProps> = ({
  isOpen,
  title,
  aspectRatio,
  currentImageUrl,
  onSave,
  onClose,
}) => {
  const policy = useImagePolicy();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fitMode, setFitMode] = useState<ImageFitMode>(
    aspectRatio === '1:1' ? 'smart-crop' : policy.fitMode
  );
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPreviewUrl(currentImageUrl || '');
      setSelectedFile(null);
      setFitMode(aspectRatio === '1:1' ? 'smart-crop' : policy.fitMode);
      setError('');
    }
  }, [isOpen, currentImageUrl, aspectRatio, policy.fitMode]);

  useEffect(() => {
    if (!isOpen || !selectedFile) return;
    let cancelled = false;
    setProcessing(true);
    processAndStandardizeImage(selectedFile, aspectRatio, policy, fitMode)
      .then((standardized) => {
        if (!cancelled) {
          setPreviewUrl(standardized);
          setError('');
        }
      })
      .catch((err: any) => {
        if (!cancelled) {
          setError(err?.message || 'Erro ao padronizar imagem.');
        }
      })
      .finally(() => {
        if (!cancelled) setProcessing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, selectedFile, aspectRatio, policy, fitMode]);

  if (!isOpen) return null;

  const exportSpec = getExportSpec(aspectRatio, policy);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setSelectedFile(file);
    e.target.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#11382B]/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auto-crop-title"
    >
      <div className="w-full max-w-xl max-h-[92vh] bg-[#F8F7F4] border border-[#C5A467]/50 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 bg-[#11382B] text-white shrink-0">
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.16em] text-[#D8BC83]">
              Adaptação Automática · Padrão {exportSpec.label}
            </p>
            <h3 id="auto-crop-title" className="font-serif text-lg sm:text-xl font-semibold truncate">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          <p className="text-sm text-[#1C2421]/80 leading-relaxed">
            Qualquer imagem enviada se adapta automaticamente ao tamanho padrão do portal{' '}
            <span className="font-mono font-medium text-[#11382B]">{exportSpec.label}</span>{' '}
            seguindo a configuração global de enquadramento.
          </p>

          <div className="bg-white border border-[#1C2421]/12 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#11382B]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C5A467]" />
              Modo de Adaptação desta Imagem
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(
                [
                  { id: 'blur-backdrop', label: 'Sem Cortar (Fundo Suave)' },
                  { id: 'adapt-contain', label: 'Sem Cortar (Fundo C&R)' },
                  { id: 'smart-crop', label: 'Preencher Tudo (Corte)' },
                ] as { id: ImageFitMode; label: string }[]
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFitMode(option.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border text-left transition-colors ${
                    fitMode === option.id
                      ? 'bg-[#11382B] text-white border-[#11382B]'
                      : 'bg-[#F8F7F4] text-[#1C2421]/80 border-[#1C2421]/15 hover:border-[#C5A467]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className={aspectRatio === '1:1' ? 'max-w-[220px] mx-auto' : 'w-full'}>
            <StandardizedImage
              src={previewUrl || currentImageUrl || ''}
              alt={title}
              aspectRatio={aspectRatio}
              fitModeOverride={fitMode}
              rounded="lg"
              goldBorder
            />
          </div>

          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1C2421]/10">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={processing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#11382B]/30 text-sm font-medium text-[#11382B] hover:bg-[#11382B]/5 transition-colors whitespace-nowrap"
            >
              <ImagePlus className="w-4 h-4 text-[#C5A467]" />
              {processing ? 'Adaptando ao padrão...' : 'Selecionar Nova Imagem'}
            </button>

            <div className="flex flex-wrap items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#1C2421]/70 hover:text-[#1C2421] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!previewUrl || processing}
                onClick={() => {
                  if (previewUrl) {
                    onSave(previewUrl);
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#11382B] text-white text-sm font-medium hover:bg-[#11382B]/90 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                <Check className="w-4 h-4 text-[#D8BC83]" />
                Aplicar Imagem Adaptada
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
