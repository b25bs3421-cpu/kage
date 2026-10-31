/**
 * Free Spaced Repetition Scheduler (FSRS-4.5/5) implementation
 * Section 7 of the research paper:
 *
 * R(t, S) = (1 + F * t / S)^C, with F = 19/81 and C = -0.5
 * interval(r) = (S / F) * (r^(1/C) - 1)
 */

export const FSRS_CONSTANTS = {
  F: 19 / 81,
  C: -0.5,
};

export interface MemoryState {
  conceptId: string;
  stability: number; // in days
  difficulty: number; // 1 to 10
  lastReviewedAt: number; // timestamp ms
  nextReviewAt: number; // timestamp ms
  reps: number;
  lapses: number;
}

export function calculateRetrievability(daysElapsed: number, stability: number): number {
  if (daysElapsed <= 0) return 1.0;
  if (stability <= 0) return 0.1;
  const { F, C } = FSRS_CONSTANTS;
  const r = Math.pow(1 + (F * daysElapsed) / stability, C);
  return Math.min(1.0, Math.max(0.01, r));
}

export function calculateNextInterval(desiredRetention: number, stability: number): number {
  const { F, C } = FSRS_CONSTANTS;
  const clampedR = Math.min(0.99, Math.max(0.70, desiredRetention));
  // r^(1/C) - 1
  const term = Math.pow(clampedR, 1 / C) - 1;
  const interval = (stability / F) * term;
  return Math.max(1, Math.round(interval));
}

export function getExamAwareRetentionTarget(daysToExam: number): number {
  if (daysToExam <= 7) return 0.95; // Final sprint: maximum retention
  if (daysToExam <= 30) return 0.92; // 1 month out
  if (daysToExam <= 90) return 0.90; // Recommended default for standard exam prep
  return 0.88; // Long-term foundation
}

export function updateMemoryState(
  state: MemoryState,
  grade: 'again' | 'hard' | 'good' | 'easy',
  daysToExam = 60,
  nowMs = Date.now()
): MemoryState {
  const daysElapsed = Math.max(0, (nowMs - state.lastReviewedAt) / (1000 * 60 * 60 * 24));
  const currentR = calculateRetrievability(daysElapsed, state.stability);
  const targetR = getExamAwareRetentionTarget(daysToExam);

  let newStability = state.stability;
  let newDifficulty = state.difficulty;
  let newReps = state.reps + 1;
  let newLapses = state.lapses;

  if (grade === 'again') {
    newLapses += 1;
    newStability = Math.max(0.5, state.stability * 0.4);
    newDifficulty = Math.min(10, state.difficulty + 0.8);
  } else if (grade === 'hard') {
    newStability = state.stability * 1.2;
    newDifficulty = Math.min(10, state.difficulty + 0.3);
  } else if (grade === 'good') {
    const factor = 1 + (11 - state.difficulty) * 0.35 * (1 - currentR);
    newStability = state.stability * Math.max(1.3, factor);
    newDifficulty = Math.max(1, state.difficulty - 0.2);
  } else {
    // Easy
    const factor = 1 + (11 - state.difficulty) * 0.6 * (1 - currentR);
    newStability = state.stability * Math.max(1.8, factor);
    newDifficulty = Math.max(1, state.difficulty - 0.5);
  }

  const intervalDays = calculateNextInterval(targetR, newStability);
  const nextReviewAt = nowMs + intervalDays * 24 * 60 * 60 * 1000;

  return {
    conceptId: state.conceptId,
    stability: Number(newStability.toFixed(2)),
    difficulty: Number(newDifficulty.toFixed(2)),
    lastReviewedAt: nowMs,
    nextReviewAt,
    reps: newReps,
    lapses: newLapses,
  };
}
