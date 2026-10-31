import React, { useState } from 'react';
import { Calendar, Clock, RefreshCw, CheckCircle, Flame, ArrowUpRight, BarChart2 } from 'lucide-react';
import {
  calculateRetrievability,
  calculateNextInterval,
  getExamAwareRetentionTarget,
  updateMemoryState,
  type MemoryState,
} from '../lib/fsrs';
import type { ConceptState } from './ConceptGraphView';

interface FSRSReviewViewProps {
  concepts: Record<string, ConceptState>;
  memoryStates: Record<string, MemoryState>;
  onUpdateMemory: (newStates: Record<string, MemoryState>) => void;
}

export const FSRSReviewView: React.FC<FSRSReviewViewProps> = ({
  concepts,
  memoryStates,
  onUpdateMemory,
}) => {
  const [daysToExam, setDaysToExam] = useState<number>(60);
  const targetRetention = getExamAwareRetentionTarget(daysToExam);

  // Compute retrievability and sorting for each concept
  const now = Date.now();
  const queue = Object.values(memoryStates).map((mem) => {
    const daysElapsed = Math.max(0, (now - mem.lastReviewedAt) / (1000 * 60 * 60 * 24));
    const r = calculateRetrievability(daysElapsed, mem.stability);
    const concept = concepts[mem.conceptId];
    const isDue = now >= mem.nextReviewAt || r < targetRetention;

    return {
      mem,
      concept,
      r,
      daysElapsed: Number(daysElapsed.toFixed(1)),
      isDue,
    };
  });

  // Sort: Due concepts first, then lowest retrievability
  queue.sort((a, b) => {
    if (a.isDue && !b.isDue) return -1;
    if (!a.isDue && b.isDue) return 1;
    return a.r - b.r;
  });

  const handleGrade = (conceptId: string, grade: 'again' | 'hard' | 'good' | 'easy') => {
    const mem = memoryStates[conceptId];
    if (!mem) return;

    const updated = updateMemoryState(mem, grade, daysToExam, now);
    onUpdateMemory({
      ...memoryStates,
      [conceptId]: updated,
    });
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#05070a] text-[#dfe7e0] p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-6">
        {/* Header & Days to Exam Controller */}
        <div className="bg-[#0a0e12] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#e0231c]">
              <Calendar className="w-4 h-4" />
              <span>Section 7: Free Spaced Repetition Scheduler (FSRS-5)</span>
            </div>
            <h1 className="text-2xl font-serif text-white mt-1">
              Exam-Date-Aware Memory Review Queue
            </h1>
            <p className="text-xs text-[#aab4ad] mt-1 max-w-xl">
              Power-law memory stability R(t, S) = (1 + 19/81 &middot; t / S)<sup>-0.5</sup>. Unlike legacy SM-2, FSRS prevents ease hell and schedules 25% fewer reviews at equal retention.
            </p>
          </div>

          {/* Interactive Days-to-Exam Control */}
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 w-full md:w-80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Days to Board Exam:</span>
              </span>
              <span className="font-mono font-bold text-amber-300 text-sm">{daysToExam} days</span>
            </div>
            <input
              type="range"
              min="3"
              max="180"
              value={daysToExam}
              onChange={(e) => setDaysToExam(Number(e.target.value))}
              className="w-full accent-[#e0231c] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#78837c] font-mono">
              <span>Sprint (7d)</span>
              <span>Target R: {(targetRetention * 100).toFixed(0)}%</span>
              <span>Long-term (180d)</span>
            </div>
          </div>
        </div>

        {/* Review Queue Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono uppercase text-[#78837c]">
              Review Queue ({queue.filter((q) => q.isDue).length} Concepts Due for Review)
            </span>
            <span className="text-xs font-mono text-emerald-400">
              Optimal Next Interval Computed
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {queue.map(({ mem, concept, r, daysElapsed, isDue }) => {
              const rPercent = Math.round(r * 100);
              const nextInterval = calculateNextInterval(targetRetention, mem.stability);

              return (
                <div
                  key={mem.conceptId}
                  className={`border rounded-2xl p-4 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isDue
                      ? 'bg-red-950/20 border-red-500/40 shadow-lg'
                      : 'bg-[#0a0e12] border-white/10'
                  }`}
                >
                  {/* Left: Concept Info */}
                  <div className="space-y-1 max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white bg-black/50 px-2 py-0.5 rounded">
                        {mem.conceptId}
                      </span>
                      <span className="text-sm font-medium text-white">{concept?.name || mem.conceptId}</span>
                      {isDue && (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                          Due Review
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#aab4ad] truncate">{concept?.description}</p>
                  </div>

                  {/* Middle: FSRS State Metrics */}
                  <div className="flex items-center gap-4 text-xs font-mono bg-black/40 px-3 py-2 rounded-xl border border-white/5">
                    <div>
                      <span className="text-[#78837c] text-[10px] block">Retrievability</span>
                      <span
                        className={`font-bold ${
                          rPercent >= 85
                            ? 'text-emerald-400'
                            : rPercent >= 70
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      >
                        {rPercent}%
                      </span>
                    </div>

                    <div className="border-l border-white/10 pl-3">
                      <span className="text-[#78837c] text-[10px] block">Stability S</span>
                      <span className="text-white font-bold">{mem.stability}d</span>
                    </div>

                    <div className="border-l border-white/10 pl-3">
                      <span className="text-[#78837c] text-[10px] block">Difficulty</span>
                      <span className="text-white font-bold">{mem.difficulty}/10</span>
                    </div>

                    <div className="border-l border-white/10 pl-3">
                      <span className="text-[#78837c] text-[10px] block">Next Interval</span>
                      <span className="text-emerald-300 font-bold">+{nextInterval}d</span>
                    </div>
                  </div>

                  {/* Right: Anki/FSRS Grade Buttons */}
                  <div className="flex items-center gap-1.5 w-full md:w-auto justify-end">
                    <button
                      onClick={() => handleGrade(mem.conceptId, 'again')}
                      className="px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-mono transition-all"
                      title="Forgot concept; reset stability"
                    >
                      Again
                    </button>
                    <button
                      onClick={() => handleGrade(mem.conceptId, 'hard')}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-mono transition-all"
                      title="Recalled with effort"
                    >
                      Hard
                    </button>
                    <button
                      onClick={() => handleGrade(mem.conceptId, 'good')}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-mono transition-all"
                      title="Solid recall"
                    >
                      Good
                    </button>
                    <button
                      onClick={() => handleGrade(mem.conceptId, 'easy')}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-mono transition-all"
                      title="Effortless recall; boost stability"
                    >
                      Easy
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
