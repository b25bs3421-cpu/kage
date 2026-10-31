/**
 * Elo-style Item Response Theory Difficulty & Ability Calibration
 * Section 3.4 of the research paper:
 * P(correct) = 1 / (1 + exp(-(theta - delta)))
 * theta <- theta + K * (X - P)
 * delta <- delta - K * (X - P)
 */

export interface EloUpdateResult {
  newTheta: number; // Student ability
  newDelta: number; // Question difficulty
  predictedProbability: number;
}

export function calculateSuccessProbability(theta: number, delta: number): number {
  return 1 / (1 + Math.exp(-(theta - delta)));
}

export function updateElo(
  theta: number,
  delta: number,
  observedCorrect: boolean,
  kTheta = 0.4,
  kDelta = 0.25
): EloUpdateResult {
  const X = observedCorrect ? 1 : 0;
  const p = calculateSuccessProbability(theta, delta);

  const newTheta = Math.max(-3.5, Math.min(3.5, theta + kTheta * (X - p)));
  const newDelta = Math.max(-3.5, Math.min(3.5, delta - kDelta * (X - p)));

  return {
    newTheta: Number(newTheta.toFixed(3)),
    newDelta: Number(newDelta.toFixed(3)),
    predictedProbability: Number(p.toFixed(3)),
  };
}

/**
 * Score a candidate question for adaptive selection.
 * Balances:
 * 1. Target success probability (~0.75 is the sweet spot from Math Garden literature [9])
 * 2. Prerequisite readiness (prerequisites should have higher mastery)
 * 3. Uncertainty reduction (lower mastery confidence gets a priority boost)
 */
export function scoreQuestionForStudent(
  theta: number,
  delta: number,
  conceptMastery: number,
  prereqSecure: boolean,
  targetProb = 0.75
): { score: number; reason: string } {
  if (!prereqSecure) {
    return {
      score: -10,
      reason: 'Prerequisites not yet secure; build foundational concepts first',
    };
  }

  const p = calculateSuccessProbability(theta, delta);
  const probDistance = Math.abs(p - targetProb);
  const masteryUrgency = 1 - conceptMastery; // weaker concepts prioritized

  // Higher score = better candidate
  const score = (1 - probDistance * 1.2) * 0.6 + masteryUrgency * 0.4;

  let reason = '';
  if (conceptMastery < 0.45) {
    reason = `Targeting weak concept (mastery ${(conceptMastery * 100).toFixed(0)}%) with calibrated success probability ${(p * 100).toFixed(0)}%`;
  } else if (probDistance < 0.1) {
    reason = `Optimal challenge level matching target success probability (${(p * 100).toFixed(0)}%)`;
  } else {
    reason = `Strengthening concept towards mastery threshold`;
  }

  return { score: Number(score.toFixed(3)), reason };
}
