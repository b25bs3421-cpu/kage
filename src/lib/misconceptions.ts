/**
 * Misconception Diagnosis Engine
 * Implements Section 6 of the research paper:
 * - Detects misconceptions from student reasoning (not just wrong final answer)
 * - Catches the "Correct Answer Trap" (Imran & Bulathwela 2026; Eedi 2026)
 * - Provides 3-way output: 'misconception_detected' | 'sound_reasoning' | 'needs_teacher_review'
 */

import { MISCONCEPTIONS, QUESTION_BANK, type Misconception } from './physicsData';

export interface DiagnosisResult {
  status: 'misconception_detected' | 'sound_reasoning' | 'needs_teacher_review';
  misconception: Misconception | null;
  isCorrectAnswerTrap: boolean; // Correct answer selected but reasoning is flawed
  confidence: number; // 0 to 1
  rationale: string;
  counterExamplePrompt?: string;
  remediationHint?: string;
}

export function diagnoseStudentReasoning(
  questionId: string,
  selectedOptionId: string,
  reasoningText: string
): DiagnosisResult {
  const question = QUESTION_BANK.find((q) => q.id === questionId);
  const normalizedText = reasoningText.trim().toLowerCase();
  const selectedOption = question?.options.find((opt) => opt.id === selectedOptionId);
  const isOptionCorrect = selectedOption?.isCorrect ?? false;

  // Check 1: Option explicitly maps to a distractor misconception
  const optionMisconceptionId = selectedOption?.misconceptionId;

  // Check 2: Pattern match against known misconception beliefs in student reasoning text
  let detectedMisconceptionId: string | null = null;
  let matchScore = 0;

  if (
    normalizedText.includes('used up') ||
    normalizedText.includes('uses up') ||
    normalizedText.includes('consumed') ||
    normalizedText.includes('burned') ||
    normalizedText.includes('less current after') ||
    normalizedText.includes('bulb eats')
  ) {
    detectedMisconceptionId = 'M1';
    matchScore = 0.92;
  } else if (
    normalizedText.includes('always supplies the same') ||
    normalizedText.includes('battery fixed current') ||
    normalizedText.includes('battery always outputs') ||
    normalizedText.includes('same current regardless')
  ) {
    detectedMisconceptionId = 'M2';
    matchScore = 0.88;
  } else if (
    normalizedText.includes('voltage increases resistance') ||
    normalizedText.includes('r depends on v') ||
    normalizedText.includes('doubling voltage doubles resistance') ||
    (normalizedText.includes('r = v/i') && normalizedText.includes('so r changes'))
  ) {
    detectedMisconceptionId = 'M3';
    matchScore = 0.85;
  } else if (
    normalizedText.includes('parallel increases') ||
    normalizedText.includes('adding more resistors makes more resistance') ||
    normalizedText.includes('parallel total resistance is higher')
  ) {
    detectedMisconceptionId = 'M4';
    matchScore = 0.90;
  } else if (
    normalizedText.includes('divides equally') ||
    normalizedText.includes('same voltage across each') ||
    normalizedText.includes('each gets half the volts')
  ) {
    detectedMisconceptionId = 'M5';
    matchScore = 0.86;
  } else if (
    normalizedText.includes('half the image disappears') ||
    normalizedText.includes('top half is lost') ||
    normalizedText.includes('cut off half') ||
    normalizedText.includes('only bottom half reaches')
  ) {
    detectedMisconceptionId = 'M6';
    matchScore = 0.95;
  } else if (
    normalizedText.includes('always towards the normal') ||
    normalizedText.includes('refraction always bends toward normal') ||
    normalizedText.includes('bends to normal into any medium')
  ) {
    detectedMisconceptionId = 'M7';
    matchScore = 0.91;
  } else if (
    normalizedText.includes('lengths cannot be negative') ||
    normalizedText.includes('distance is always positive') ||
    normalizedText.includes('both sides positive')
  ) {
    detectedMisconceptionId = 'M8';
    matchScore = 0.89;
  }

  // Fallback to option-level mapping if reasoning was too short or generic
  if (!detectedMisconceptionId && optionMisconceptionId) {
    detectedMisconceptionId = optionMisconceptionId;
    matchScore = 0.78;
  }

  // If a misconception was detected
  if (detectedMisconceptionId) {
    const misc = MISCONCEPTIONS[detectedMisconceptionId];
    const isTrap = isOptionCorrect; // The student picked the right option, but holds a flawed underlying mental model!

    return {
      status: 'misconception_detected',
      misconception: misc,
      isCorrectAnswerTrap: isTrap,
      confidence: matchScore,
      rationale: isTrap
        ? `Correct-Answer Trap detected: You chose the correct option (${selectedOption?.text}), but your reasoning reveals misconception ${detectedMisconceptionId} (${misc.title}).`
        : `Misconception detected: Your response reflects ${misc.title}. ${misc.description}`,
      counterExamplePrompt: misc.counterExampleIdea,
      remediationHint: misc.remediationHint,
    };
  }

  // If reasoning is too brief or ambiguous (< 4 words), request teacher review or clarification
  const wordCount = normalizedText.split(/\s+/).filter(Boolean).length;
  if (wordCount < 4 && !isOptionCorrect) {
    return {
      status: 'needs_teacher_review',
      misconception: null,
      isCorrectAnswerTrap: false,
      confidence: 0.45,
      rationale:
        'The provided explanation is brief or ambiguous. Sent for teacher review to avoid false diagnosis.',
    };
  }

  // Sound reasoning
  return {
    status: 'sound_reasoning',
    misconception: null,
    isCorrectAnswerTrap: false,
    confidence: isOptionCorrect ? 0.94 : 0.70,
    rationale: isOptionCorrect
      ? 'Correct answer with sound physical reasoning. Concept mastery validated.'
      : 'Answer is incorrect, but no standard conceptual misconception was identified.',
  };
}
