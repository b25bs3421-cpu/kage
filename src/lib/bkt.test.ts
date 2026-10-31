import test from 'node:test';
import assert from 'node:assert/strict';
import { updateBKT, propagateEvidence, getMasteryCategory, type ConceptNode } from './bkt';

test('BKT increases mastery upon correct answer', () => {
  const initial = 0.30;
  const updated = updateBKT(initial, true, 0.25, 0.10, 0.15);
  assert.ok(updated > initial, `Expected updated mastery (${updated}) to be greater than initial (${initial})`);
});

test('BKT decreases mastery upon incorrect answer', () => {
  const initial = 0.60;
  const updated = updateBKT(initial, false, 0.25, 0.10, 0.15);
  assert.ok(updated < initial, `Expected updated mastery (${updated}) to be less than initial (${initial})`);
});

test('propagateEvidence dampens delta to prerequisites', () => {
  const mockConcepts: Record<string, ConceptNode> = {
    E1: {
      id: 'E1',
      name: 'Electric charge and current',
      unit: 'Electricity',
      prerequisites: [],
      description: 'Basics of current',
      learningObjective: 'Define I = Q/t',
      mastery: 0.80,
      bkt: { pL: 0.80, g: 0.25, s: 0.1, t: 0.15 },
      misconceptionIds: ['M1']
    },
    E4: {
      id: 'E4',
      name: "Ohm's law",
      unit: 'Electricity',
      prerequisites: ['E1'],
      description: 'V = IR',
      learningObjective: 'Apply V = IR',
      mastery: 0.50,
      bkt: { pL: 0.50, g: 0.25, s: 0.1, t: 0.15 },
      misconceptionIds: ['M3']
    }
  };

  // Student fails E4: mastery drops to 0.20
  const updates = propagateEvidence(mockConcepts, 'E4', 0.20);
  assert.equal(updates.E4, 0.20);
  assert.ok(updates.E1 < 0.80, 'Expected prerequisite E1 mastery to decrease when dependent E4 drops');
});

test('getMasteryCategory categorizes ranges correctly', () => {
  assert.equal(getMasteryCategory(0.01), 'Not yet assessed');
  assert.equal(getMasteryCategory(0.25), 'Weak');
  assert.equal(getMasteryCategory(0.55), 'Developing');
  assert.equal(getMasteryCategory(0.85), 'Strong');
});
