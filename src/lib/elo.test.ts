import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSuccessProbability, updateElo, scoreQuestionForStudent } from './elo';

test('calculateSuccessProbability yields 0.5 when ability equals difficulty', () => {
  const p = calculateSuccessProbability(0.0, 0.0);
  assert.equal(Math.round(p * 100), 50);
});

test('updateElo increases student theta and decreases item delta on success', () => {
  const theta = 0.5;
  const delta = 1.0;
  const result = updateElo(theta, delta, true);
  assert.ok(result.newTheta > theta, 'Student ability should increase after a correct answer');
  assert.ok(result.newDelta < delta, 'Item difficulty should decrease after student answers correctly');
});

test('scoreQuestionForStudent rejects questions with insecure prerequisites', () => {
  const scored = scoreQuestionForStudent(0.2, 0.5, 0.3, false);
  assert.ok(scored.score < 0, 'Insecure prerequisites must be penalized');
  assert.match(scored.reason, /Prerequisites not yet secure/i);
});
