import React, { useMemo, useState } from 'react';
import { Award, CheckCircle2, Gamepad2, HelpCircle, RotateCcw, Sparkles, X, XCircle } from 'lucide-react';
import { InteractiveChallenge } from '../types/portal';

interface MiniGameModalProps {
  challenge: InteractiveChallenge | null;
  alreadyCompleted: boolean;
  onClose: () => void;
  onComplete: (result: {
    challengeId: string;
    correctCount: number;
    totalCount: number;
    earnedPoints: number;
    perfectBonus: boolean;
  }) => void;
}

const CHALLENGE_TYPE_LABELS: Record<InteractiveChallenge['type'], string> = {
  multiple_choice: 'Quiz de Múltipla Escolha',
  true_false: 'Verdadeiro ou Falso',
  matching: 'Associação de Termos',
  decision_scenario: 'Cenário Prático de Decisão',
};

export const MiniGameModal: React.FC<MiniGameModalProps> = ({
  challenge,
  alreadyCompleted,
  onClose,
  onComplete,
}) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  // Matching state
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [matchingSubmitted, setMatchingSubmitted] = useState(false);

  const shuffledDefinitions = useMemo(() => {
    if (!challenge?.matchingPairs) return [];
    return [...challenge.matchingPairs].sort((a, b) => a.definition.localeCompare(b.definition));
  }, [challenge]);

  if (!challenge) return null;

  const isMatching = challenge.type === 'matching' && (challenge.matchingPairs?.length || 0) > 0;
  const totalCount = isMatching
    ? challenge.matchingPairs!.length
    : challenge.questions.length;

  const currentQuestion = !isMatching ? challenge.questions[questionIndex] : null;

  const handleConfirmOption = () => {
    if (selectedOption === null || !currentQuestion) return;
    setAnswered(true);
    if (selectedOption === currentQuestion.correctIndex) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleNextQuestion = () => {
    if (questionIndex + 1 < challenge.questions.length) {
      setQuestionIndex((i) => i + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      const finalCorrect = correctCount;
      const isPerfect = finalCorrect === totalCount && totalCount > 0;
      const earned = alreadyCompleted ? 0 : finalCorrect * 25 + (isPerfect ? 50 : 0);
      setFinished(true);
      onComplete({
        challengeId: challenge.id,
        correctCount: finalCorrect,
        totalCount,
        earnedPoints: earned,
        perfectBonus: isPerfect,
      });
    }
  };

  const handleMatchingDefinitionClick = (pairIdForDef: string) => {
    if (!selectedTermId || matchingSubmitted) return;
    setMatchedPairs((prev) => ({
      ...prev,
      [selectedTermId]: pairIdForDef,
    }));
    setSelectedTermId(null);
  };

  const handleSubmitMatching = () => {
    if (!challenge.matchingPairs) return;
    let hits = 0;
    for (const pair of challenge.matchingPairs) {
      if (matchedPairs[pair.id] === pair.id) {
        hits += 1;
      }
    }
    setCorrectCount(hits);
    setMatchingSubmitted(true);
    setFinished(true);
    const isPerfect = hits === challenge.matchingPairs.length;
    const earned = alreadyCompleted ? 0 : hits * 25 + (isPerfect ? 50 : 0);
    onComplete({
      challengeId: challenge.id,
      correctCount: hits,
      totalCount: challenge.matchingPairs.length,
      earnedPoints: earned,
      perfectBonus: isPerfect,
    });
  };

  const handleReset = () => {
    setQuestionIndex(0);
    setSelectedOption(null);
    setAnswered(false);
    setCorrectCount(0);
    setFinished(false);
    setSelectedTermId(null);
    setMatchedPairs({});
    setMatchingSubmitted(false);
  };

  const earnedPreview = alreadyCompleted
    ? 0
    : correctCount * 25 + (correctCount === totalCount && totalCount > 0 ? 50 : 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#11382B]/75 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="minigame-title"
    >
      <div className="w-full max-w-2xl max-h-[92vh] bg-[#F8F7F4] border border-[#C5A467]/60 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 bg-[#11382B] text-white border-b border-[#C5A467]/30 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#C5A467]/20 border border-[#C5A467]/50 flex items-center justify-center shrink-0">
              <Gamepad2 className="w-5 h-5 text-[#D8BC83]" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#D8BC83] flex items-center gap-1.5 truncate">
                {CHALLENGE_TYPE_LABELS[challenge.type]}
                {challenge.generatedByAI && (
                  <span>· Gerado por IA</span>
                )}
              </p>
              <h3 id="minigame-title" className="font-serif text-lg sm:text-xl font-semibold truncate">
                {challenge.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Fechar desafio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {!finished ? (
            <>
              {challenge.scenarioContext && (
                <div className="bg-white border border-[#C5A467]/40 rounded-lg p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#11382B] mb-1">
                    Situação Prática
                  </p>
                  <p className="text-sm text-[#1C2421]/85 leading-relaxed">
                    {challenge.scenarioContext}
                  </p>
                </div>
              )}

              {isMatching && challenge.matchingPairs ? (
                <div className="space-y-4">
                  <p className="text-sm text-[#1C2421]/80">
                    Clique em um conceito à esquerda e depois selecione a definição correspondente à direita:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2.5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#11382B]">
                        Conceitos
                      </p>
                      {challenge.matchingPairs.map((pair) => {
                        const isSelected = selectedTermId === pair.id;
                        const assignedDefId = matchedPairs[pair.id];
                        return (
                          <button
                            key={pair.id}
                            type="button"
                            onClick={() => setSelectedTermId(pair.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                              isSelected
                                ? 'bg-[#11382B] text-white border-[#11382B]'
                                : assignedDefId
                                  ? 'bg-[#C5A467]/15 text-[#11382B] border-[#C5A467]'
                                  : 'bg-white text-[#1C2421] border-[#1C2421]/15 hover:border-[#C5A467]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span>{pair.term}</span>
                              {assignedDefId && (
                                <span className="text-[11px] font-mono text-[#11382B]/70">
                                  Associado
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-2.5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#11382B]">
                        Definições
                      </p>
                      {shuffledDefinitions.map((defPair) => {
                        const linkedTerm = challenge.matchingPairs?.find(
                          (p) => matchedPairs[p.id] === defPair.id
                        );
                        return (
                          <button
                            key={defPair.id}
                            type="button"
                            onClick={() => handleMatchingDefinitionClick(defPair.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg border text-xs leading-relaxed transition-colors ${
                              linkedTerm
                                ? 'bg-[#11382B]/5 border-[#C5A467] text-[#11382B]'
                                : selectedTermId
                                  ? 'bg-white border-[#C5A467]/70 hover:bg-[#C5A467]/10 text-[#1C2421]'
                                  : 'bg-white border-[#1C2421]/15 text-[#1C2421]/80'
                            }`}
                          >
                            {defPair.definition}
                            {linkedTerm && (
                              <span className="block mt-1 font-semibold text-[#11382B]">
                                → {linkedTerm.term}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#1C2421]/10">
                    <span className="text-xs text-[#1C2421]/65 font-mono tabular-nums">
                      {Object.keys(matchedPairs).length} de {challenge.matchingPairs.length} associações
                    </span>
                    <button
                      type="button"
                      disabled={Object.keys(matchedPairs).length < challenge.matchingPairs.length}
                      onClick={handleSubmitMatching}
                      className="px-5 py-2.5 rounded-lg bg-[#11382B] text-white text-sm font-medium hover:bg-[#11382B]/90 disabled:opacity-45 transition-colors"
                    >
                      Verificar Associações
                    </button>
                  </div>
                </div>
              ) : currentQuestion ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-[#1C2421]/60 font-mono tabular-nums">
                    <span>
                      Questão {questionIndex + 1} de {challenge.questions.length}
                    </span>
                    <span>+25 pts por acerto · +50 pts bônus gabarito</span>
                  </div>

                  <h4 className="font-serif text-2xl font-semibold text-[#11382B] leading-snug">
                    {currentQuestion.prompt}
                  </h4>

                  <div className="space-y-2.5">
                    {currentQuestion.options.map((opt, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrect = idx === currentQuestion.correctIndex;
                      let stateClass =
                        'bg-white border-[#1C2421]/15 text-[#1C2421] hover:border-[#C5A467]';
                      if (answered) {
                        if (isCorrect) {
                          stateClass = 'bg-emerald-50 border-emerald-600 text-emerald-950 font-medium';
                        } else if (isSelected && !isCorrect) {
                          stateClass = 'bg-red-50 border-red-500 text-red-950';
                        } else {
                          stateClass = 'bg-white/60 border-[#1C2421]/10 text-[#1C2421]/50';
                        }
                      } else if (isSelected) {
                        stateClass = 'bg-[#11382B] border-[#11382B] text-white font-medium';
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={answered}
                          onClick={() => setSelectedOption(idx)}
                          className={`w-full text-left px-4 py-3.5 rounded-lg border text-sm transition-colors flex items-center justify-between gap-3 ${stateClass}`}
                        >
                          <span>{opt}</span>
                          {answered && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                          )}
                          {answered && isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {answered && (
                    <div className="bg-white border border-[#C5A467]/50 rounded-lg p-4 text-sm text-[#1C2421]/90">
                      <p className="font-semibold text-[#11382B] mb-1">
                        {selectedOption === currentQuestion.correctIndex
                          ? 'Resposta Correta (+25 pts)'
                          : 'Explicação Técnica'}
                      </p>
                      <p className="leading-relaxed">{currentQuestion.explanation}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    {!answered ? (
                      <button
                        type="button"
                        disabled={selectedOption === null}
                        onClick={handleConfirmOption}
                        className="px-5 py-2.5 rounded-lg bg-[#11382B] text-white text-sm font-medium hover:bg-[#11382B]/90 disabled:opacity-45 transition-colors"
                      >
                        Confirmar Resposta
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="px-5 py-2.5 rounded-lg bg-[#C5A467] text-[#11382B] text-sm font-semibold hover:bg-[#D8BC83] transition-colors"
                      >
                        {questionIndex + 1 < challenge.questions.length
                          ? 'Próxima Questão'
                          : 'Finalizar Desafio'}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-[#1C2421]/70">
                  <HelpCircle className="w-8 h-8 mx-auto mb-2 text-[#C5A467]" />
                  Este desafio não possui questões cadastradas.
                </div>
              )}
            </>
          ) : (
            <div className="py-4 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#11382B] border-2 border-[#C5A467] flex items-center justify-center text-[#D8BC83]">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#C5A467] font-semibold">
                  Desafio Concluído
                </p>
                <h4 className="font-serif text-3xl font-semibold text-[#11382B] mt-1">
                  {correctCount} de {totalCount} acertos
                </h4>
              </div>

              {alreadyCompleted ? (
                <p className="text-sm text-[#1C2421]/75 max-w-md mx-auto">
                  Você já havia concluído este desafio anteriormente e recebido sua pontuação. Continue explorando novos conteúdos para acumular mais Pontos Signature!
                </p>
              ) : (
                <div className="inline-flex flex-col items-center bg-white border border-[#C5A467]/50 rounded-xl px-6 py-4">
                  <span className="text-xs text-[#1C2421]/65">Pontos Creditados Agora</span>
                  <span className="font-mono tabular-nums text-3xl font-bold text-[#11382B] mt-0.5">
                    +{earnedPreview} pts
                  </span>
                  {correctCount === totalCount && totalCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#C5A467] mt-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Inclui bônus de +50 pts por gabaritar!
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#1C2421]/20 text-sm font-medium text-[#1C2421] hover:bg-black/5 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Jogar Novamente
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg bg-[#11382B] text-white text-sm font-medium hover:bg-[#11382B]/90 transition-colors"
                >
                  Voltar ao Portal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
