import test from 'node:test';
import assert from 'node:assert/strict';
import { diagnoseStudentReasoning } from './misconceptions';

test('diagnoseStudentReasoning detects M1 from wrong answer with current consumption belief', () => {
  const result = diagnoseStudentReasoning(
    'q_e1_02',
    'a',
    'The current is used up by the bulb so less electricity comes out at A2'
  );

  assert.equal(result.status, 'misconception_detected');
  assert.equal(result.misconception?.id, 'M1');
  assert.equal(result.isCorrectAnswerTrap, false);
});

test('diagnoseStudentReasoning catches the Correct-Answer Trap (correct option with flawed reasoning)', () => {
  // Student picks correct option 'b' (5 ohms), but wrote that adding parallel branches increases resistance
  const result = diagnoseStudentReasoning(
    'q_e7_01',
    'b',
    'I picked 5 ohms but usually parallel increases total resistance'
  );

  assert.equal(result.status, 'misconception_detected');
  assert.equal(result.misconception?.id, 'M4');
  assert.equal(result.isCorrectAnswerTrap, true);
  assert.match(result.rationale, /Correct-Answer Trap detected/i);
});

test('diagnoseStudentReasoning returns sound_reasoning when explanation is valid', () => {
  const result = diagnoseStudentReasoning(
    'q_e1_02',
    'b',
    'Charge is strictly conserved in a series loop, so both ammeters measure identical charge rate'
  );

  assert.equal(result.status, 'sound_reasoning');
  assert.equal(result.misconception, null);
});

test('diagnoseStudentReasoning routes ambiguous brief answers to needs_teacher_review', () => {
  const result = diagnoseStudentReasoning(
    'q_e4_01',
    'c',
    'guess'
  );

  assert.equal(result.status, 'needs_teacher_review');
});
