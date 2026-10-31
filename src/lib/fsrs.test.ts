import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRetrievability,
  calculateNextInterval,
  getExamAwareRetentionTarget,
  updateMemoryState,
  type MemoryState,
} from './fsrs';

test('calculateRetrievability decays over time with power law', () => {
  const r0 = calculateRetrievability(0, 5);
  const r5 = calculateRetrievability(5, 5);
  const r20 = calculateRetrievability(20, 5);
  assert.equal(r0, 1.0);
  assert.ok(r5 < r0, 'Retrievability at 5 days should be lower than at 0 days');
  assert.ok(r20 < r5, 'Retrievability at 20 days should be lower than at 5 days');
});

test('calculateNextInterval increases with stability and lower desired retention', () => {
  const intervalHighR = calculateNextInterval(0.95, 10);
  const intervalLowR = calculateNextInterval(0.85, 10);
  assert.ok(
    intervalLowR > intervalHighR,
    'Lower retention target allows longer intervals between reviews'
  );
});

test('getExamAwareRetentionTarget sets high retention for near exam dates', () => {
  assert.equal(getExamAwareRetentionTarget(5), 0.95);
  assert.equal(getExamAwareRetentionTarget(25), 0.92);
  assert.equal(getExamAwareRetentionTarget(60), 0.90);
});

test('updateMemoryState penalizes stability on "again" grade', () => {
  const initial: MemoryState = {
    conceptId: 'E4',
    stability: 8.0,
    difficulty: 5.0,
    lastReviewedAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    nextReviewAt: Date.now(),
    reps: 3,
    lapses: 0,
  };
  const updated = updateMemoryState(initial, 'again', 60);
  assert.ok(updated.stability < initial.stability, 'Stability must decrease on failed review');
  assert.equal(updated.lapses, 1);
});
