/**
 * Bayesian Knowledge Tracing (BKT) Engine with Prerequisite Propagation
 * Based on research specifications from "Adaptive Exam-Prep Tutoring with a Transparent Learner Model"
 *
 * P(L | correct) = L(1 - s) / [ L(1 - s) + (1 - L)g ]
 * P(L | incorrect) = L s / [ L s + (1 - L)(1 - g) ]
 * L_next = P(L | response) + (1 - P(L | response)) * T
 */

export interface BKTParams {
  pL: number; // Current probability of mastery P(L)
  g: number;  // Guess probability (e.g. 0.25 for 4-option MCQ)
  s: number;  // Slip probability (e.g. 0.10)
  t: number;  // Transit/learning probability (e.g. 0.15)
}

export interface ConceptNode {
  id: string;
  name: string;
  unit: 'Electricity' | 'Light';
  prerequisites: string[];
  description: string;
  learningObjective: string;
  mastery: number; // 0 to 1
  bkt: BKTParams;
  misconceptionIds: string[];
}

export function updateBKT(currentPL: number, correct: boolean, g = 0.25, s = 0.10, t = 0.15): number {
  let posterior: number;
  if (correct) {
    const numerator = currentPL * (1 - s);
    const denominator = numerator + (1 - currentPL) * g;
    posterior = denominator > 0 ? numerator / denominator : currentPL;
  } else {
    const numerator = currentPL * s;
    const denominator = numerator + (1 - currentPL) * (1 - g);
    posterior = denominator > 0 ? numerator / denominator : currentPL;
  }
  
  // Transition to learned state
  const nextPL = posterior + (1 - posterior) * t;
  return Math.min(0.99, Math.max(0.01, nextPL));
}

/**
 * Propagate mastery evidence through the concept graph directed acyclic graph (DAG)
 * with a damping factor (e.g. 0.4 for prerequisites, 0.25 for dependents)
 */
export function propagateEvidence(
  concepts: Record<string, ConceptNode>,
  targetConceptId: string,
  newMastery: number,
  dampingPrereq = 0.35,
  dampingDep = 0.20
): Record<string, number> {
  const updates: Record<string, number> = {};
  const current = concepts[targetConceptId];
  if (!current) return updates;

  const delta = newMastery - current.mastery;
  updates[targetConceptId] = newMastery;

  // Propagate to direct prerequisites (if student failed, prerequisite is likely weaker)
  for (const prereqId of current.prerequisites) {
    const prereq = concepts[prereqId];
    if (prereq) {
      const prereqDelta = delta * dampingPrereq;
      const updated = Math.min(0.99, Math.max(0.01, prereq.mastery + prereqDelta));
      updates[prereqId] = updated;
    }
  }

  // Propagate to dependents (if student mastered, dependents get a boost)
  for (const [id, node] of Object.entries(concepts)) {
    if (node.prerequisites.includes(targetConceptId)) {
      const depDelta = delta * dampingDep;
      const updated = Math.min(0.99, Math.max(0.01, node.mastery + depDelta));
      updates[id] = updated;
    }
  }

  return updates;
}

export function getMasteryCategory(mastery: number): 'Strong' | 'Developing' | 'Weak' | 'Not yet assessed' {
  if (mastery <= 0.05) return 'Not yet assessed';
  if (mastery >= 0.75) return 'Strong';
  if (mastery >= 0.40) return 'Developing';
  return 'Weak';
}
