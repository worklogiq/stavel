import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { clearDecisionSession, discoverScope, guidedInit, readDecisionSession, saveDecisionSession, sessionFile } from './guided.service.js';
import { applyPlan } from './migration.service.js';
import { plannedRepositoryConfiguration } from './configuration.service.js';
import type { AnswersDocument } from './framework.types.js';

const sourceRoot = process.cwd();
const fixture = () => { const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-guided-')); return { directory, root: path.join(directory, 'target'), cache: path.join(directory, 'cache') }; };
function write(root: string, name: string, value: unknown): void { const file = path.join(root, name); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, Buffer.isBuffer(value) || typeof value === 'string' ? value : JSON.stringify(value)); }
function snapshot(root: string): Record<string, string> { const result: Record<string, string> = {}; if (!fs.existsSync(root)) return result; const visit = (directory: string): void => { for (const entry of fs.readdirSync(directory, { withFileTypes: true })) { const file = path.join(directory, entry.name); const name = path.relative(root, file).replace(/\\/g, '/'); if (entry.isDirectory()) { result[`${name}/`] = 'directory'; visit(file); } else result[name] = fs.readFileSync(file).toString('base64'); } }; visit(root); return result; }
const partial = (): AnswersDocument => ({ answers: {}, alignment: { confirmed: false, instruction: '' } });
const complete = (): AnswersDocument => ({ useDefaults: true, answers: { 'project.name': 'Guided fixture', 'project.intent': 'Keep repository conventions explicit and reviewable.', 'source.languages': ['typescript'], 'verification.commands': 'npm test', 'product.audience': 'Maintainers and contributors', 'product.scope': 'Repository initialization and convention maintenance', 'product.outcomes': 'Contributors can inspect policy and prepare reviewable changes.' }, alignment: { confirmed: true, instruction: 'user:fixture:accept-complete-configuration-and-product-facts' } });
function minimalSource(root: string): void {
  write(root, 'config/assets.catalog.json', { product: 'stavel', schemaVersion: 1, assets: [] });
  write(root, 'config/default.profile.json', { schemaVersion: 1, id: 'fixture', version: 1, documentation: { naming: { shape: 'typed', identifierCase: 'kebab' } } });
  write(root, 'config/decisions.catalog.json', { schemaVersion: 1, questions: [{ id: 'project.intent', group: 'project', prompt: 'Actual project intent?', type: 'text', required: true }] });
  write(root, 'config/artifacts.catalog.json', { product: 'stavel', schemaVersion: 1, version: 1, artifacts: [], sections: [] }); write(root, 'VERSION', '0.1.0');
}
const terminal = (align = true, seen: string[] = []) => async (prompt: string): Promise<string> => {
  seen.push(prompt);
  if (prompt.startsWith('Use the selected')) return 'yes';
  if (prompt.startsWith('Review these complete')) return align ? 'align' : 'later';
  const id = prompt.match(/\n([A-Za-z0-9_.-]+): $/)?.[1];
  const facts: Record<string, string> = { 'project.name': 'Terminal fixture', 'project.intent': 'Preserve accepted intent and actual answers.', 'source.languages': '["typescript"]', 'verification.commands': 'npm test', 'product.audience': 'Repository contributors', 'product.scope': 'The initial skill and CLI', 'product.outcomes': 'A clear, inspectable repository workflow' };
  if (!id || !facts[id]) throw new Error(`Unexpected fixture prompt: ${prompt}`);
  return facts[id];
};

test('scope discovery selects a unique ancestor and asks when package/workspace boundaries compete', () => {
  const f = fixture(); write(f.root, 'pyproject.toml', '[project]\nname="fixture"'); fs.mkdirSync(path.join(f.root, 'src/nested'), { recursive: true });
  const unique = discoverScope({ cwd: path.join(f.root, 'src/nested') }); assert.equal(unique.state, 'selected'); assert.equal(unique.root, fs.realpathSync.native(f.root));
  write(f.root, 'package.json', { workspaces: ['apps/*'] }); fs.mkdirSync(path.join(f.root, '.git')); write(f.root, 'apps/web/package.json', { name: 'web' }); fs.mkdirSync(path.join(f.root, 'apps/web/src'));
  const before = snapshot(f.root); const ambiguous = discoverScope({ cwd: path.join(f.root, 'apps/web/src') });
  assert.equal(ambiguous.state, 'ambiguous'); assert.deepEqual(ambiguous.candidates.map(candidate => candidate.path), [fs.realpathSync.native(path.join(f.root, 'apps/web')), fs.realpathSync.native(f.root)]);
  const explicit = discoverScope({ cwd: path.join(f.root, 'apps/web/src'), target: f.root }); assert.equal(explicit.state, 'selected'); assert.equal(explicit.candidates[0].evidence[0], 'explicit --target'); assert.deepEqual(snapshot(f.root), before);
});

test('completed greenfield init is a zero-prompt no-op before stale or corrupt cache inspection', async () => {
  const f = fixture(), record = complete(); record.configuration = { schemaVersion: 1, workflow: { gitProtection: { enabled: false } } };
  const first = await guidedInit({ target: f.root, sourceRoot, cache: f.cache, answers: record }); assert.equal(first.plan!.track, 'greenfield'); applyPlan(first.plan!);
  write(f.root, 'README.md', '# Ordinary project edit\n');
  write(f.cache, path.basename(sessionFile(f.root, f.cache)), '{ deliberately corrupt pre-apply cache');
  const before = snapshot(f.root), cached = snapshot(f.cache); let prompts = 0;
  for (const cache of [f.cache, path.join(f.directory, 'different-machine-cache')]) {
    const repeated = await guidedInit({ target: f.root, sourceRoot, cache, ask: async () => { prompts++; throw new Error('Completed setup must not ask'); } });
    assert.equal(repeated.state, 'already-initialized'); assert.equal(repeated.readiness!.track, 'greenfield'); assert.equal(repeated.plan, undefined); assert.equal(repeated.questions.length, 0);
  }
  assert.equal(prompts, 0); assert.deepEqual(snapshot(f.root), before); assert.deepEqual(snapshot(f.cache), cached);
  const explicit = await guidedInit({ target: f.root, sourceRoot, cache: f.cache, answers: record }); assert.equal(explicit.state, 'preview'); assert.equal(explicit.plan!.track, 'greenfield', 'explicit reconfiguration still reuses the installed track');
});

test('validated manual adoption requires no installer registration and partial documents do not restart onboarding', async () => {
  const f = fixture(), record = complete(); record.configuration = { schemaVersion: 1, workflow: { gitProtection: { enabled: false } } };
  applyPlan((await guidedInit({ target: f.root, sourceRoot, answers: record })).plan!); fs.unlinkSync(path.join(f.root, '.stavel.json'));
  const before = snapshot(f.root); const manual = await guidedInit({ target: f.root, sourceRoot, cache: f.cache, ask: async () => { throw new Error('Manual adoption must not ask'); } });
  assert.equal(manual.state, 'already-initialized'); assert.equal(manual.readiness!.adoption, 'manual'); assert.deepEqual(snapshot(f.root), before); assert.equal(fs.existsSync(f.cache), false);
  fs.unlinkSync(path.join(f.root, 'docs/internal/product/product.overview.md')); const partialBefore = snapshot(f.root);
  const partialResult = await guidedInit({ target: f.root, sourceRoot, cache: f.cache, ask: async () => { throw new Error('Partial setup must report exact gaps'); } });
  assert.equal(partialResult.state, 'incomplete'); assert.ok(partialResult.questions.some(question => question.id === 'product:product')); assert.equal(partialResult.plan, undefined); assert.deepEqual(snapshot(f.root), partialBefore); assert.equal(fs.existsSync(f.cache), false);
});

test('incomplete installed setup preserves stale-session refusal instead of ignoring uncertain answers', async () => {
  const f = fixture(), record = complete(); record.configuration = { schemaVersion: 1, workflow: { gitProtection: { enabled: false } } };
  applyPlan((await guidedInit({ target: f.root, sourceRoot, answers: record })).plan!);
  fs.unlinkSync(path.join(f.root, 'docs/internal/product/product.overview.md'));
  saveDecisionSession(f.root, 'old-pre-apply-input-identity', partial(), f.cache); const before = snapshot(f.root), cached = snapshot(f.cache);
  await assert.rejects(guidedInit({ target: f.root, sourceRoot, cache: f.cache }), /incompatible or stale/);
  assert.deepEqual(snapshot(f.root), before); assert.deepEqual(snapshot(f.cache), cached);
});

test('guard-only bare init reports pending Git and previews activation using existing choices', async () => {
  const f = fixture(), record = complete(); record.configuration = { schemaVersion: 1, workflow: { gitProtection: { enabled: true, protectedBranches: ['main'], hooksPath: '.repo-hooks' } } };
  applyPlan((await guidedInit({ target: f.root, sourceRoot, answers: record })).plan!);
  write(f.cache, path.basename(sessionFile(f.root, f.cache)), '{ obsolete onboarding cache');
  const pending = await guidedInit({ target: f.root, sourceRoot, cache: f.cache }); assert.equal(pending.state, 'incomplete'); assert.equal(pending.readiness!.guards!.state, 'pending-git'); assert.equal(pending.plan, undefined); assert.equal(fs.existsSync(path.join(f.root, '.git')), false);
  assert.equal(spawnSync('git', ['init', '-b', 'work', f.root], { windowsHide: true }).status, 0); const before = snapshot(f.root);
  const completion = await guidedInit({ target: f.root, sourceRoot, cache: f.cache, alignment: { confirmed: true, instruction: 'user:fixture:preview-selected-guard-completion' } });
  assert.equal(completion.state, 'preview'); assert.equal(completion.plan!.operations.length, 0); assert.ok(completion.guardActivation); assert.deepEqual(snapshot(f.root), before);
  applyPlan(completion.plan!); assert.equal((await guidedInit({ target: f.root, sourceRoot, cache: f.cache })).state, 'already-initialized');
});

test('headless ambiguous scope returns structured choices without reading policy or creating caches', async () => {
  const f = fixture(); write(f.root, 'package.json', {}); write(f.root, 'apps/web/package.json', {}); const before = snapshot(f.root);
  const result = await guidedInit({ cwd: path.join(f.root, 'apps/web'), cache: f.cache, sourceRoot });
  assert.equal(result.state, 'input-required'); assert.equal(result.questions[0].id, 'scope'); assert.equal(result.plan, undefined); assert.deepEqual(snapshot(f.root), before); assert.equal(fs.existsSync(f.cache), false);
});

test('terminal scope selection can choose either observed root without broadening or writing', async () => {
  const f = fixture(); write(f.root, 'package.json', { workspaces: ['apps/*'] }); write(f.root, 'apps/web/package.json', { name: 'web' }); const cwd = path.join(f.root, 'apps/web'); const before = snapshot(f.root);
  for (const selected of [fs.realpathSync.native(f.root), fs.realpathSync.native(cwd)]) {
    let asked = 0;
    const result = await guidedInit({ cwd, sourceRoot, cache: f.cache, answers: complete(), ask: async prompt => { assert.match(prompt, /^Project scope is ambiguous/); asked++; return selected; } });
    assert.equal(asked, 1); assert.equal(result.state, 'preview'); assert.equal(result.root, selected); assert.equal(result.plan!.root, selected); assert.deepEqual(snapshot(f.root), before);
  }
  await assert.rejects(guidedInit({ cwd, sourceRoot, cache: f.cache, answers: complete(), ask: async () => f.directory }), /observed project boundary/);
  const explicit = await guidedInit({ cwd, target: cwd, sourceRoot, cache: f.cache, answers: complete(), ask: async () => { throw new Error('Explicit target must not ask about scope'); } }); assert.equal(explicit.root, fs.realpathSync.native(cwd)); assert.equal(fs.existsSync(f.cache), false); assert.deepEqual(snapshot(f.root), before);
});

test('sessions bind canonical target and input identity, clone answers and reject stale optimistic writes', () => {
  const f = fixture(); const answers = partial(); answers.answers['project.intent'] = 'Original intent'; saveDecisionSession(f.root, 'binding', answers, f.cache, null);
  const file = sessionFile(f.root, f.cache); const original = fs.readFileSync(file); const expected = crypto.createHash('sha256').update(original).digest('hex');
  const read = readDecisionSession(f.root, 'binding', f.cache)!; read.answers['project.intent'] = 'Detached edit'; assert.equal(readDecisionSession(f.root, 'binding', f.cache)!.answers['project.intent'], 'Original intent');
  assert.throws(() => readDecisionSession(f.root, 'changed-inputs', f.cache), /incompatible or stale/);
  const changed = partial(); changed.answers['project.intent'] = 'Other writer'; saveDecisionSession(f.root, 'binding', changed, f.cache); const before = snapshot(f.cache);
  assert.throws(() => saveDecisionSession(f.root, 'binding', answers, f.cache, expected), /changed while answers/); assert.deepEqual(snapshot(f.cache), before);
  const other = path.join(f.directory, 'other'); write(f.cache, path.basename(sessionFile(other, f.cache)), fs.readFileSync(file).toString('utf8')); assert.throws(() => readDecisionSession(other, 'binding', f.cache), /incompatible or stale/);
  assert.equal(fs.existsSync(f.root), false);
});

test('session locks and corrupt records refuse without stealing locks; explicit reset clears only this target', async () => {
  const f = fixture(); const file = sessionFile(f.root, f.cache); write(f.cache, path.basename(file), '{ corrupt'); write(f.cache, 'unrelated.json', 'preserve');
  assert.throws(() => readDecisionSession(f.root, 'binding', f.cache), /JSON/);
  write(f.cache, `${path.basename(file)}.lock`, 'uncertain owner'); const before = snapshot(f.cache);
  for (const operation of [() => readDecisionSession(f.root, 'binding', f.cache), () => saveDecisionSession(f.root, 'binding', partial(), f.cache), () => clearDecisionSession(f.root, f.cache)]) assert.throws(operation, /writer/);
  assert.deepEqual(snapshot(f.cache), before); fs.unlinkSync(`${file}.lock`);
  const result = await guidedInit({ target: f.root, cache: f.cache, sourceRoot, resetSession: true }); assert.equal(result.state, 'input-required'); assert.equal(fs.existsSync(file), false); assert.equal(fs.readFileSync(path.join(f.cache, 'unrelated.json'), 'utf8'), 'preserve'); assert.equal(fs.existsSync(f.root), false);
});

test('session cache cannot be placed inside an unaligned target', () => {
  const f = fixture(); assert.throws(() => saveDecisionSession(f.root, 'binding', partial(), path.join(f.root, 'cache')), /outside the selected target/); assert.equal(fs.existsSync(f.root), false);
});

test('same-version profile, artifact catalog and hidden policy changes invalidate interrupted sessions', async () => {
  for (const change of ['profile', 'artifacts', 'target']) {
    const f = fixture(); const source = path.join(f.directory, 'source'); minimalSource(source);
    const ask = async (prompt: string): Promise<string> => { if (prompt.startsWith('Use the selected')) return 'yes'; throw new Error('Fixture interruption'); };
    await assert.rejects(guidedInit({ target: f.root, sourceRoot: source, cache: f.cache, ask }), /Fixture interruption/);
    const file = sessionFile(f.root, f.cache); const saved = fs.readFileSync(file);
    if (change === 'profile') write(source, 'config/default.profile.json', { schemaVersion: 1, id: 'fixture', version: 1, documentation: { naming: { shape: 'typed', identifierCase: 'snake' } } });
    if (change === 'artifacts') fs.appendFileSync(path.join(source, 'config/artifacts.catalog.json'), ' ');
    if (change === 'target') write(f.root, '.stavel-config/stavel.config.json', { schemaVersion: 1, baseline: { id: 'fixture', version: 1, path: 'baseline.profile.json', sha256: crypto.createHash('sha256').update('{}').digest('hex') }, topics: {} });
    if (change === 'target') write(f.root, '.stavel-config/baseline.profile.json', '{}');
    const before = snapshot(f.root); await assert.rejects(guidedInit({ target: f.root, sourceRoot: source, cache: f.cache }), /incompatible or stale|schemaVersion/); assert.deepEqual(snapshot(f.root), before); assert.deepEqual(fs.readFileSync(file), saved);
  }
});

test('headless setup asks distinct product facts before alignment and generates nothing', async () => {
  const f = fixture(); const record = complete(); delete record.answers['product.audience']; delete record.answers['product.scope']; delete record.answers['product.outcomes']; record.alignment = { confirmed: false, instruction: '' }; const before = structuredClone(record);
  const result = await guidedInit({ target: f.root, sourceRoot, cache: f.cache, answers: record });
  assert.equal(result.state, 'input-required'); assert.deepEqual(result.questions.map(question => question.id).sort(), ['product.audience', 'product.outcomes', 'product.scope']); assert.equal(result.plan, undefined); assert.equal(fs.existsSync(f.root), false); assert.equal(fs.existsSync(f.cache), false); assert.deepEqual(record, before);
});

test('aligned defaults select the actual bootstrap mode and preview overview, story template and empty registry', async () => {
  const f = fixture(); const result = await guidedInit({ target: f.root, sourceRoot, cache: f.cache, answers: complete() });
  assert.equal(result.state, 'preview'); assert.equal(result.plan!.mode, 'bootstrap'); assert.equal(result.plan!.track, 'greenfield'); assert.equal(fs.existsSync(f.root), false);
  const overview = result.plan!.operations.find(operation => operation.path === 'docs/internal/product/product.overview.md')!;
  assert.ok(overview); assert.match(Buffer.from(overview.content!, 'base64').toString('utf8'), /Maintainers and contributors/);
  assert.ok(result.plan!.operations.some(operation => operation.path === 'docs/internal/templates/design/story.template.md'));
  const registry = result.plan!.operations.find(operation => operation.path === 'docs/internal/work-index.json')!; assert.deepEqual(JSON.parse(Buffer.from(registry.content!, 'base64').toString('utf8')), { schemaVersion: 2, capabilities: [] });
  const config = plannedRepositoryConfiguration(result.plan!, { schemaVersion: 1 }); assert.equal((config.documentation!.owners as Array<{ path: string }>)[0].path, 'docs/internal/product');
  applyPlan(result.plan!); assert.equal(fs.existsSync(path.join(f.root, overview.path)), true);
});

test('framework-home mapping reaches actual product owner, overview, template and registry paths', async () => {
  const f = fixture(); const result = await guidedInit({ target: f.root, sourceRoot, cache: f.cache, frameworkPath: 'engineering', answers: complete() });
  assert.equal(result.state, 'preview'); assert.ok(result.plan!.operations.some(operation => operation.path === 'engineering/product/product.overview.md')); assert.ok(result.plan!.operations.some(operation => operation.path === 'engineering/work-index.json'));
  assert.equal((result.config!.documentation!.owners as Array<{ path: string }>)[0].path, 'engineering/product'); assert.equal(result.config!.workflow!.stories!.template, 'engineering/templates/design/story.template.md'); assert.equal(fs.existsSync(f.root), false);
});

test('mapped canonical overview preserves existing bytes and does not ask for replacement product facts', async () => {
  const f = fixture(); const existing = '# Existing accepted product\n\nMaintain the original owner and scope.\n'; write(f.root, 'handbook/about.md', existing);
  const record = complete(); delete record.answers['product.audience']; delete record.answers['product.scope']; delete record.answers['product.outcomes'];
  record.configuration = { schemaVersion: 1, documentation: { owners: [{ id: 'existing-product', role: 'product', path: 'handbook', canonical: { 'artifact.product-overview': 'handbook/about.md' } }] } };
  const result = await guidedInit({ target: f.root, sourceRoot, cache: f.cache, answers: record });
  assert.equal(result.state, 'preview'); assert.equal(result.questions.length, 0); assert.equal(result.plan!.operations.some(operation => operation.path === 'handbook/about.md'), false); assert.equal(fs.readFileSync(path.join(f.root, 'handbook/about.md'), 'utf8'), existing);
});

test('repeated guided setup preserves verified companion routing evidence and original instructions', async () => {
  const f = fixture(); const instructions = '# Team instructions\n\nPreserve the accepted domain rules.\n'; write(f.root, 'AGENTS.md', instructions);
  const first = await guidedInit({ target: f.root, sourceRoot, cache: f.cache, answers: complete() }); applyPlan(first.plan!);
  const installed = fs.readFileSync(path.join(f.root, 'AGENTS.md'), 'utf8'); assert.ok(installed.startsWith(instructions.trimEnd())); assert.match(installed, /stavel:generated routing/);
  const manifest = JSON.parse(fs.readFileSync(path.join(f.root, '.stavel.json'), 'utf8')); assert.equal(manifest.integration_at_install, 'owned-routing-block'); assert.match(manifest.generatedBlocks['AGENTS.md#routing'], /^[a-f0-9]{64}$/);
  const repeated = await guidedInit({ target: f.root, sourceRoot, cache: f.cache, answers: complete() }); assert.equal(repeated.plan!.operations.length, 0); assert.equal(fs.readFileSync(path.join(f.root, 'AGENTS.md'), 'utf8'), installed);
  fs.writeFileSync(path.join(f.root, 'AGENTS.md'), installed.replace('Read the [development index]', 'Read changed [development index]')); const before = snapshot(f.root);
  await assert.rejects(guidedInit({ target: f.root, sourceRoot, cache: f.cache, answers: complete() }), /differing destination requires review/); assert.deepEqual(snapshot(f.root), before);
});

test('explicit directory selection retires an existing root only through selected migration mode', async () => {
  const f = fixture(); const rootSetup = await guidedInit({ target: f.root, sourceRoot, cache: f.cache, answers: complete(), configurationHome: 'root' }); applyPlan(rootSetup.plan!);
  const before = snapshot(f.root); await assert.rejects(guidedInit({ target: f.root, sourceRoot, cache: f.cache, answers: complete(), configurationHome: 'directory' }), /mode migrate/); assert.deepEqual(snapshot(f.root), before); assert.equal(fs.existsSync(path.join(f.root, '.stavel-config/stavel.config.json')), false);
  const aligned = complete(); aligned.answers['workflow.mode'] = 'migrate'; const migrated = await guidedInit({ target: f.root, sourceRoot, cache: f.cache, answers: aligned, configurationHome: 'directory' });
  assert.ok(migrated.plan!.operations.some(operation => operation.path === 'stavel.config.json' && operation.kind === 'delete')); applyPlan(migrated.plan!); assert.equal(fs.existsSync(path.join(f.root, 'stavel.config.json')), false); assert.equal(fs.existsSync(path.join(f.root, '.stavel-config/stavel.config.json')), true);
});

test('explicit mode and layout arguments reach the preview while conflicting supplied mode refuses', async () => {
  const f = fixture(); const record = complete(); const result = await guidedInit({ target: f.root, sourceRoot, cache: f.cache, answers: record, name: 'Guided fixture', mode: 'adopt', frameworkPath: 'engineering', configurationHome: 'root' });
  assert.equal(result.plan!.mode, 'adopt'); assert.ok(result.plan!.operations.some(operation => operation.path === 'stavel.config.json')); assert.ok(result.plan!.operations.some(operation => operation.path === 'engineering/product/product.overview.md')); assert.equal(result.plan!.operations.some(operation => operation.path === '.stavel-config/stavel.config.json'), false); assert.equal(fs.existsSync(f.root), false);
  record.answers['workflow.mode'] = 'bootstrap'; await assert.rejects(guidedInit({ target: f.root, sourceRoot, cache: f.cache, answers: record, mode: 'adopt' }), /--mode conflicts/); assert.equal(fs.existsSync(f.root), false);
});

test('saved sessions bind explicit name, mode, track, layout and upgrade flags even when marked aligned', async () => {
  const f = fixture(); const source = path.join(f.directory, 'source'); minimalSource(source); const bytes = fs.readFileSync(path.join(source, 'config/default.profile.json')); write(f.root, '.stavel-config/baseline.profile.json', bytes); write(f.root, '.stavel-config/stavel.config.json', { schemaVersion: 1, baseline: { id: 'fixture', version: 1, path: 'baseline.profile.json', sha256: crypto.createHash('sha256').update(bytes).digest('hex') }, topics: {} });
  await assert.rejects(guidedInit({ target: f.root, sourceRoot: source, cache: f.cache, mode: 'migrate', ask: async prompt => { if (prompt.startsWith('Use the selected')) return 'yes'; throw new Error('Fixture interruption'); } }), /Fixture interruption/);
  const file = sessionFile(f.root, f.cache); const saved = JSON.parse(fs.readFileSync(file, 'utf8')); saved.answers.alignment = { confirmed: true, instruction: 'fixture:prior-alignment-marker' }; fs.writeFileSync(file, JSON.stringify(saved)); const before = snapshot(f.root); const cached = fs.readFileSync(file);
  for (const flags of [{ name: 'Changed name' }, { mode: 'adopt' as const }, { track: 'existing' as const }, { frameworkPath: 'engineering' }, { configurationHome: 'root' as const }, { upgradeBaseline: true }]) {
    await assert.rejects(guidedInit({ target: f.root, sourceRoot: source, cache: f.cache, mode: 'migrate', ...flags }), /incompatible or stale/); assert.deepEqual(snapshot(f.root), before); assert.deepEqual(fs.readFileSync(file), cached);
  }
});

test('terminal gathering retains actual answers and shows product facts in recap before alignment', async () => {
  const f = fixture(); const prompts: string[] = []; const result = await guidedInit({ target: f.root, sourceRoot, cache: f.cache, ask: terminal(false, prompts) });
  assert.equal(result.state, 'input-required'); assert.equal(result.questions[0].id, 'alignment'); assert.equal(fs.existsSync(f.root), false);
  const recap = prompts.find(prompt => prompt.startsWith('Review these complete'))!; assert.match(recap, /product\.audience/); assert.match(recap, /Repository contributors/); assert.match(recap, /artifact.product-overview/);
  const saved = JSON.parse(fs.readFileSync(sessionFile(f.root, f.cache), 'utf8')); assert.equal(saved.answers.answers['product.scope'].value, 'The initial skill and CLI'); assert.equal(saved.answers.alignment.confirmed, false); assert.equal(saved.answers.configuration, undefined, 'packaged defaults were not cached as standing repository overrides');
  const resumed: string[] = []; const ready = await guidedInit({ target: f.root, sourceRoot, cache: f.cache, ask: terminal(true, resumed) }); assert.equal(ready.state, 'preview'); assert.equal(resumed.filter(prompt => prompt.startsWith('Review these complete')).length, 1); assert.equal(resumed.length, 1, 'answered decisions are not asked again'); assert.match(ready.plan!.alignment.instruction, /^terminal:accepted-recap:[a-f0-9]{64}$/);
});

test('silence cannot select defaults and target changes during recap refuse stale preview', async () => {
  const f = fixture(); await assert.rejects(guidedInit({ target: f.root, sourceRoot, cache: f.cache, ask: async () => '' }), /explicit yes or no/); assert.equal(fs.existsSync(f.root), false); assert.equal(fs.existsSync(f.cache), false);
  const reply = terminal(); await assert.rejects(guidedInit({ target: f.root, sourceRoot, cache: f.cache, ask: async prompt => { if (prompt.startsWith('Review these complete')) write(f.root, 'later-user-file.txt', 'User work during conversation'); return reply(prompt); } }), /changed during questions/);
  assert.deepEqual(Object.keys(snapshot(f.root)), ['later-user-file.txt']);
});
