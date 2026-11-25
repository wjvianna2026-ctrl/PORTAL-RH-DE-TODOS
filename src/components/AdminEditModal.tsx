import React, { useEffect, useState } from 'react';
import { ImagePlus, Loader2, Maximize2, Sparkles, X } from 'lucide-react';
import { useImagePolicy } from '../context/ImagePolicyContext';
import { GENERATED_ASSETS } from '../data/initialPortalData';
import {
  Announcement,
  Benefit,
  BirthdayPerson,
  BrandConfig,
  ConstructionProject,
  DepartmentContact,
  GamificationRule,
  InteractiveChallenge,
  ManualDocument,
  OnboardingStep,
  RewardItem,
  VacationEntry,
} from '../types/portal';
import { ImageAutoCropModal } from './ImageAutoCropModal';
import { StandardizedImage } from './StandardizedImage';

function formatFriendlyApiError(raw: unknown): string {
  const text = String(raw || '').trim();
  if (!text) return 'Não foi possível concluir a operação no momento.';
  if (
    text.includes('503') ||
    text.toLowerCase().includes('high demand') ||
    text.toLowerCase().includes('unavailable')
  ) {
    return 'O serviço de IA está temporariamente com alta demanda. Tente novamente em instantes.';
  }
  if (text.startsWith('{') && text.includes('"error"')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed?.error?.message) return String(parsed.error.message);
    } catch {
      // ignore
    }
  }
  return text;
}

export type AdminEditEntity =
  | { kind: 'brand'; item: BrandConfig }
  | { kind: 'project'; item?: ConstructionProject }
  | { kind: 'announcement'; item?: Announcement }
  | { kind: 'benefit'; item?: Benefit }
  | { kind: 'vacation'; item?: VacationEntry }
  | { kind: 'birthday'; item?: BirthdayPerson }
  | { kind: 'onboarding'; item?: OnboardingStep }
  | { kind: 'manual'; item?: ManualDocument }
  | { kind: 'department'; item?: DepartmentContact }
  | { kind: 'rule'; item?: GamificationRule }
  | { kind: 'reward'; item?: RewardItem };

interface AdminEditModalProps {
  entity: AdminEditEntity | null;
  adminToken: string | null;
  onClose: () => void;
  onSave: (entityKind: AdminEditEntity['kind'], data: any) => void;
  onWarning?: (message: string) => void;
  onOpenImageSettings?: () => void;
}

export const AdminEditModal: React.FC<AdminEditModalProps> = ({
  entity,
  adminToken,
  onClose,
  onSave,
  onWarning,
  onOpenImageSettings,
}) => {
  const imagePolicy = useImagePolicy();
  const [form, setForm] = useState<any>({});
  const [autoGenerateQuiz, setAutoGenerateQuiz] = useState(true);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [error, setError] = useState('');
  const [cropConfig, setCropConfig] = useState<{
    field: string;
    title: string;
    aspectRatio: '16:9' | '1:1';
  } | null>(null);

  useEffect(() => {
    if (!entity) return;
    setError('');
    if (entity.kind === 'brand') {
      setForm({ ...entity.item });
    } else if (entity.kind === 'project') {
      setForm(
        entity.item || {
          id: `proj-${Date.now().toString(36)}`,
          name: '',
          location: 'Maceió · AL',
          phase: 'Estrutura & Acabamento',
          progress: 50,
          engineer: '',
          deliveryForecast: 'Dezembro 2027',
          safetyDaysWithoutAccidents: 100,
          status: 'Em Execução',
        }
      );
    } else if (entity.kind === 'announcement') {
      const existingBody = entity.item?.sections?.map((s) => `${s.heading}\n${s.content}`).join('\n\n') || '';
      setForm(
        entity.item
          ? { ...entity.item, bodyText: existingBody }
          : {
              id: `com-${Date.now().toString(36)}`,
              title: '',
              category: 'Institucional',
              summary: '',
              author: 'Recursos Humanos · Willian Vianna',
              publishedAt: 'Hoje',
              coverImage: GENERATED_ASSETS.auroraTower,
              views: 1,
              reactions: { applause: 0, insightful: 0, important: 0 },
              bodyText: '',
            }
      );
      setAutoGenerateQuiz(!entity.item?.challenge);
    } else if (entity.kind === 'benefit') {
      setForm(
        entity.item || {
          id: `ben-${Date.now().toString(36)}`,
          title: '',
          provider: 'Cavalcante & Rolim',
          eligibilityRegime: 'Todos os Colaboradores',
          eligibilityTenure: 'Desde a Admissão',
          coverageSummary: '',
          description: '',
          howToRequest: '',
        }
      );
    } else if (entity.kind === 'vacation') {
      setForm(
        entity.item || {
          id: `vac-${Date.now().toString(36)}`,
          employeeName: '',
          role: '',
          sectorOrSite: '',
          photoUrl: GENERATED_ASSETS.avatar1,
          periodType: 'current_month',
          startDate: '',
          endDate: '',
          focalPointName: '',
          focalPointRole: '',
        }
      );
    } else if (entity.kind === 'birthday') {
      setForm(
        entity.item || {
          id: `bday-${Date.now().toString(36)}`,
          employeeName: '',
          role: '',
          sectorOrSite: '',
          photoUrl: GENERATED_ASSETS.avatar2,
          birthDay: 15,
          birthMonth: 'Novembro',
          messages: [],
        }
      );
    } else if (entity.kind === 'onboarding') {
      const existingBody = entity.item?.sections?.map((s) => `${s.heading}\n${s.content}`).join('\n\n') || '';
      setForm(
        entity.item
          ? { ...entity.item, bodyText: existingBody }
          : {
              id: `onb-${Date.now().toString(36)}`,
              order: 6,
              title: '',
              subtitle: '',
              estimatedMinutes: 5,
              coverImage: GENERATED_ASSETS.heroTower,
              bodyText: '',
            }
      );
      setAutoGenerateQuiz(!entity.item?.challenge);
    } else if (entity.kind === 'manual') {
      const existingBody = entity.item?.sections?.map((s) => `${s.heading}\n${s.content}`).join('\n\n') || '';
      setForm(
        entity.item
          ? { ...entity.item, bodyText: existingBody }
          : {
              id: `man-${Date.now().toString(36)}`,
              code: `MNL-GEN-${Math.floor(100 + Math.random() * 899)}`,
              title: '',
              area: 'RH',
              summary: '',
              updatedAt: 'Nov 2026 · Rev. 01',
              coverImage: GENERATED_ASSETS.safetySite,
              bodyText: '',
            }
      );
      setAutoGenerateQuiz(!entity.item?.challenge);
    } else if (entity.kind === 'department') {
      setForm(
        entity.item || {
          id: `dep-${Date.now().toString(36)}`,
          name: '',
          shortName: '',
          responsibleName: '',
          responsibleRole: '',
          whatsappNumber: '558287660143',
          email: '',
          hours: 'Seg a Sex · 08h00 às 18h00',
          description: '',
        }
      );
    } else if (entity.kind === 'rule') {
      setForm(
        entity.item || {
          id: `rule-${Date.now().toString(36)}`,
          actionKey: `custom_${Date.now().toString(36)}`,
          label: '',
          description: '',
          points: 20,
        }
      );
    } else if (entity.kind === 'reward') {
      setForm(
        entity.item || {
          id: `rew-${Date.now().toString(36)}`,
          title: '',
          tierName: 'Nível Signature',
          requiredPoints: 500,
          description: '',
        }
      );
    }
  }, [entity]);

  if (!entity) return null;

  const parseSectionsFromBody = (bodyText: string, fallbackHeading: string) => {
    const blocks = bodyText
      .split(/\n{2,}/)
      .map((b) => b.trim())
      .filter(Boolean);
    if (blocks.length === 0) {
      return [{ id: `sec-${Date.now()}`, heading: fallbackHeading, content: bodyText || fallbackHeading }];
    }
    return blocks.map((block, idx) => {
      const lines = block.split('\n');
      if (lines.length > 1 && lines[0].length < 85) {
        return {
          id: `sec-${idx}-${Date.now()}`,
          heading: lines[0].trim(),
          content: lines.slice(1).join('\n').trim(),
        };
      }
      return {
        id: `sec-${idx}-${Date.now()}`,
        heading: idx === 0 ? fallbackHeading : `Seção ${idx + 1}`,
        content: block,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload = { ...form };
    const supportsChallenge =
      entity.kind === 'announcement' || entity.kind === 'manual' || entity.kind === 'onboarding';

    let aiWarning = '';
    if (supportsChallenge) {
      const sections = parseSectionsFromBody(
        payload.bodyText || payload.summary || payload.subtitle || '',
        payload.title || 'Conteúdo Principal'
      );
      payload.sections = sections;
      delete payload.bodyText;

      if (autoGenerateQuiz && adminToken) {
        setGeneratingQuiz(true);
        try {
          const contentText = `${payload.summary || payload.subtitle || ''}\n${sections
            .map((s: any) => `${s.heading}: ${s.content}`)
            .join('\n')}`;
          const res = await fetch('/api/ai/generate-challenge', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({
              title: payload.title,
              contentText,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(formatFriendlyApiError(data.error));
          }
          payload.challenge = data.challenge as InteractiveChallenge;
        } catch (err: any) {
          // Não bloqueia a publicação do comunicado/manual caso a IA esteja com alta demanda momentânea
          aiWarning = `Conteúdo salvo com sucesso! Porém, o Mini-Game por IA não pôde ser gerado agora: ${formatFriendlyApiError(
            err?.message
          )}`;
        } finally {
          setGeneratingQuiz(false);
        }
      }
    }

    onSave(entity.kind, payload);
    if (aiWarning && onWarning) {
      onWarning(aiWarning);
    }
    onClose();
  };

  const renderInput = (label: string, field: string, type: 'text' | 'number' = 'text') => (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
        {label}
      </label>
      <input
        type={type}
        required
        value={form[field] ?? ''}
        onChange={(e) =>
          setForm((prev: any) => ({
            ...prev,
            [field]: type === 'number' ? Number(e.target.value) : e.target.value,
          }))
        }
        className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
      />
    </div>
  );

  const renderTextarea = (label: string, field: string, rows = 3) => (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
        {label}
      </label>
      <textarea
        rows={rows}
        required
        value={form[field] ?? ''}
        onChange={(e) => setForm((prev: any) => ({ ...prev, [field]: e.target.value }))}
        className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm text-[#1C2421] focus:outline-none focus:border-[#11382B]"
      />
    </div>
  );

  const renderImagePicker = (label: string, field: string, aspectRatio: '16:9' | '1:1') => {
    const appliedRatio = aspectRatio === '1:1' ? '1:1' : imagePolicy.bannerAspectRatio;
    const fitLabel =
      aspectRatio === '1:1'
        ? 'Avatar 1:1'
        : imagePolicy.fitMode === 'smart-crop'
          ? 'Preenchimento Total'
          : 'Adaptação Sem Cortes';
    return (
      <div className="bg-white border border-[#1C2421]/12 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={aspectRatio === '1:1' ? 'w-14 shrink-0' : 'w-24 shrink-0'}>
            <StandardizedImage
              src={form[field] || ''}
              alt={label}
              aspectRatio={aspectRatio}
              rounded="md"
              goldBorder
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#11382B]">{label}</p>
            <p className="text-[11px] text-[#1C2421]/60">
              Padrão {appliedRatio} · {fitLabel}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCropConfig({ field, title: label, aspectRatio })}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#C5A467] text-xs font-medium text-[#11382B] hover:bg-[#C5A467]/10 transition-colors shrink-0"
        >
          <ImagePlus className="w-3.5 h-3.5 text-[#C5A467]" />
          Alterar Imagem
        </button>
      </div>
    );
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#11382B]/75 backdrop-blur-sm p-3 sm:p-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full max-w-2xl max-h-[92vh] bg-[#F8F7F4] border border-[#C5A467]/60 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 bg-[#11382B] text-white shrink-0">
            <h3 className="font-serif text-lg sm:text-xl font-semibold truncate">
              Painel do Gestor · Edição de Conteúdo
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/75 hover:text-white hover:bg-white/10 shrink-0"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
            {entity.kind === 'brand' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {renderInput('Nome da Construtora', 'companyName')}
                  {renderInput('Assinatura / Tagline', 'tagline')}
                </div>
                {renderInput('Título Principal da Capa (Hero)', 'heroHeadline')}
                {renderTextarea('Subtítulo de Boas-Vindas', 'heroSubheadline', 3)}
                {renderImagePicker('Fotografia Principal da Capa (Obra)', 'heroImage', '16:9')}
                {renderImagePicker('Logotipo / Monograma Customizado (Opcional)', 'customLogoUrl', '1:1')}
                {onOpenImageSettings && (
                  <div className="bg-[#11382B]/5 border border-[#C5A467]/45 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[#11382B]">
                        Adaptação Automática Global de Imagens
                      </p>
                      <p className="text-[11px] text-[#1C2421]/70">
                        Defina proporção ({imagePolicy.bannerAspectRatio}) e ajuste sem cortes para
                        todas as imagens inseridas no portal.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenImageSettings();
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#11382B] text-[#D8BC83] text-xs font-semibold hover:bg-[#11382B]/90 whitespace-nowrap shrink-0"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      Configurar Imagens
                    </button>
                  </div>
                )}
              </>
            )}

            {entity.kind === 'project' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {renderInput('Nome do Empreendimento', 'name')}
                  {renderInput('Localização', 'location')}
                  {renderInput('Fase Atual', 'phase')}
                  {renderInput('Engenheiro Responsável', 'engineer')}
                  {renderInput('Progresso Físico (%)', 'progress', 'number')}
                  {renderInput('Previsão de Entrega', 'deliveryForecast')}
                  {renderInput('Dias sem Acidentes', 'safetyDaysWithoutAccidents', 'number')}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
                      Status da Obra
                    </label>
                    <select
                      value={form.status || 'Em Execução'}
                      onChange={(e) => setForm((p: any) => ({ ...p, status: e.target.value }))}
                      className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm"
                    >
                      <option value="Pré-Lançamento">Pré-Lançamento</option>
                      <option value="Em Execução">Em Execução</option>
                      <option value="Acabamento">Acabamento</option>
                      <option value="Entregue">Entregue</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {entity.kind === 'announcement' && (
              <>
                {renderInput('Título do Comunicado', 'title')}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
                      Categoria
                    </label>
                    <select
                      value={form.category || 'Institucional'}
                      onChange={(e) => setForm((p: any) => ({ ...p, category: e.target.value }))}
                      className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm"
                    >
                      <option value="Obras">Obras</option>
                      <option value="Institucional">Institucional</option>
                      <option value="Eventos">Eventos</option>
                      <option value="Urgente">Urgente</option>
                    </select>
                  </div>
                  {renderInput('Autor / Setor Emissor', 'author')}
                </div>
                {renderTextarea('Resumo do Comunicado', 'summary', 2)}
                {renderTextarea('Texto Completo (separe seções com linha em branco)', 'bodyText', 5)}
                {renderImagePicker('Imagem de Capa do Comunicado', 'coverImage', '16:9')}
              </>
            )}

            {entity.kind === 'benefit' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {renderInput('Nome do Benefício', 'title')}
                  {renderInput('Operadora / Provedor', 'provider')}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
                      Elegibilidade (Regime / Cargo)
                    </label>
                    <select
                      value={form.eligibilityRegime || 'Todos os Colaboradores'}
                      onChange={(e) =>
                        setForm((p: any) => ({ ...p, eligibilityRegime: e.target.value }))
                      }
                      className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm"
                    >
                      <option value="Todos os Colaboradores">Todos os Colaboradores</option>
                      <option value="Obra">Obra</option>
                      <option value="Escritório">Escritório</option>
                      <option value="Liderança">Liderança</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
                      Carência / Tempo de Empresa
                    </label>
                    <select
                      value={form.eligibilityTenure || 'Desde a Admissão'}
                      onChange={(e) =>
                        setForm((p: any) => ({ ...p, eligibilityTenure: e.target.value }))
                      }
                      className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm"
                    >
                      <option value="Desde a Admissão">Desde a Admissão</option>
                      <option value="Após 90 dias">Após 90 dias</option>
                      <option value="Após 6 meses">Após 6 meses</option>
                    </select>
                  </div>
                </div>
                {renderInput('Resumo de Cobertura / Valor', 'coverageSummary')}
                {renderTextarea('Descrição Detalhada', 'description', 2)}
                {renderTextarea('Como Solicitar / Utilizar', 'howToRequest', 2)}
              </>
            )}

            {entity.kind === 'vacation' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {renderInput('Nome do Colaborador', 'employeeName')}
                  {renderInput('Cargo', 'role')}
                  {renderInput('Obra ou Setor', 'sectorOrSite')}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
                      Programação
                    </label>
                    <select
                      value={form.periodType || 'current_month'}
                      onChange={(e) => setForm((p: any) => ({ ...p, periodType: e.target.value }))}
                      className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm"
                    >
                      <option value="current_month">Férias do Mês Atual</option>
                      <option value="next_month">Férias do Próximo Mês</option>
                    </select>
                  </div>
                  {renderInput('Início do Descanso', 'startDate')}
                  {renderInput('Retorno / Término', 'endDate')}
                  {renderInput('Ponto Focal (Substituto)', 'focalPointName')}
                  {renderInput('Cargo do Ponto Focal', 'focalPointRole')}
                </div>
                {renderImagePicker('Foto do Colaborador', 'photoUrl', '1:1')}
              </>
            )}

            {entity.kind === 'birthday' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {renderInput('Nome do Aniversariante', 'employeeName')}
                  {renderInput('Cargo', 'role')}
                  {renderInput('Setor ou Obra', 'sectorOrSite')}
                  {renderInput('Mês de Aniversário', 'birthMonth')}
                  {renderInput('Dia do Aniversário', 'birthDay', 'number')}
                </div>
                {renderImagePicker('Foto do Aniversariante', 'photoUrl', '1:1')}
              </>
            )}

            {entity.kind === 'onboarding' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {renderInput('Ordem (Etapa)', 'order', 'number')}
                  <div className="sm:col-span-2">{renderInput('Título da Etapa', 'title')}</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">{renderInput('Subtítulo', 'subtitle')}</div>
                  {renderInput('Duração (min)', 'estimatedMinutes', 'number')}
                </div>
                {renderTextarea('Conteúdo do Módulo (separe seções com linha em branco)', 'bodyText', 5)}
                {renderImagePicker('Imagem da Etapa', 'coverImage', '16:9')}
              </>
            )}

            {entity.kind === 'manual' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {renderInput('Código (ex: MNL-SST-020)', 'code')}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
                      Área
                    </label>
                    <select
                      value={form.area || 'RH'}
                      onChange={(e) => setForm((p: any) => ({ ...p, area: e.target.value }))}
                      className="w-full rounded-lg border border-[#1C2421]/20 bg-white px-3.5 py-2 text-sm"
                    >
                      <option value="RH">RH</option>
                      <option value="DP">DP</option>
                      <option value="SST">SST</option>
                      <option value="Qualidade">Qualidade</option>
                      <option value="Engenharia">Engenharia</option>
                    </select>
                  </div>
                  {renderInput('Revisão / Data', 'updatedAt')}
                </div>
                {renderInput('Título do Manual', 'title')}
                {renderTextarea('Resumo Executivo', 'summary', 2)}
                {renderTextarea('Conteúdo Técnico (separe seções com linha em branco)', 'bodyText', 5)}
                {renderImagePicker('Imagem de Capa do Manual', 'coverImage', '16:9')}
              </>
            )}

            {entity.kind === 'department' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {renderInput('Nome do Setor', 'name')}
                  {renderInput('Sigla / Curto', 'shortName')}
                  {renderInput('Responsável', 'responsibleName')}
                  {renderInput('Cargo do Responsável', 'responsibleRole')}
                  {renderInput('WhatsApp (somente números com DDI, ex: 558287660143)', 'whatsappNumber')}
                  {renderInput('E-mail de Contato', 'email')}
                </div>
                {renderInput('Horário de Atendimento', 'hours')}
                {renderTextarea('Escopo de Atendimento', 'description', 2)}
              </>
            )}

            {entity.kind === 'rule' && (
              <>
                {renderInput('Ação da Regra', 'label')}
                {renderTextarea('Descrição', 'description', 2)}
                {renderInput('Pontuação (+ pts)', 'points', 'number')}
              </>
            )}

            {entity.kind === 'reward' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {renderInput('Nome do Prêmio', 'title')}
                  {renderInput('Nível Signature', 'tierName')}
                </div>
                {renderInput('Pontuação Necessária', 'requiredPoints', 'number')}
                {renderTextarea('Descrição do Prêmio', 'description', 2)}
              </>
            )}

            {(entity.kind === 'announcement' ||
              entity.kind === 'manual' ||
              entity.kind === 'onboarding') && (
              <label className="flex items-center gap-2.5 bg-white border border-[#C5A467]/45 rounded-lg p-3.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoGenerateQuiz}
                  onChange={(e) => setAutoGenerateQuiz(e.target.checked)}
                  className="w-4 h-4 accent-[#11382B]"
                />
                <span className="text-xs text-[#11382B] font-medium inline-flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#C5A467]" />
                  Gerar automaticamente novo Mini-Game / Quiz Interativo com IA ao salvar
                </span>
              </label>
            )}

            {error && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1C2421]/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm text-[#1C2421]/70 hover:text-[#1C2421]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={generatingQuiz}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#11382B] text-white text-sm font-medium hover:bg-[#11382B]/90 disabled:opacity-50"
              >
                {generatingQuiz && <Loader2 className="w-4 h-4 animate-spin text-[#D8BC83]" />}
                {generatingQuiz ? 'Gerando Desafio IA...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ImageAutoCropModal
        isOpen={Boolean(cropConfig)}
        title={cropConfig?.title || 'Padronizar Imagem'}
        aspectRatio={cropConfig?.aspectRatio || '16:9'}
        currentImageUrl={cropConfig ? form[cropConfig.field] : ''}
        onSave={(dataUrl) => {
          if (cropConfig) {
            setForm((prev: any) => ({ ...prev, [cropConfig.field]: dataUrl }));
          }
        }}
        onClose={() => setCropConfig(null)}
      />
    </>
  );
};
