import React, { useState } from 'react';
import { BookOpen, Sparkles, AlertCircle, ArrowRight, Lightbulb, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';
import { QUESTION_BANK, type PhysicsQuestion } from '../lib/physicsData';
import { scoreQuestionForStudent } from '../lib/elo';
import { diagnoseStudentReasoning, type DiagnosisResult } from '../lib/misconceptions';
import type { ConceptState } from './ConceptGraphView';

interface PracticeSessionViewProps {
  concepts: Record<string, ConceptState>;
  studentTheta: number; // Elo ability
  onRecordAnswer: (
    conceptId: string,
    isCorrect: boolean,
    difficultyDelta: number,
    misconceptionId?: string
  ) => void;
  openSocraticChat: () => void;
}

export const PracticeSessionView: React.FC<PracticeSessionViewProps> = ({
  concepts,
  studentTheta,
  onRecordAnswer,
  openSocraticChat,
}) => {
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [reasoningText, setReasoningText] = useState<string>('');
  const [activeHintLevel, setActiveHintLevel] = useState<number>(0);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);

  // Available questions
  const currentQ: PhysicsQuestion = QUESTION_BANK[selectedQuestionIndex] || QUESTION_BANK[0];
  const concept = concepts[currentQ.conceptId];

  // Why this question: calculated adaptive recommendation rationale
  const prereqSecure = (concept?.prerequisites || []).every(
    (pId) => (concepts[pId]?.mastery || 0) >= 0.40
  );
  const candidateScore = scoreQuestionForStudent(
    studentTheta,
    currentQ.difficultyDelta,
    concept?.mastery || 0.2,
    prereqSecure
  );

  const handleSubmit = () => {
    if (!selectedOptionId) return;

    const isCorrect = currentQ.options.find((o) => o.id === selectedOptionId)?.isCorrect ?? false;
    const diag = diagnoseStudentReasoning(currentQ.id, selectedOptionId, reasoningText);
    setDiagnosis(diag);
    setHasSubmitted(true);

    onRecordAnswer(
      currentQ.conceptId,
      isCorrect,
      currentQ.difficultyDelta,
      diag.misconception?.id
    );
  };

  const handleNextQuestion = () => {
    setSelectedQuestionIndex((prev) => (prev + 1) % QUESTION_BANK.length);
    setSelectedOptionId('');
    setReasoningText('');
    setActiveHintLevel(0);
    setHasSubmitted(false);
    setDiagnosis(null);
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#05070a] text-[#dfe7e0] p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-6">
        {/* Top Bar: Adaptive Decision Transparency */}
        <div className="bg-[#0a0e12] border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-[#78837c]">
                Adaptive Selection Transparency
              </div>
              <h2 className="text-sm font-medium text-white">{candidateScore.reason}</h2>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-right">
              <span className="text-[#78837c] block text-[10px]">Student Ability &theta;</span>
              <span className="font-bold text-emerald-400">
                {studentTheta > 0 ? `+${studentTheta.toFixed(2)}` : studentTheta.toFixed(2)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[#78837c] block text-[10px]">Item Difficulty &delta;</span>
              <span className="font-bold text-amber-400">
                {currentQ.difficultyDelta > 0 ? `+${currentQ.difficultyDelta.toFixed(2)}` : currentQ.difficultyDelta.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Question Panel */}
        <div className="bg-[#0a0e12] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-red-300">
              {currentQ.conceptId}: {concept?.name || 'Physics Concept'}
            </span>
            <span className="text-xs font-mono text-[#78837c]">
              Question {selectedQuestionIndex + 1} of {QUESTION_BANK.length}
            </span>
          </div>

          <h3 className="text-lg md:text-xl font-serif text-white leading-relaxed">
            {currentQ.prompt}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              let optStyle = 'bg-white/5 border-white/10 text-[#dfe7e0] hover:bg-white/10';

              if (hasSubmitted) {
                if (opt.isCorrect) {
                  optStyle = 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200';
                } else if (isSelected && !opt.isCorrect) {
                  optStyle = 'bg-red-950/60 border-red-500/80 text-red-200';
                }
              } else if (isSelected) {
                optStyle = 'bg-[#e0231c]/20 border-[#e0231c] text-white ring-1 ring-[#e0231c]';
              }

              return (
                <div
                  key={opt.id}
                  onClick={() => !hasSubmitted && setSelectedOptionId(opt.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${optStyle}`}
                >
                  <span className="font-mono text-xs uppercase font-bold px-2 py-1 rounded bg-black/40">
                    {opt.id}
                  </span>
                  <span className="text-sm leading-relaxed flex-1">{opt.text}</span>
                </div>
              );
            })}
          </div>

          {/* Reasoning input */}
          <div className="border-t border-white/10 pt-4 space-y-2">
            <label className="text-xs font-medium text-white flex items-center justify-between">
              <span>Why did you choose this? Explain your physics reasoning:</span>
              <span className="text-[10px] text-[#78837c] font-mono">Used for misconception detection</span>
            </label>
            <input
              type="text"
              disabled={hasSubmitted}
              value={reasoningText}
              onChange={(e) => setReasoningText(e.target.value)}
              placeholder="e.g. Current splits based on resistance according to V = IR..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-[#78837c] focus:outline-none focus:border-[#e0231c]"
            />
          </div>

          {/* Hint Ladder (Guardrail against answer leakage - Bastani et al. PNAS 2025) */}
          <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-300 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>3-Tier Socratic Hint Ladder</span>
              </span>
              <span className="text-[10px] text-[#78837c]">
                {activeHintLevel === 0 ? 'No hints requested' : `Hint Level ${activeHintLevel}/3`}
              </span>
            </div>

            {activeHintLevel > 0 && (
              <div className="space-y-2">
                {currentQ.hintLadder.slice(0, activeHintLevel).map((hint, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs text-amber-100 flex items-start gap-2">
                    <span className="font-mono text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">
                      Step {idx + 1}
                    </span>
                    <p className="flex-1">{hint}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              {activeHintLevel < 3 && !hasSubmitted && (
                <button
                  onClick={() => setActiveHintLevel((prev) => prev + 1)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all"
                >
                  Request Hint {activeHintLevel + 1}
                </button>
              )}
              <button
                onClick={openSocraticChat}
                className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask Socratic Tutor AI</span>
              </button>
            </div>
          </div>

          {/* Feedback & Misconception Diagnosis */}
          {diagnosis && (
            <div
              className={`p-4 rounded-xl border ${
                diagnosis.status === 'misconception_detected'
                  ? diagnosis.isCorrectAnswerTrap
                    ? 'bg-amber-950/40 border-amber-500/70 text-amber-200'
                    : 'bg-red-950/40 border-red-500/70 text-red-200'
                  : 'bg-emerald-950/40 border-emerald-500/70 text-emerald-200'
              }`}
            >
              <div className="flex items-center gap-2 font-medium text-sm mb-1">
                {diagnosis.status === 'misconception_detected' ? (
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                <span>
                  {diagnosis.isCorrectAnswerTrap
                    ? 'Correct Answer Trap Caught!'
                    : diagnosis.status === 'misconception_detected'
                    ? `Misconception Detected: ${diagnosis.misconception?.title}`
                    : 'Sound Physical Reasoning'}
                </span>
              </div>
              <p className="text-xs leading-relaxed">{diagnosis.rationale}</p>
              {diagnosis.counterExamplePrompt && (
                <div className="mt-2.5 p-2.5 rounded bg-black/40 text-[11px] border border-white/10">
                  <strong className="text-white block mb-0.5">Counter-Example to Test:</strong>
                  {diagnosis.counterExamplePrompt}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            {!hasSubmitted ? (
              <button
                disabled={!selectedOptionId}
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-[#e0231c] hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-lg"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-xl bg-white text-black hover:bg-gray-200 text-xs font-semibold tracking-wider uppercase flex items-center gap-2 transition-all shadow-lg"
              >
                <span>Next Adaptive Problem</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
