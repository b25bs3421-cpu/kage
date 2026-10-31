import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, Sparkles, RefreshCw, HelpCircle, ShieldCheck } from 'lucide-react';
import { QUESTION_BANK, type PhysicsQuestion } from '../lib/physicsData';
import { diagnoseStudentReasoning, type DiagnosisResult } from '../lib/misconceptions';

interface DiagnosticTestViewProps {
  onCompleteDiagnostic: (results: {
    answered: number;
    correctCount: number;
    detectedMisconceptions: string[];
  }) => void;
  onRecordAnswer: (
    conceptId: string,
    isCorrect: boolean,
    difficultyDelta: number,
    misconceptionId?: string
  ) => void;
}

export const DiagnosticTestView: React.FC<DiagnosticTestViewProps> = ({
  onCompleteDiagnostic,
  onRecordAnswer,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [reasoningText, setReasoningText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [hasSubmittedCurrent, setHasSubmittedCurrent] = useState(false);

  // Diagnostic questions sequence (representative coverage across Electricity & Light)
  const diagnosticQuestions = QUESTION_BANK.slice(0, 8);
  const currentQ = diagnosticQuestions[currentIndex] || diagnosticQuestions[0];

  // Stats
  const [stats, setStats] = useState({
    correct: 0,
    total: 0,
    misconceptions: [] as string[],
  });

  const handleSelectOption = (optId: string) => {
    if (hasSubmittedCurrent) return;
    setSelectedOptionId(optId);
  };

  const handleSubmit = async () => {
    if (!selectedOptionId) return;
    setIsSubmitting(true);

    const isOptionCorrect = currentQ.options.find((o) => o.id === selectedOptionId)?.isCorrect ?? false;

    // Run misconception reasoning diagnosis
    const diag = diagnoseStudentReasoning(currentQ.id, selectedOptionId, reasoningText);
    setDiagnosis(diag);
    setHasSubmittedCurrent(true);
    setIsSubmitting(false);

    // Update stats
    const newCorrect = isOptionCorrect ? stats.correct + 1 : stats.correct;
    const newMisc = [...stats.misconceptions];
    if (diag.misconception && !newMisc.includes(diag.misconception.id)) {
      newMisc.push(diag.misconception.id);
    }

    setStats({
      correct: newCorrect,
      total: stats.total + 1,
      misconceptions: newMisc,
    });

    // Record into global learner model
    onRecordAnswer(
      currentQ.conceptId,
      isOptionCorrect,
      currentQ.difficultyDelta,
      diag.misconception?.id
    );
  };

  const handleNext = () => {
    if (currentIndex + 1 < diagnosticQuestions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOptionId('');
      setReasoningText('');
      setDiagnosis(null);
      setHasSubmittedCurrent(false);
    } else {
      // Finished
      onCompleteDiagnostic({
        answered: diagnosticQuestions.length,
        correctCount: stats.correct,
        detectedMisconceptions: stats.misconceptions,
      });
    }
  };

  const isCompleted = currentIndex >= diagnosticQuestions.length;

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#05070a] text-[#dfe7e0] p-4 md:p-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-3xl">
        {/* Progress & Header */}
        <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#e0231c]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Diagnostic Assessment (Section 5.1)</span>
            </div>
            <h2 className="text-xl md:text-2xl font-serif text-white mt-1">
              Initial Concept &amp; Reasoning Calibration
            </h2>
          </div>
          <div className="text-right font-mono">
            <span className="text-xs text-[#78837c]">Question</span>
            <div className="text-sm font-bold text-white">
              {currentIndex + 1} / {diagnosticQuestions.length}
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-[#0a0e12] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
          {/* Target Concept Tag */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-300">
              Concept {currentQ.conceptId}
            </span>
            <span className="text-xs font-mono text-[#78837c]">
              Difficulty &delta; = {currentQ.difficultyDelta > 0 ? `+${currentQ.difficultyDelta}` : currentQ.difficultyDelta}
            </span>
          </div>

          {/* Prompt */}
          <h3 className="text-base md:text-lg text-white font-medium leading-relaxed">
            {currentQ.prompt}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              let optStyle = 'bg-white/5 border-white/10 text-[#dfe7e0] hover:bg-white/10';

              if (hasSubmittedCurrent) {
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
                  onClick={() => handleSelectOption(opt.id)}
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

          {/* Explain Your Answer Step (Crucial Research Paper Element: Imran & Bulathwela 2026) */}
          <div className="border-t border-white/10 pt-4 space-y-2">
            <label className="block text-xs font-medium text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Explain your reasoning (required to catch correct-answer traps):</span>
              </span>
              <span className="text-[10px] text-[#78837c] font-mono">1-2 sentences</span>
            </label>
            <textarea
              disabled={hasSubmittedCurrent}
              value={reasoningText}
              onChange={(e) => setReasoningText(e.target.value)}
              placeholder="e.g. Because charge cannot be destroyed, the rate of current entering must equal the rate leaving..."
              rows={2}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-[#78837c] focus:outline-none focus:border-[#e0231c] disabled:opacity-75 resize-none"
            />
          </div>

          {/* Diagnosis Reveal */}
          {diagnosis && (
            <div
              className={`p-4 rounded-xl border transition-all ${
                diagnosis.status === 'misconception_detected'
                  ? diagnosis.isCorrectAnswerTrap
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                    : 'bg-red-950/40 border-red-500/60 text-red-200'
                  : 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
              }`}
            >
              <div className="flex items-center gap-2 font-medium text-sm mb-1">
                {diagnosis.status === 'misconception_detected' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                )}
                <span>
                  {diagnosis.isCorrectAnswerTrap
                    ? 'Correct-Answer Trap Detected!'
                    : diagnosis.status === 'misconception_detected'
                    ? `Misconception Identified: ${diagnosis.misconception?.title}`
                    : 'Sound Reasoning Validated'}
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">{diagnosis.rationale}</p>

              {diagnosis.counterExamplePrompt && (
                <div className="mt-2.5 p-2.5 rounded bg-black/40 text-[11px] border border-white/10">
                  <strong className="text-white block mb-0.5">Counter-Example Demonstration:</strong>
                  {diagnosis.counterExamplePrompt}
                </div>
              )}

              <div className="mt-2 text-[11px] text-[#aab4ad] italic">
                {currentQ.scientificExplanation}
              </div>
            </div>
          )}

          {/* Submit / Next Button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#78837c]">
              {!hasSubmittedCurrent ? 'Select option & write reasoning' : 'Learner model updated'}
            </span>

            {!hasSubmittedCurrent ? (
              <button
                disabled={!selectedOptionId || isSubmitting}
                onClick={handleSubmit}
                className="px-5 py-2.5 rounded-xl bg-[#e0231c] hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-lg"
              >
                {isSubmitting ? 'Diagnosing...' : 'Submit & Diagnose'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-white text-black hover:bg-gray-200 text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 transition-all shadow-lg"
              >
                <span>{currentIndex + 1 < diagnosticQuestions.length ? 'Next Question' : 'View Concept Graph'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
