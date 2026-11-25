import React, { useEffect, useState } from 'react';
import {
  Check,
  Crown,
  Edit3,
  FileUp,
  ImagePlus,
  Loader2,
  Maximize2,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react';
import { AuthSessionUser } from '../types/portal';
import { ImageAutoCropModal } from './ImageAutoCropModal';
import { StandardizedImage } from './StandardizedImage';

interface ManagerOptionsModalProps {
  isOpen: boolean;
  adminToken: string;
  authUser: AuthSessionUser;
  onClose: () => void;
  onProfileUpdated: (updatedUser: AuthSessionUser) => void;
  onOpenGovernance: () => void;
  onEditBrand: () => void;
  onOpenImageSettings: () => void;
  onOpenDocumentImport: () => void;
  onSwitchToUserMode: () => void;
}

const SECTOR_OPTIONS = [
  'Matriz - Cavalcante e Rolim Empreendimentos',
  'Manta - Cavalcante e Rolim Design SPE',
  'Watal Patacho Eco Boutique Residence SPE',
  'Residencial Aurora Signature',
];

export const ManagerOptionsModal: React.FC<ManagerOptionsModalProps> = ({
  isOpen,
  adminToken,
  authUser,
  onClose,
  onProfileUpdated,
  onOpenGovernance,
  onEditBrand,
  onOpenImageSettings,
  onOpenDocumentImport,
  onSwitchToUserMode,
}) => {
  const [name, setName] = useState(authUser.name);
  const [email, setEmail] = useState(authUser.email);
  const [roleTitle, setRoleTitle] = useState(authUser.roleTitle);
  const [sectorOrSite, setSectorOrSite] = useState(authUser.sectorOrSite);
  const [photoUrl, setPhotoUrl] = useState(authUser.photoUrl);
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [cropOpen, setCropOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(authUser.name);
      setEmail(authUser.email);
      setRoleTitle(authUser.roleTitle);
      setSectorOrSite(authUser.sectorOrSite);
      setPhotoUrl(authUser.photoUrl);
      setPassword('');
      setError('');
    }
  }, [isOpen, authUser]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/access/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name,
          email,
          roleTitle,
          sectorOrSite,
          photoUrl,
          password: password.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.user) {
        throw new Error(data.error || 'Não foi possível salvar os dados do gestor.');
      }
      onProfileUpdated(data.user);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao atualizar perfil do gestor.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#11382B]/75 backdrop-blur-sm p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manager-options-title"
      >
        <div className="w-full max-w-2xl bg-[#F8F7F4] border border-[#C5A467]/60 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 bg-[#11382B] text-white shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <SlidersHorizontal className="w-4 h-4 text-[#D8BC83] shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#D8BC83] truncate">
                  {authUser.accessRole === 'master' ? 'Acesso Master Ativo' : 'Gestor Autorizado'}
                </p>
                <h3 id="manager-options-title" className="font-serif text-lg sm:text-xl font-semibold truncate">
                  Opções do Gestor da Página
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              aria-label="Fechar opções do gestor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
            {/* Manager Name & Photo Editor */}
            <form
              onSubmit={handleSave}
              className="bg-white border border-[#C5A467]/45 rounded-xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#1C2421]/10 pb-3">
                <div className="flex items-center gap-2">
                  {authUser.accessRole === 'master' ? (
                    <Crown className="w-4 h-4 text-[#C5A467]" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-[#C5A467]" />
                  )}
                  <h4 className="font-serif text-xl font-semibold text-[#11382B]">
                    Identidade do Gestor da Página (Nome &amp; Foto)
                  </h4>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-[#F8F7F4] border border-[#1C2421]/10 rounded-lg p-4">
                <div className="w-20 h-20 shrink-0">
                  <StandardizedImage
                    src={photoUrl}
                    alt={name || 'Foto do gestor'}
                    aspectRatio="1:1"
                    rounded="full"
                    goldBorder
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-semibold text-[#11382B]">
                    {name || 'Gestor da Página'}
                  </p>
                  <p className="text-xs text-[#1C2421]/70">
                    A foto é padronizada automaticamente em proporção 1:1 com filete dourado em todo o portal.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCropOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#11382B] text-white text-xs font-semibold hover:bg-[#11382B]/90 transition-colors"
                  >
                    <ImagePlus className="w-3.5 h-3.5 text-[#D8BC83]" />
                    Alterar Foto do Gestor
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
                    Nome do Gestor da Página
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Willian Vianna"
                    className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
                    E-mail Corporativo
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
                    Cargo / Função
                  </label>
                  <input
                    type="text"
                    required
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
                    Setor / Obra Principal
                  </label>
                  <input
                    type="text"
                    list="mgr-opt-sectors"
                    required
                    value={sectorOrSite}
                    onChange={(e) => setSectorOrSite(e.target.value)}
                    className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                  />
                  <datalist id="mgr-opt-sectors">
                    {SECTOR_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </div>
              </div>

              {authUser.accessRole === 'gestor' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
                    Alterar Minha Senha de Gestor (opcional)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Deixe em branco para manter a senha atual"
                    className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                  />
                </div>
              )}

              {error && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C5A467] text-[#11382B] text-xs font-bold hover:bg-[#D8BC83] disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Salvar Nome e Foto do Gestor
                </button>
              </div>
            </form>

            {/* Page Manager Quick Actions */}
            <div className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-[#11382B] font-semibold">
                Ações Rápidas do Gestor da Página
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenGovernance();
                  }}
                  className="flex items-center gap-3 p-3.5 rounded-lg bg-white border border-[#1C2421]/12 hover:border-[#C5A467] text-left transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-[#C5A467] shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#11382B]">
                      Política de Acesso &amp; Equipe
                    </p>
                    <p className="text-[11px] text-[#1C2421]/65">
                      Incluir, corrigir e excluir usuários e gestores
                    </p>
                  </div>
                </button>

                {(authUser.accessRole === 'master' ||
                  authUser.privileges?.canEditContent !== false) && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEditBrand();
                    }}
                    className="flex items-center gap-3 p-3.5 rounded-lg bg-white border border-[#1C2421]/12 hover:border-[#C5A467] text-left transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-[#C5A467] shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-[#11382B]">
                        Editar Capa &amp; Logotipo
                      </p>
                      <p className="text-[11px] text-[#1C2421]/65">
                        Ajustar marca e texto institucional da capa
                      </p>
                    </div>
                  </button>
                )}

                {(authUser.accessRole === 'master' ||
                  authUser.privileges?.canImportDocuments !== false) && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenDocumentImport();
                    }}
                    className="flex items-center gap-3 p-3.5 rounded-lg bg-white border border-[#1C2421]/12 hover:border-[#C5A467] text-left transition-colors"
                  >
                    <FileUp className="w-4 h-4 text-[#C5A467] shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-[#11382B]">
                        Importar Documento Universal
                      </p>
                      <p className="text-[11px] text-[#1C2421]/65">
                        PDF, Word, Excel, PowerPoint ou imagem
                      </p>
                    </div>
                  </button>
                )}

                {(authUser.accessRole === 'master' ||
                  authUser.privileges?.canEditContent !== false) && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenImageSettings();
                    }}
                    className="flex items-center gap-3 p-3.5 rounded-lg bg-white border border-[#C5A467]/45 hover:border-[#11382B] text-left transition-colors"
                  >
                    <Maximize2 className="w-4 h-4 text-[#C5A467] shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-[#11382B]">
                        Configurar Imagens do Portal
                      </p>
                      <p className="text-[11px] text-[#1C2421]/65">
                        Padronizar tamanho e ajuste automático sem cortes
                      </p>
                    </div>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToUserMode();
                  }}
                  className="flex items-center gap-3 p-3.5 rounded-lg bg-white border border-[#1C2421]/12 hover:border-[#11382B] text-left transition-colors"
                >
                  <Users className="w-4 h-4 text-[#11382B] shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#11382B]">
                      Trocar para Modo Colaborador
                    </p>
                    <p className="text-[11px] text-[#1C2421]/65">
                      Visualizar e interagir apenas como colaborador
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ImageAutoCropModal
        isOpen={cropOpen}
        title="Foto do Gestor da Página (Enquadramento 1:1)"
        aspectRatio="1:1"
        currentImageUrl={photoUrl}
        onSave={(dataUrl) => setPhotoUrl(dataUrl)}
        onClose={() => setCropOpen(false)}
      />
    </>
  );
};
