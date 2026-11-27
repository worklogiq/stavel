import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { annotateEffects, AI_EFFECT_WARNING, bindPlanInputs, effectProvenance, mutationPlan } from './effects.service.js';
import { fileHash } from './filesystem.service.js';
import { applyPlan, rollbackMigration } from './migration.service.js';
import { validatePlan } from './planning.service.js';

const alignment = { confirmed: true, instruction: 'user:fixture:effect-scope' };
test('effect provenance separates AI judgment from deterministic application and requires source', () => {
  assert.deepEqual(effectProvenance(), { kind: 'deterministic', warnings: [] });
  assert.throws(() => effectProvenance('agent-assisted'), /actual instruction|source/);
  assert.deepEqual(effectProvenance('agent-assisted', 'user:fixture').warnings, [AI_EFFECT_WARNING]);
});
test('mutation preview protects binary originals, stale edits, checksum and recoverable application', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-effect-'));
  fs.writeFileSync(path.join(root, 'source.bin'), Buffer.from([0, 254, 128]));
  const plan = mutationPlan({ root, alignment, changes: [{ path: 'source.bin', content: Buffer.from([255, 1]), reason: 'bounded fixture transform' }] });
  applyPlan(plan, { dryRun: true }); assert.equal(fs.readFileSync(path.join(root, 'source.bin')).toString('hex'), '00fe80');
  const agentPlan = annotateEffects(plan, 'agent-assisted', 'user:fixture:reviewed-semantic-transform'); validatePlan(agentPlan);
  const tampered = structuredClone(plan); tampered.projectName = 'silently changed';
  assert.throws(() => annotateEffects(tampered, 'agent-assisted', 'user:fixture'), /checksum/);
  assert.deepEqual(agentPlan.execution?.warnings, [AI_EFFECT_WARNING]); assert.notEqual(agentPlan.id, plan.id);
  assert.throws(() => annotateEffects(agentPlan, 'deterministic'), /cannot be downgraded/);
  const applied = applyPlan(agentPlan); assert.equal(fs.readFileSync(path.join(root, 'source.bin')).toString('hex'), 'ff01');
  rollbackMigration({ root, journal: applied.journal! }); assert.equal(fs.readFileSync(path.join(root, 'source.bin')).toString('hex'), '00fe80');
  fs.writeFileSync(path.join(root, 'source.bin'), 'later'); assert.throws(() => applyPlan(plan), /stale|precondition/); assert.equal(fs.readFileSync(path.join(root, 'source.bin'), 'utf8'), 'later');
});
test('mutation preview refuses unaligned, duplicate and escaped changes before target writes', () => {
  const root = path.join(os.tmpdir(), `stavel-effect-missing-${Date.now()}`);
  assert.throws(() => mutationPlan({ root, alignment: { confirmed: false, instruction: '' }, changes: [] }), /alignment/);
  assert.throws(() => mutationPlan({ root, alignment, changes: [{ path: '../bad', content: 'x', reason: 'invalid' }] }), /relative path/);
  assert.throws(() => mutationPlan({ root, alignment, changes: [{ path: 'a', content: 'x', reason: 'duplicate' }, { path: 'a', content: 'y', reason: 'duplicate' }] }), /duplicate/);
  assert.equal(fs.existsSync(root), false);
});
test('binding resolved policy inputs rejects changed configuration before saved plan application', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-policy-binding-'));
  fs.writeFileSync(path.join(root, 'stavel.config.json'), '{}');
  const plan = mutationPlan({ root, alignment, changes: [{ path: 'output.txt', content: 'selected result', reason: 'bounded fixture' }] });
  const bound = bindPlanInputs(plan, { 'stavel.config.json': fileHash(root, 'stavel.config.json') });
  fs.writeFileSync(path.join(root, 'stavel.config.json'), '{"changed":true}');
  assert.throws(() => applyPlan(bound), /stale plan/); assert.equal(fs.existsSync(path.join(root, 'output.txt')), false);
});
