import React, { useEffect, useRef, useState } from 'react';
import { FileUp, Loader2, Sparkles, Upload, X } from 'lucide-react';
import { GENERATED_ASSETS } from '../data/initialPortalData';
import {
  Announcement,
  AnnouncementCategory,
  EditorialSection,
  InteractiveChallenge,
  ManualArea,
  ManualDocument,
  OnboardingStep,
} from '../types/portal';

interface DocumentImportModalProps {
  isOpen: boolean;
  adminToken: string | null;
  defaultTarget?: 'comunicado' | 'manual' | 'onboarding';
  onClose: () => void;
  onPublishAnnouncement: (item: Announcement) => void;
  onPublishManual: (item: ManualDocument) => void;
  onPublishOnboarding: (item: OnboardingStep) => void;
}

export const DocumentImportModal: React.FC<DocumentImportModalProps> = ({
  isOpen,
  adminToken,
  defaultTarget = 'manual',
  onClose,
  onPublishAnnouncement,
  onPublishManual,
  onPublishOnboarding,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetModule, setTargetModule] = useState<'comunicado' | 'manual' | 'onboarding'>(defaultTarget);
  const [category, setCategory] = useState<AnnouncementCategory>('Institucional');
  const [area, setArea] = useState<ManualArea>('RH');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importedResult, setImportedResult] = useState<{
    fileId: string;
    originalFileName: string;
    title: string;
    summary: string;
    sections: EditorialSection[];
    challenge: InteractiveChallenge;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTargetModule(defaultTarget);
      setError('');
    }
  }, [isOpen, defaultTarget]);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    if (!adminToken) {
      setError('Autentique-se no Modo Gestor para importar documentos.');
      return;
    }
    setSelectedFile(file);
    setError('');
    setLoading(true);
    setImportedResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/documents/import', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = String(data.error || '');
        if (msg.includes('503') || msg.toLowerCase().includes('high demand') || msg.toLowerCase().includes('unavailable')) {
          throw new Error('O serviço de IA está temporariamente com alta demanda. Tente importar novamente em alguns segundos.');
        }
        throw new Error(msg || 'Erro ao importar arquivo.');
      }

      setImportedResult(data);
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (msg.includes('503') || msg.toLowerCase().includes('high demand') || msg.toLowerCase().includes('unavailable')) {
        setError('O serviço de IA está temporariamente com alta demanda. Tente importar novamente em alguns segundos.');
      } else {
        setError(msg || 'Não foi possível processar o documento.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = () => {
    if (!importedResult) return;
    const nowId = Date.now().toString(36);

    if (targetModule === 'comunicado') {
      onPublishAnnouncement({
        id: `com-${nowId}`,
        title: importedResult.title,
        category,
        summary: importedResult.summary,
        sections: importedResult.sections,
        coverImage: GENERATED_ASSETS.auroraTower,
        author: 'Gestão C&R · Importação Editorial',
        publishedAt: 'Hoje',
        views: 1,
        reactions: { applause: 0, insightful: 0, important: 0 },
        originalFileId: importedResult.fileId,
        originalFileName: importedResult.originalFileName,
        challenge: importedResult.challenge,
      });
    } else if (targetModule === 'manual') {
      onPublishManual({
        id: `man-${nowId}`,
        code: `MNL-${area}-${String(Math.floor(100 + Math.random() * 899))}`,
        title: importedResult.title,
        area,
        summary: importedResult.summary,
        updatedAt: 'Nov 2026 · Rev. 01',
        coverImage: GENERATED_ASSETS.heroTower,
        sections: importedResult.sections,
        originalFileId: importedResult.fileId,
        originalFileName: importedResult.originalFileName,
        challenge: importedResult.challenge,
      });
    } else {
      onPublishOnboarding({
        id: `onb-${nowId}`,
        order: 99,
        title: importedResult.title,
        subtitle: importedResult.summary,
        estimatedMinutes: 6,
        coverImage: GENERATED_ASSETS.safetySite,
        sections: importedResult.sections,
        challenge: importedResult.challenge,
      });
    }

    setImportedResult(null);
    setSelectedFile(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#11382B]/75 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-import-title"
    >
      <div className="w-full max-w-2xl bg-[#F8F7F4] border border-[#C5A467]/60 rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 bg-[#11382B] text-white shrink-0">
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.16em] text-[#D8BC83]">
              Motor Universal de Documentos + IA
            </p>
            <h3 id="doc-import-title" className="font-serif text-lg sm:text-xl font-semibold truncate">
              Importar Arquivo para Layout Padrão C&amp;R
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Fechar importação"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1.5">
                Destino no Portal
              </label>
              <select
                value={targetModule}
                onChange={(e) => setTargetModule(e.target.value as any)}
                className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2.5 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
              >
                <option value="manual">Biblioteca de Manuais</option>
                <option value="comunicado">Mural de Comunicados</option>
                <option value="onboarding">Trilha de Onboarding</option>
              </select>
            </div>

            {targetModule === 'comunicado' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1.5">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}
                  className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2.5 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                >
                  <option value="Obras">Obras</option>
                  <option value="Institucional">Institucional</option>
                  <option value="Eventos">Eventos</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </div>
            )}

            {targetModule === 'manual' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1.5">
                  Área Responsável
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value as ManualArea)}
                  className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2.5 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                >
                  <option value="RH">RH</option>
                  <option value="DP">DP</option>
                  <option value="SST">SST</option>
                  <option value="Qualidade">Qualidade</option>
                  <option value="Engenharia">Engenharia</option>
                </select>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.xlsx,.xls,.csv,.txt,.md,.pptx,image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleProcessFile(f);
            }}
            className="hidden"
          />

          <button
            type="button"
            disabled={loading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-[#C5A467] bg-white hover:bg-[#C5A467]/5 rounded-xl p-6 text-center transition-colors"
          >
            {loading ? (
              <div className="flex flex-col items-center gap-2 text-[#11382B]">
                <Loader2 className="w-7 h-7 animate-spin text-[#C5A467]" />
                <p className="text-sm font-medium">
                  Extraindo conteúdo, padronizando editorialmente e gerando Mini-Game com IA...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-[#11382B]">
                <Upload className="w-7 h-7 text-[#C5A467]" />
                <p className="text-sm font-semibold">
                  {selectedFile
                    ? `Arquivo selecionado: ${selectedFile.name}`
                    : 'Clique para enviar qualquer arquivo (.pdf, .docx, .xlsx, .pptx, .txt ou imagem)'}
                </p>
                <p className="text-xs text-[#1C2421]/60">
                  O texto será extraído automaticamente no Template Editorial C&amp;R com desafio interativo vinculado.
                </p>
              </div>
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 text-sm text-red-800">
              {error}
            </div>
          )}

          {importedResult && (
            <div className="bg-white border border-[#C5A467]/50 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-[#C5A467] font-semibold">
                    Prévia Editorial Gerada
                  </p>
                  <h4 className="font-serif text-2xl font-semibold text-[#11382B] mt-0.5">
                    {importedResult.title}
                  </h4>
                </div>
                <FileUp className="w-5 h-5 text-[#11382B] shrink-0" />
              </div>

              <p className="text-sm text-[#1C2421]/80 leading-relaxed">{importedResult.summary}</p>

              <div className="border-t border-[#1C2421]/10 pt-3 space-y-1.5">
                <p className="text-xs font-semibold text-[#11382B]">
                  {importedResult.sections.length} seções estruturadas para o Índice Lateral
                </p>
                <p className="text-xs text-[#11382B] inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A467]" />
                  Mini-Game gerado automaticamente: <strong>{importedResult.challenge.title}</strong>
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm text-[#1C2421]/70 hover:text-[#1C2421]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  className="px-5 py-2.5 rounded-lg bg-[#11382B] text-white text-sm font-medium hover:bg-[#11382B]/90 transition-colors"
                >
                  Publicar no Portal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
