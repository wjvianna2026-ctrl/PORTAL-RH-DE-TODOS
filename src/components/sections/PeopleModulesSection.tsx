import React, { useState } from 'react';
import {
  CalendarDays,
  Edit3,
  Gift,
  HeartHandshake,
  ImagePlus,
  MessageSquarePlus,
  Plus,
  Send,
  Trash2,
  UserCheck,
} from 'lucide-react';
import {
  Benefit,
  BirthdayPerson,
  CollaboratorProfile,
  EligibilityRegime,
  EligibilityTenure,
  VacationEntry,
} from '../../types/portal';
import { AdminEditEntity } from '../AdminEditModal';
import { StandardizedImage } from '../StandardizedImage';

interface BenefitsSectionProps {
  benefits: Benefit[];
  isAdmin: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onOpenEdit: (entity: AdminEditEntity) => void;
  onDelete: (id: string) => void;
}

export const BenefitsSection: React.FC<BenefitsSectionProps> = ({
  benefits,
  isAdmin,
  canEdit,
  canDelete,
  onOpenEdit,
  onDelete,
}) => {
  const allowEdit = canEdit ?? isAdmin;
  const allowDelete = canDelete ?? isAdmin;
  const [regimeFilter, setRegimeFilter] = useState<'Todos' | EligibilityRegime>('Todos');
  const [tenureFilter, setTenureFilter] = useState<'Todos' | EligibilityTenure>('Todos');

  const regimes: ('Todos' | EligibilityRegime)[] = [
    'Todos',
    'Todos os Colaboradores',
    'Obra',
    'Escritório',
    'Liderança',
  ];

  const tenures: ('Todos' | EligibilityTenure)[] = [
    'Todos',
    'Desde a Admissão',
    'Após 90 dias',
    'Após 6 meses',
  ];

  const filtered = benefits.filter((b) => {
    const matchRegime =
      regimeFilter === 'Todos' ||
      b.eligibilityRegime === regimeFilter ||
      (regimeFilter !== 'Todos os Colaboradores' &&
        b.eligibilityRegime === 'Todos os Colaboradores');
    const matchTenure = tenureFilter === 'Todos' || b.eligibilityTenure === tenureFilter;
    return matchRegime && matchTenure;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#1C2421]/12 pb-5">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#C5A467] font-semibold">
            Cuidado &amp; Valorização
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#11382B] mt-1">
            Benefícios &amp; Filtro de Elegibilidade
          </h2>
        </div>

        {allowEdit && (
          <button
            type="button"
            onClick={() => onOpenEdit({ kind: 'benefit' })}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#11382B] text-white text-xs font-medium hover:bg-[#11382B]/90 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-[#D8BC83]" />
            Inserir Novo Benefício
          </button>
        )}
      </div>

      {/* Interactive Eligibility Filter ("Quem tem direito?") */}
      <div className="bg-white border border-[#C5A467]/40 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#11382B]">
          <HeartHandshake className="w-4 h-4 text-[#C5A467]" />
          Quem tem direito? Filtre por cargo/regime ou tempo de empresa:
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider text-[#1C2421]/60 font-semibold">
              Regime / Público Elegível
            </span>
            <div className="flex flex-wrap gap-1.5">
              {regimes.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRegimeFilter(r)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    regimeFilter === r
                      ? 'bg-[#11382B] text-white'
                      : 'bg-[#F8F7F4] text-[#1C2421]/75 hover:text-[#11382B]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider text-[#1C2421]/60 font-semibold">
              Tempo de Casa
            </span>
            <div className="flex flex-wrap gap-1.5">
              {tenures.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTenureFilter(t)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    tenureFilter === t
                      ? 'bg-[#11382B] text-white'
                      : 'bg-[#F8F7F4] text-[#1C2421]/75 hover:text-[#11382B]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((ben) => (
          <div
            key={ben.id}
            className="bg-white border border-[#1C2421]/10 rounded-xl p-4 sm:p-6 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#1C2421]/60">
                <span className="font-semibold text-[#C5A467]">{ben.provider}</span>
                <span>
                  {ben.eligibilityRegime} · {ben.eligibilityTenure}
                </span>
              </div>

              <h3 className="font-serif text-2xl font-semibold text-[#11382B]">{ben.title}</h3>
              <p className="text-sm font-medium text-[#11382B]/90">{ben.coverageSummary}</p>
              <p className="text-sm text-[#1C2421]/75 leading-relaxed">{ben.description}</p>
            </div>

            <div className="pt-4 border-t border-[#1C2421]/10 space-y-3">
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold text-[#11382B]">
                  Como Solicitar / Utilizar
                </p>
                <p className="text-xs text-[#1C2421]/75 mt-1 leading-relaxed">{ben.howToRequest}</p>
              </div>

              {(allowEdit || allowDelete) && (
                <div className="flex items-center justify-end gap-2 pt-2">
                  {allowEdit && (
                    <button
                      type="button"
                      onClick={() => onOpenEdit({ kind: 'benefit', item: ben })}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs text-[#11382B] hover:bg-[#11382B]/10"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Editar
                    </button>
                  )}
                  {allowDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(ben.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface VacationsSectionProps {
  vacations: VacationEntry[];
  isAdmin: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onOpenEdit: (entity: AdminEditEntity) => void;
  onDelete: (id: string) => void;
  onChangeImage: (item: VacationEntry) => void;
}

export const VacationsSection: React.FC<VacationsSectionProps> = ({
  vacations,
  isAdmin,
  canEdit,
  canDelete,
  onOpenEdit,
  onDelete,
  onChangeImage,
}) => {
  const allowEdit = canEdit ?? isAdmin;
  const allowDelete = canDelete ?? isAdmin;
  const currentMonth = vacations.filter((v) => v.periodType === 'current_month');
  const nextMonth = vacations.filter((v) => v.periodType === 'next_month');

  const renderGroup = (title: string, subtitle: string, list: VacationEntry[]) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#1C2421]/10 pb-2">
        <div>
          <h3 className="font-serif text-2xl font-semibold text-[#11382B]">{title}</h3>
          <p className="text-xs text-[#1C2421]/65">{subtitle}</p>
        </div>
        <span className="font-mono tabular-nums text-xs text-[#11382B] font-semibold">
          {list.length} colaboradores
        </span>
      </div>

      {list.length === 0 ? (
        <div className="bg-white border border-[#1C2421]/10 rounded-xl p-6 text-sm text-[#1C2421]/65">
          Nenhuma programação cadastrada para este período.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {list.map((v) => (
            <div
              key={v.id}
              className="bg-white border border-[#1C2421]/10 rounded-xl p-4 sm:p-5 flex items-start gap-3.5 sm:gap-4"
            >
              <div className="w-14 sm:w-16 shrink-0 relative">
                <StandardizedImage
                  src={v.photoUrl}
                  alt={v.employeeName}
                  aspectRatio="1:1"
                  rounded="lg"
                  goldBorder
                />
                {allowEdit && (
                  <button
                    type="button"
                    onClick={() => onChangeImage(v)}
                    className="mt-1.5 w-full inline-flex items-center justify-center gap-1 py-1 rounded bg-[#11382B] text-[10px] text-[#D8BC83]"
                    title="Alterar foto"
                  >
                    <ImagePlus className="w-3 h-3" />
                    Foto
                  </button>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <h4 className="font-serif text-lg sm:text-xl font-semibold text-[#11382B] leading-tight">
                    {v.employeeName}
                  </h4>
                  <p className="text-xs text-[#1C2421]/75">
                    {v.role} · {v.sectorOrSite}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono tabular-nums text-[#11382B] bg-[#F8F7F4] px-2.5 sm:px-3 py-1.5 rounded-md border border-[#C5A467]/30">
                  <CalendarDays className="w-3.5 h-3.5 text-[#C5A467] shrink-0" />
                  <span>
                    {v.startDate} — {v.endDate}
                  </span>
                </div>

                <div className="flex items-start gap-1.5 text-xs text-[#1C2421]/75">
                  <UserCheck className="w-3.5 h-3.5 text-[#C5A467] shrink-0 mt-0.5" />
                  <span className="leading-snug">
                    Ponto Focal: <strong className="text-[#11382B]">{v.focalPointName}</strong> ({v.focalPointRole})
                  </span>
                </div>

                {(allowEdit || allowDelete) && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1C2421]/8">
                    {allowEdit && (
                      <button
                        type="button"
                        onClick={() => onOpenEdit({ kind: 'vacation', item: v })}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[#11382B] hover:bg-[#11382B]/10"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Editar
                      </button>
                    )}
                    {allowDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(v.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Excluir
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#1C2421]/12 pb-5">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#C5A467] font-semibold">
            Planejamento &amp; Cobertura de Obras
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#11382B] mt-1">
            Programação Mensal de Férias
          </h2>
        </div>

        {allowEdit && (
          <button
            type="button"
            onClick={() => onOpenEdit({ kind: 'vacation' })}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#11382B] text-white text-xs font-medium hover:bg-[#11382B]/90 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-[#D8BC83]" />
            Programar Férias
          </button>
        )}
      </div>

      <div className="space-y-10">
        {renderGroup(
          'Férias do Mês Atual',
          'Colaboradores em período de descanso neste mês e seus pontos focais designados',
          currentMonth
        )}
        {renderGroup(
          'Férias do Próximo Mês',
          'Programação confirmada para alinhamento antecipado das equipes',
          nextMonth
        )}
      </div>
    </div>
  );
};

interface BirthdaysSectionProps {
  birthdays: BirthdayPerson[];
  profile: CollaboratorProfile;
  isAdmin: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onSendCongratulation: (birthdayId: string, message: string) => Promise<void>;
  onOpenEdit: (entity: AdminEditEntity) => void;
  onDelete: (id: string) => void;
  onChangeImage: (item: BirthdayPerson) => void;
}

export const BirthdaysSection: React.FC<BirthdaysSectionProps> = ({
  birthdays,
  profile,
  isAdmin,
  canEdit,
  canDelete,
  onSendCongratulation,
  onOpenEdit,
  onDelete,
  onChangeImage,
}) => {
  const allowEdit = canEdit ?? isAdmin;
  const allowDelete = canDelete ?? isAdmin;
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [unitFilter, setUnitFilter] = useState<string>('Todas');

  const units = ['Todas', ...Array.from(new Set(birthdays.map((b) => b.sectorOrSite)))];
  const filteredBirthdays =
    unitFilter === 'Todas'
      ? birthdays
      : birthdays.filter((b) => b.sectorOrSite === unitFilter);

  const handleSubmit = async (e: React.FormEvent, personId: string) => {
    e.preventDefault();
    const text = (drafts[personId] || '').trim();
    if (!text) return;
    setSendingId(personId);
    try {
      await onSendCongratulation(personId, text);
      setDrafts((prev) => ({ ...prev, [personId]: '' }));
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#1C2421]/12 pb-5">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#C5A467] font-semibold">
            Reconhecimento &amp; Celebração · +20 pts por felicitação
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#11382B] mt-1">
            Aniversariantes de Dezembro &amp; Mural Interativo
          </h2>
        </div>

        {allowEdit && (
          <button
            type="button"
            onClick={() => onOpenEdit({ kind: 'birthday' })}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#11382B] text-white text-xs font-medium hover:bg-[#11382B]/90 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-[#D8BC83]" />
            Adicionar Aniversariante
          </button>
        )}
      </div>

      {/* Unit Filter + Official PDF Links */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-white border border-[#1C2421]/10 rounded-lg">
          {units.map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnitFilter(u)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                unitFilter === u
                  ? 'bg-[#11382B] text-white'
                  : 'text-[#1C2421]/70 hover:text-[#11382B]'
              }`}
            >
              {u === 'Todas' ? 'Todas as Unidades' : u.split(' - ')[0]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-[#1C2421]/60">Listas Oficiais (PDF):</span>
          <a
            href="/assets/aistudio/PORTAL_-_Manta_-_Empregados_Aniversariantes_do_M_s_08aff80b.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#11382B] hover:text-[#C5A467] underline"
          >
            Manta
          </a>
          <a
            href="/assets/aistudio/PORTAL_-_Matriz_-_Empregados_Aniversariantes_do_M_s_b1d8f7b8.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#11382B] hover:text-[#C5A467] underline"
          >
            Matriz
          </a>
          <a
            href="/assets/aistudio/PORTAL_-_Watal_-_Empregados_Aniversariantes_do_M_s_1704971a.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#11382B] hover:text-[#C5A467] underline"
          >
            Watal Patacho
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBirthdays.map((person) => {
          const alreadyCongratulated = profile.congratulatedBirthdayIds.includes(person.id);
          return (
            <div
              key={person.id}
              className={`bg-white border rounded-xl p-4 sm:p-6 flex flex-col justify-between space-y-5 ${
                !alreadyCongratulated ? 'border-[#C5A467]/75' : 'border-[#1C2421]/10'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start gap-3.5 sm:gap-4">
                  <div className="w-16 sm:w-20 shrink-0">
                    <StandardizedImage
                      src={person.photoUrl}
                      alt={person.employeeName}
                      aspectRatio="1:1"
                      rounded="xl"
                      goldBorder
                    />
                    {allowEdit && (
                      <button
                        type="button"
                        onClick={() => onChangeImage(person)}
                        className="mt-1.5 w-full inline-flex items-center justify-center gap-1 py-1 rounded bg-[#11382B] text-[10px] text-[#D8BC83]"
                      >
                        <ImagePlus className="w-3 h-3" />
                        Foto
                      </button>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono tabular-nums text-[#C5A467] font-semibold inline-flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5" />
                      {person.birthDay} de {person.birthMonth}
                    </p>
                    <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#11382B] leading-tight mt-0.5">
                      {person.employeeName}
                    </h3>
                    <p className="text-xs text-[#1C2421]/75 mt-1">{person.role}</p>
                    <p className="text-xs text-[#1C2421]/55">{person.sectorOrSite}</p>
                  </div>
                </div>

                {/* Mural de Felicitações */}
                <div className="border-t border-[#1C2421]/10 pt-4 space-y-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#11382B]">
                    Mural de Felicitações ({person.messages.length})
                  </p>
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {person.messages.length === 0 ? (
                      <p className="text-xs text-[#1C2421]/55 italic">
                        Seja o primeiro colega a enviar os parabéns!
                      </p>
                    ) : (
                      person.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className="bg-[#F8F7F4] border border-[#1C2421]/8 rounded-lg p-3 space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px] gap-2">
                            <span className="font-semibold text-[#11382B] truncate">
                              {msg.senderName}
                            </span>
                            <span className="text-[#1C2421]/50 shrink-0">{msg.createdAt}</span>
                          </div>
                          <p className="text-xs text-[#1C2421]/85 leading-relaxed">{msg.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#1C2421]/10">
                <form onSubmit={(e) => handleSubmit(e, person.id)} className="flex gap-2">
                  <input
                    type="text"
                    value={drafts[person.id] || ''}
                    onChange={(e) =>
                      setDrafts((prev) => ({ ...prev, [person.id]: e.target.value }))
                    }
                    placeholder="Escreva seus parabéns..."
                    className="flex-1 min-w-0 rounded-lg border border-[#1C2421]/20 bg-[#F8F7F4] px-3 py-2 text-xs text-[#1C2421] focus:outline-none focus:border-[#11382B]"
                  />
                  <button
                    type="submit"
                    disabled={sendingId === person.id || !(drafts[person.id] || '').trim()}
                    className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg bg-[#11382B] text-white text-xs font-medium hover:bg-[#11382B]/90 disabled:opacity-45 shrink-0"
                    title="Enviar felicitação"
                  >
                    <Send className="w-3.5 h-3.5 text-[#D8BC83]" />
                    Enviar
                  </button>
                </form>

                <p className="text-[11px] text-[#1C2421]/60 flex items-center gap-1">
                  <MessageSquarePlus className="w-3 h-3 text-[#C5A467] shrink-0" />
                  {alreadyCongratulated
                    ? 'Você já recebeu +20 pts por felicitar este colega.'
                    : 'Enviar parabéns gera +20 pts Signature.'}
                </p>

                {(allowEdit || allowDelete) && (
                  <div className="flex items-center justify-end gap-2 pt-2">
                    {allowEdit && (
                      <button
                        type="button"
                        onClick={() => onOpenEdit({ kind: 'birthday', item: person })}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[#11382B] hover:bg-[#11382B]/10"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Editar
                      </button>
                    )}
                    {allowDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(person.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Excluir
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
