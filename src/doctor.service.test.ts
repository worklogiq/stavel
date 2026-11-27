import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { diagnoseRepository, previewRepairs } from './doctor.service.js';
import { applyPlan, resumeMigration, rollbackMigration, verifyPlan } from './migration.service.js';
import { digest, jsonText } from './filesystem.service.js';
import { validatePlan } from './planning.service.js';
import { AI_EFFECT_WARNING } from './effects.service.js';
import { guidedInit } from './guided.service.js';

const sourceRoot = process.cwd(), asset = 'docs/internal/dev/change-provenance.guide.md';
const alignment = { confirmed: true, instruction: 'user:fixture:reviewed-repair' };
function write(root: string, name: string, text: string | Buffer): void { const file = path.join(root, name); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); }
function fixture(expected?: string): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-doctor-'));
  write(root, '.stavel.json', jsonText({ product: 'stavel', format: 2, framework_path: 'docs/internal', track: 'greenfield', entrypoint: 'AGENTS.md', files: { [asset]: expected ?? digest(fs.readFileSync(path.join(sourceRoot, asset))) } }));
  return root;
}
function snapshot(root: string): Record<string, string> {
  const result: Record<string, string> = {};
  const visit = (directory: string): void => { for (const item of fs.readdirSync(directory, { withFileTypes: true })) { const file = path.join(directory, item.name); if (item.isDirectory()) visit(file); else result[path.relative(root, file)] = fs.readFileSync(file).toString('base64'); } };
  if (fs.existsSync(root)) visit(root); return result;
}
test('doctor reports uninitialized and unavailable semantic review without adopting or creating target', async () => {
  const root = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-no-doctor-')), 'missing');
  const report = await diagnoseRepository({ root, sourceRoot });
  assert.equal(report.readyForClosure, false); assert.equal(report.mechanicalPassed, false);
  assert.ok(report.findings.some(item => item.id === 'semantic-review' && item.state === 'review-required'));
  assert.ok(report.findings.some(item => item.id === 'adoption' && item.state === 'unavailable'));
  assert.equal(fs.existsSync(root), false);
});
test('doctor refuses malformed configuration without falling back or changing bytes', async () => {
  const root = fixture(); write(root, 'stavel.config.json', '{'); const before = snapshot(root);
  const report = await diagnoseRepository({ root, sourceRoot });
  assert.equal(report.mechanicalPassed, false); assert.equal(report.findings.find(item => item.id === 'configuration-or-inspection')?.state, 'failed');
  assert.deepEqual(snapshot(root), before);
});

test('doctor recognizes manual adoption and previews selected owned guard repairs without Git writes', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-doctor-guards-'));
  assert.equal(spawnSync('git', ['init', '-b', 'work', root], { windowsHide: true }).status, 0);
  const selected = await guidedInit({ target: root, sourceRoot, answers: { useDefaults: true, configuration: { schemaVersion: 1, workflow: { gitProtection: { enabled: true, protectedBranches: ['main'], hooksPath: '.repo-hooks' } } }, alignment, answers: { 'project.name': 'Guard doctor', 'project.intent': 'Preserve selected repository safety.', 'source.languages': ['typescript'], 'verification.commands': 'npm test', 'product.audience': 'Repository contributors', 'product.scope': 'A repository library', 'product.outcomes': 'Reviewable changes and guarded Git actions' } } });
  applyPlan(selected.plan!); fs.unlinkSync(path.join(root, '.stavel.json'));
  const healthy = await diagnoseRepository({ root, sourceRoot });
  assert.equal(healthy.findings.find(finding => finding.id === 'adoption')!.state, 'passed'); assert.equal(healthy.initialization!.adoption, 'manual'); assert.equal(healthy.findings.find(finding => finding.id === 'git-guards')!.state, 'passed');
  fs.unlinkSync(path.join(root, '.repo-hooks/pre-commit')); const before = snapshot(root), report = await diagnoseRepository({ root, sourceRoot });
  assert.equal(report.initialization!.guards!.state, 'incomplete'); assert.equal(report.mechanicalPassed, false); assert.ok(report.repairable.includes('git-guards')); assert.deepEqual(snapshot(root), before);
  const repair = previewRepairs({ root, sourceRoot, report, alignment }); assert.deepEqual(repair.operations.map(operation => operation.path), ['.repo-hooks/pre-commit']); assert.ok(repair.gitGuardActivation); assert.deepEqual(snapshot(root), before);
  applyPlan(repair, { dryRun: true }); assert.deepEqual(snapshot(root), before); applyPlan(repair);
  assert.equal((await diagnoseRepository({ root, sourceRoot })).initialization!.guards!.state, 'ready');
});

test('doctor serialized repair owns Git config as an activation effect through verify resume and rollback', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-doctor-recovery-'));
  const setup = await guidedInit({ target: root, sourceRoot, answers: { useDefaults: true, configuration: { schemaVersion: 1, workflow: { gitProtection: { enabled: true, protectedBranches: ['main'], hooksPath: '.repo-hooks' } } }, alignment, answers: { 'project.name': 'Recovery doctor', 'project.intent': 'Preserve exact recovery boundaries.', 'source.languages': ['typescript'], 'verification.commands': 'npm test', 'product.audience': 'Contributors', 'product.scope': 'A temporary library', 'product.outcomes': 'Reviewable preserving recovery' } } });
  applyPlan(setup.plan!); assert.equal(spawnSync('git', ['init', '-b', 'work', root], { windowsHide: true }).status, 0);
  fs.unlinkSync(path.join(root, '.repo-hooks/pre-commit')); const beforeConfig = fs.readFileSync(path.join(root, '.git/config'));
  const report = await diagnoseRepository({ root, sourceRoot }); assert.equal(report.initialization!.guards!.active, false); assert.ok(Object.hasOwn(report.inputs, '.git/config'));
  const plan = JSON.parse(JSON.stringify(previewRepairs({ root, sourceRoot, report, alignment }))); assert.equal(Object.hasOwn(plan.inputs, '.git/config'), false); assert.ok(plan.gitGuardActivation);
  const applied = applyPlan(plan); assert.equal(verifyPlan(plan).ok, true); assert.notDeepEqual(fs.readFileSync(path.join(root, '.git/config')), beforeConfig);
  assert.equal(resumeMigration({ root, journal: applied.journal! }).state, 'complete'); assert.equal(verifyPlan(plan).ok, true);
  assert.equal(rollbackMigration({ root, journal: applied.journal! }).state, 'rolled-back'); assert.deepEqual(fs.readFileSync(path.join(root, '.git/config')), beforeConfig); assert.equal(fs.existsSync(path.join(root, '.repo-hooks/pre-commit')), false); assert.equal(verifyPlan(plan).ok, false);
});
test('configured unavailable registry remains an explicit failed evidence boundary rather than valid empty work', async () => {
  const root = fixture('d'.repeat(64)); write(root, 'stavel.config.json', jsonText({ schemaVersion: 1, workflow: { work: { registryFile: 'custom/work-index.json' } } }));
  const before = snapshot(root), report = await diagnoseRepository({ root, sourceRoot });
  assert.equal(report.mechanicalPassed, false); assert.equal(report.findings.find(finding => finding.id === 'work-registry')?.state, 'unavailable');
  assert.deepEqual(snapshot(root), before);
});
test('exact missing pinned asset restoration previews, dry-runs and preserves unrelated binary bytes', async () => {
  const root = fixture(); write(root, 'untouched.bin', Buffer.from([0, 255, 128])); const before = snapshot(root);
  const report = await diagnoseRepository({ root, sourceRoot }); assert.deepEqual(report.repairable, [`restore:${asset}`]);
  const plan = previewRepairs({ root, sourceRoot, report, alignment });
  assert.equal(plan.execution?.kind, 'deterministic'); assert.equal(plan.operations.length, 1);
  applyPlan(plan, { dryRun: true }); assert.deepEqual(snapshot(root), before);
  applyPlan(plan); assert.deepEqual(fs.readFileSync(path.join(root, asset)), fs.readFileSync(path.join(sourceRoot, asset)));
  assert.equal(fs.readFileSync(path.join(root, 'untouched.bin')).toString('hex'), '00ff80');
  assert.equal((await diagnoseRepository({ root, sourceRoot })).repairable.length, 0);
});
test('unavailable pinned bytes do not offer replacement from another version', async () => {
  const root = fixture('a'.repeat(64)), before = snapshot(root); const report = await diagnoseRepository({ root, sourceRoot });
  assert.deepEqual(report.repairable, []); assert.ok(report.findings.some(item => item.path === asset && item.state === 'unavailable')); assert.deepEqual(snapshot(root), before);
});
test('doctor offers an explicit preserving work-schema migration and never applies it during diagnosis', async () => {
  const root = fixture('c'.repeat(64));
  write(root, 'docs/internal/work-index.json', jsonText({ schemaVersion: 1, capabilities: [] })); const before = snapshot(root);
  const report = await diagnoseRepository({ root, sourceRoot }); assert.deepEqual(report.repairable, ['migrate-work-schema']);
  assert.deepEqual(snapshot(root), before);
  const plan = previewRepairs({ root, sourceRoot, report, alignment }); applyPlan(plan, { dryRun: true }); assert.deepEqual(snapshot(root), before);
  applyPlan(plan);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'docs/internal/work-index.json'), 'utf8')), { schemaVersion: 2, capabilities: [] });
});
test('changed input after diagnosis refuses repair preview and preserves current contents', async () => {
  const root = fixture(); const report = await diagnoseRepository({ root, sourceRoot }); write(root, 'stavel.config.json', '{}'); const before = snapshot(root);
  assert.throws(() => previewRepairs({ root, sourceRoot, report, alignment }), /stale diagnosis/); assert.deepEqual(snapshot(root), before);
});
test('AI repair requires source and warning, and serialized warning cannot be removed', async () => {
  const root = fixture(); const report = await diagnoseRepository({ root, sourceRoot });
  assert.throws(() => previewRepairs({ root, sourceRoot, report, alignment, kind: 'agent-assisted' }), /actual instruction|source/);
  const plan = previewRepairs({ root, sourceRoot, report, alignment, kind: 'agent-assisted', source: 'user:fixture:agent-proposal' });
  assert.deepEqual(plan.execution?.warnings, [AI_EFFECT_WARNING]); validatePlan(plan);
  plan.execution!.warnings = []; assert.throws(() => validatePlan(plan), /checksum|warning/);
});
test('owned generated blocks preserve surrounding content and explicit link maps rebase only selected files', async () => {
  const root = fixture('b'.repeat(64)); write(root, 'guide.md', 'before\n<!-- stavel:generated tools -->\nold\n<!-- /stavel:generated tools -->\nafter\n');
  write(root, 'links.md', '[Old](docs/old.md)\n');
  const report = await diagnoseRepository({ root, sourceRoot });
  const plan = previewRepairs({ root, sourceRoot, report, alignment, generatedBlocks: [{ path: 'guide.md', id: 'tools', content: 'new', ownershipSource: 'user:fixture:owned-tools-block' }], linkMappings: { 'docs/old.md': 'docs/new.md' }, linkFiles: ['links.md'] });
  applyPlan(plan);
  assert.equal(fs.readFileSync(path.join(root, 'guide.md'), 'utf8'), 'before\n<!-- stavel:generated tools -->\nnew\n<!-- /stavel:generated tools -->\nafter\n');
  assert.equal(fs.readFileSync(path.join(root, 'links.md'), 'utf8'), '[Old](./docs/new.md)\n');
  const updated = await diagnoseRepository({ root, sourceRoot }); const before = snapshot(root);
  assert.throws(() => previewRepairs({ root, sourceRoot, report: updated, alignment, generatedBlocks: [{ path: 'links.md', id: 'tools', content: 'bad', ownershipSource: 'user:fixture' }] }), /owned block/);
  assert.deepEqual(snapshot(root), before);
});

test('repairs compose disjoint blocks and links in one file and refuse nested or injected ownership markers', async () => {
  const root = fixture('b'.repeat(64));
  const text = 'prefix\n<!-- stavel:generated first -->\none\n<!-- /stavel:generated first -->\n[Old](docs/old.md)\n<!-- stavel:generated second -->\ntwo\n<!-- /stavel:generated second -->\nsuffix\n';
  write(root, 'guide.md', text); const report = await diagnoseRepository({ root, sourceRoot });
  const blocks = [{ path: 'guide.md', id: 'first', content: 'changed first', ownershipSource: 'user:fixture' }, { path: 'guide.md', id: 'second', content: 'changed second', ownershipSource: 'user:fixture' }];
  const plan = previewRepairs({ root, sourceRoot, report, alignment, generatedBlocks: blocks, linkMappings: { 'docs/old.md': 'docs/new.md' }, linkFiles: ['guide.md'] });
  assert.equal(plan.operations.length, 1); applyPlan(plan);
  assert.equal(fs.readFileSync(path.join(root, 'guide.md'), 'utf8'), text.replace('\none\n', '\nchanged first\n').replace('\ntwo\n', '\nchanged second\n').replace('(docs/old.md)', '(./docs/new.md)'));
  const updated = await diagnoseRepository({ root, sourceRoot }); const before = snapshot(root);
  assert.throws(() => previewRepairs({ root, sourceRoot, report: updated, alignment, generatedBlocks: [{ ...blocks[0], content: '<!-- /stavel:generated first -->' }] }), /inject ownership/);
  assert.deepEqual(snapshot(root), before);
  write(root, 'guide.md', '<!-- stavel:generated first -->\n<!-- stavel:generated second -->\n<!-- /stavel:generated second -->\n<!-- /stavel:generated first -->');
  const nested = await diagnoseRepository({ root, sourceRoot });
  assert.throws(() => previewRepairs({ root, sourceRoot, report: nested, alignment, generatedBlocks: blocks }), /nested/);
});
