import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseMetadata } from '@worklogiq/mdcomposer';
import {
  applyPlan, checkRepository, createPlan, digest, documentFilename, exportSkill, getQuestions, inspectRepository,
  jsonText, markdownLinks, planDigest, relativeName, resumeMigration, rollbackMigration, rewriteMarkdownLinks,
  verifyPlan, type AnswersDocument, type MigrationPlan,
} from './index.js';

const projectRoot = process.cwd();
function write(root: string, name: string, contents: string | Uint8Array): void {
  const absolute = path.join(root, name); fs.mkdirSync(path.dirname(absolute), { recursive: true }); fs.writeFileSync(absolute, contents);
}
function snapshot(root: string): Record<string, string> {
  const output: Record<string, string> = {};
  if (!fs.existsSync(root)) return output;
  const visit = (directory: string, relative: string): void => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === '.stavel') continue;
      const name = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) visit(path.join(directory, entry.name), name);
      else if (entry.isFile()) output[name] = fs.readFileSync(path.join(directory, entry.name)).toString('base64');
    }
  };
  visit(root, ''); return output;
}
const metadata = (title: string, kind: string, text = ''): string => `# ${title}\n\n<!-- mdcomposer:meta\ntitle: ${JSON.stringify(title)}\nkind: ${kind}\nstate: draft\naudience: internal\nowner: test-maintainer\nupdated: 2026-11-25\n-->\n\n${text}`;
function fixture(): { directory: string; root: string; sourceRoot: string; answers: AnswersDocument } {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-node-'));
  const root = path.join(directory, 'project');
  const sourceRoot = path.join(directory, 'distribution');
  const entries = { index: 'docs/internal/index.md', constitution: 'docs/internal/process/development-constitution.policy.md', profile: 'docs/internal/dev/project-profile.overview.md' };
  const sources: Record<string, string> = {
    [entries.index]: '# Development framework\n\n[Constitution](./process/development-constitution.policy.md)\n[Profile template](./templates/project-profile.template.md)\n',
    [entries.constitution]: metadata('Development constitution', 'policy', '[Index](../index.md)\n\n## Preserve intent\n\nKeep required mechanisms.\n'),
    'docs/internal/dev/adoption.guide.md': metadata('Adoption', 'guide', '[Index](../index.md)\n'),
    'docs/internal/templates/agents.template.md': metadata('{{PROJECT_NAME}} instructions', 'template', '[Index]({{INDEX_PATH}})\n[Constitution]({{CONSTITUTION_PATH}})\n[Profile]({{PROFILE_PATH}})\n'),
    'docs/internal/templates/project-profile.template.md': metadata('{{PROJECT_NAME}} profile', 'template', 'Route: {{TRACK}}\n\nAcceptance: pending maintainer review.\n\n[Index]({{INDEX_PATH}})\n[Constitution]({{CONSTITUTION_PATH}})\n\n## Local choices\n\n{{DECISIONS_JSON}}\n'),
  };
  for (const [name, text] of Object.entries(sources)) write(sourceRoot, name, text);
  write(sourceRoot, 'config/assets.catalog.json', jsonText({ product: 'stavel', schemaVersion: 1, assets: Object.keys(sources).map(name => ({ source: name, target: name, role: name.includes('/templates/') ? 'template' : 'framework' })), entrypoints: entries, agentsTemplate: 'docs/internal/templates/agents.template.md', profileTemplate: 'docs/internal/templates/project-profile.template.md', skill: { source: 'skills/stavel' } }));
  write(sourceRoot, 'config/default.profile.json', jsonText({ schemaVersion: 1, id: 'default', version: 1, documentation: { roots: ['docs/internal'], naming: { shape: 'typed', identifierCase: 'kebab' }, kinds: ['policy', 'guide', 'overview', 'template', 'design', 'recon'], metadata: { requiredFields: ['title', 'kind', 'state', 'audience', 'owner', 'updated'] }, states: ['draft', 'accepted', 'active', 'complete', 'deprecated'] }, rules: { 'documentation-impact': false, 'source-naming': false } }));
  write(sourceRoot, 'config/decisions.catalog.json', jsonText({ schemaVersion: 1, questions: [
    { id: 'project.name', group: 'project', prompt: 'Name?', required: true, type: 'text' },
    { id: 'project.intent', group: 'project', prompt: 'Intent?', required: true, type: 'text' },
    { id: 'documentation.naming.style', group: 'documentation', prompt: 'Naming?', required: true, options: ['typed', 'camelCase', 'snake_case', 'kebab-case', 'PascalCase'], default: 'typed' },
    { id: 'documentation.naming.identifierCase', group: 'documentation', prompt: 'Case?', required: true, options: ['camel', 'snake', 'kebab', 'pascal', 'any'], default: 'kebab', applicability: { answer: 'documentation.naming.style', equals: 'typed' } },
  ] }));
  write(sourceRoot, 'VERSION', '0.1.0\n'); write(sourceRoot, 'LICENSE', 'MIT License\nCopyright example\n');
  write(sourceRoot, 'skills/stavel/SKILL.md', '---\nname: stavel\ndescription: Test skill\n---\n\n# Stavel\n\n[Framework](assets/framework/docs/internal/index.md)\n');
  const executable = path.join(projectRoot, 'dist/stavel.cli.cjs');
  if (fs.existsSync(executable)) write(sourceRoot, 'dist/stavel.cli.cjs', fs.readFileSync(executable));
  for (const name of fs.readdirSync(path.join(projectRoot, 'dist'))) if (name === 'mdcomposer.cli.cjs' || name.endsWith('.LEGAL.txt') || name === 'THIRD-PARTY-NOTICES.txt') write(sourceRoot, `dist/${name}`, fs.readFileSync(path.join(projectRoot, 'dist', name)));
  const answers: AnswersDocument = { answers: { 'project.name': 'Example', 'project.intent': 'A small verifiable fixture', 'documentation.naming.style': 'typed', 'documentation.naming.identifierCase': 'kebab' }, alignment: { confirmed: true, instruction: 'User requested adoption with these reviewed defaults.' }, useDefaults: true };
  return { directory, root, sourceRoot, answers };
}
const planFor = (f: ReturnType<typeof fixture>, overrides: Partial<Parameters<typeof createPlan>[0]> = {}): MigrationPlan => createPlan({ root: f.root, sourceRoot: f.sourceRoot, name: 'Example', track: 'existing', answers: f.answers, ...overrides });

test('discovery, questions, and dry-run do not create the target', () => {
  const f = fixture();
  assert.equal(inspectRepository({ root: f.root }).exists, false);
  assert.ok(getQuestions({ root: f.root, sourceRoot: f.sourceRoot }).unresolved.includes('project.intent'));
  applyPlan(planFor(f), { dryRun: true });
  assert.equal(fs.existsSync(f.root), false);
});

test('all three routes install and pass structural checking', async () => {
  const f = fixture();
  for (const track of ['greenfield', 'existing', 'research'] as const) {
    const root = path.join(f.directory, track); const plan = planFor(f, { root, track }); applyPlan(plan);
    const checked = await checkRepository({ root, sourceRoot: f.sourceRoot });
    assert.equal(checked.ok, true, jsonText(checked));
    assert.match(fs.readFileSync(path.join(root, 'docs/internal/dev/project-profile.overview.md'), 'utf8'), new RegExp(track));
  }
});

test('existing root instructions remain unchanged and companion requires real routing', async () => {
  const f = fixture(); const original = '# Existing instructions\nKeep product contracts.\n'; write(f.root, 'AGENTS.md', original); applyPlan(planFor(f));
  assert.equal(fs.readFileSync(path.join(f.root, 'AGENTS.md'), 'utf8'), original);
  assert.equal(fs.existsSync(path.join(f.root, 'stavel-agents.policy.md')), true);
  assert.equal((await checkRepository({ root: f.root, sourceRoot: f.sourceRoot })).ok, false);
  fs.appendFileSync(path.join(f.root, 'AGENTS.md'), '\n[index](docs/internal/index.md)\n[constitution](docs/internal/process/development-constitution.policy.md)\n');
  const checked = await checkRepository({ root: f.root, sourceRoot: f.sourceRoot }); assert.equal(checked.ok, true, jsonText(checked));
});

test('fenced or commented links do not establish root routing', async () => {
  for (const wrap of [(links: string) => `\`\`\`md\n${links}\n\`\`\``, (links: string) => `<!--\n${links}\n-->`]) {
    const f = fixture(); applyPlan(planFor(f));
    write(f.root, 'AGENTS.md', wrap('[index](docs/internal/index.md)\n[constitution](docs/internal/process/development-constitution.policy.md)'));
    assert.equal((await checkRepository({ root: f.root, sourceRoot: f.sourceRoot })).ok, false);
  }
});

test('an identical second installation is a no-op', () => {
  const f = fixture(); applyPlan(planFor(f)); const before = snapshot(f.root);
  const second = planFor(f); assert.equal(second.operations.length, 0); applyPlan(second); assert.deepEqual(snapshot(f.root), before);
});

test('differing files refuse the whole installation before any writes', () => {
  const f = fixture(); write(f.root, 'docs/internal/process/development-constitution.policy.md', 'local policy'); const before = snapshot(f.root);
  assert.throws(() => planFor(f), /differing destination/); assert.deepEqual(snapshot(f.root), before);
});

test('unsafe relative destinations and Windows drives are refused', () => {
  for (const name of ['../outside', 'C:/outside', '/outside', 'docs/../../outside', 'docs:stream', '\\outside', 'C:relative']) assert.throws(() => relativeName(name), /relative path/);
  const f = fixture(); assert.throws(() => planFor(f, { frameworkPath: '../outside' }), /relative path/); assert.equal(fs.existsSync(f.root), false);
});

test('parent-file and planned file/directory collisions preserve existing files', () => {
  const f = fixture(); write(f.root, 'docs', 'not a directory'); const before = snapshot(f.root);
  assert.throws(() => planFor(f), /parent is a file/); assert.deepEqual(snapshot(f.root), before);
  const other = fixture(); assert.throws(() => planFor(other, { frameworkPath: 'AGENTS.md' }), /planned file/); assert.equal(fs.existsSync(other.root), false);
});

test('adoption retains the upstream license', () => {
  const f = fixture(); applyPlan(planFor(f)); assert.deepEqual(fs.readFileSync(path.join(f.root, 'docs/internal/LICENSE')), fs.readFileSync(path.join(f.sourceRoot, 'LICENSE')));
});

test('symlink and junction destinations are refused without writing through them', () => {
  const f = fixture(); const outside = path.join(f.directory, 'outside'); fs.mkdirSync(outside); fs.mkdirSync(f.root);
  fs.symlinkSync(outside, path.join(f.root, 'docs'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => planFor(f), /symlink or junction/); assert.deepEqual(fs.readdirSync(outside), []); assert.equal(fs.existsSync(path.join(f.root, 'AGENTS.md')), false);
});

test('custom framework home remaps local links and conflicts with a different check home', async () => {
  const f = fixture(); applyPlan(planFor(f, { frameworkPath: 'engineering/process' }));
  const checked = await checkRepository({ root: f.root, sourceRoot: f.sourceRoot }); assert.equal(checked.ok, true, jsonText(checked));
  await assert.rejects(checkRepository({ root: f.root, sourceRoot: f.sourceRoot, frameworkPath: 'elsewhere' }), /conflicts/);
});

test('local profile customization is noted without rejecting acceptance', async () => {
  const f = fixture(); applyPlan(planFor(f)); fs.appendFileSync(path.join(f.root, 'docs/internal/dev/project-profile.overview.md'), '\nLocal owner: fixture.\n');
  const result = await checkRepository({ root: f.root, sourceRoot: f.sourceRoot }); assert.equal(result.ok, true, jsonText(result)); assert.ok(result.notes.some(note => note.includes('local profile customized')));
});

test('missing targets and heading fragments are detected', async () => {
  const f = fixture(); applyPlan(planFor(f)); write(f.root, 'docs/internal/note.overview.md', metadata('Note', 'overview', '[missing](absent.md)\n[heading](process/development-constitution.policy.md#does-not-exist)\n'));
  const result = await checkRepository({ root: f.root, sourceRoot: f.sourceRoot }); assert.equal(result.ok, false); assert.ok(result.diagnostics.some(item => item.message.includes('missing local link'))); assert.ok(result.diagnostics.some(item => item.message.includes('missing heading fragment')));
});

test('links with spaces, titles, images, references, and heading fragments work', () => {
  const f = fixture(); write(f.root, 'a file.md', '# Example heading\n'); write(f.root, 'image.png', 'fake');
  write(f.root, 'note.md', '[link](<a file.md#example-heading> "title")\n![image](image.png)\n[ref][target]\n\n[target]: <a file.md#example-heading>\n');
  assert.deepEqual(markdownLinks(f.root, 'note.md').diagnostics, []);
});

test('canonical path aliases do not produce false containment failures', () => {
  const f = fixture(); write(f.root, 'note.md', '# Note\n[self](#note)\n'); const alias = path.join(f.root, '..', path.basename(f.root)); assert.deepEqual(markdownLinks(alias, 'note.md').diagnostics, []);
});

test('unsafe and malformed manifests produce actionable refusal', async () => {
  const f = fixture(); applyPlan(planFor(f)); const file = path.join(f.root, '.stavel.json'); const good = JSON.parse(fs.readFileSync(file, 'utf8'));
  good.files['../outside'] = '0'.repeat(64); write(f.root, '.stavel.json', jsonText(good)); await assert.rejects(checkRepository({ root: f.root, sourceRoot: f.sourceRoot }), /relative path/);
  for (const text of ['not JSON', '[]', '{"format":1,"files":[]}']) { write(f.root, '.stavel.json', text); await assert.rejects(checkRepository({ root: f.root, sourceRoot: f.sourceRoot }), /manifest|JSON/); }
});

test('export dry-run does not create output; conflict preflight preserves it', () => {
  const f = fixture(); const output = path.join(f.directory, 'skill'); exportSkill({ output, sourceRoot: f.sourceRoot, dryRun: true }); assert.equal(fs.existsSync(output), false);
  write(output, 'LICENSE', 'local license'); const before = snapshot(output); assert.throws(() => exportSkill({ output, sourceRoot: f.sourceRoot }), /differing export/); assert.deepEqual(snapshot(output), before);
});

test('exported CLI works after relocation without source checkout or Python', () => {
  const f = fixture(); const output = path.join(f.directory, 'skill-source'); exportSkill({ output, sourceRoot: f.sourceRoot });
  const relocated = path.join(f.directory, 'relocated', 'stavel'); fs.mkdirSync(path.dirname(relocated)); fs.renameSync(output, relocated);
  const answersPath = path.join(f.directory, 'answers.json'); write(f.directory, 'answers.json', jsonText({ ...f.answers, answers: { ...f.answers.answers, 'project.name': 'Relocated' } }));
  const cli = path.join(relocated, 'scripts/stavel.cli.cjs');
  const result = spawnSync(process.execPath, [cli, 'init', '--target', f.root, '--name', 'Relocated', '--track', 'research', '--answers', answersPath], { cwd: f.directory, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const check = spawnSync(process.execPath, [cli, 'check', '--target', f.root], { cwd: f.directory, encoding: 'utf8' }); assert.equal(check.status, 0, check.stdout + check.stderr);
  const docsHelp = spawnSync(process.execPath, [cli, 'docs', '--help'], { cwd: f.directory, encoding: 'utf8' }); assert.equal(docsHelp.status, 0, docsHelp.stdout + docsHelp.stderr); assert.match(docsHelp.stdout, /mdcomposer/);
  assert.equal(fs.existsSync(path.join(relocated, 'assets/manifest.json')), true); assert.equal(fs.existsSync(path.join(relocated, 'scripts/framework.py')), false);
});

test('all applicable decisions and an actual alignment instruction are required', () => {
  const f = fixture(); assert.throws(() => planFor(f, { answers: { ...f.answers, alignment: { confirmed: false, instruction: '' } } }), /alignment/);
  assert.throws(() => planFor(f, { answers: { ...f.answers, useDefaults: false, answers: {} } }), /unresolved/); assert.equal(fs.existsSync(f.root), false);
});

test('document casing choices stay independent of source naming', () => {
  for (const [casing, expected] of [['camel', 'someFeature.design.md'], ['snake', 'some_feature.design.md'], ['kebab', 'some-feature.design.md'], ['pascal', 'SomeFeature.design.md']] as const) assert.equal(documentFilename('some-feature', 'design', { shape: 'typed', identifierCase: casing }), expected);
  const f = fixture(); write(f.root, 'src/ExistingClass.ts', 'export const value = 1;');
  f.answers.answers['documentation.naming.style'] = 'snake_case'; const plan = planFor(f, { mode: 'migrate' }); assert.equal(plan.operations.some(operation => operation.from === 'src/ExistingClass.ts'), false);
  assert.throws(() => planFor(f, { mode: 'migrate', answers: { ...f.answers, mappings: { 'src/ExistingClass.ts': 'src/new-name.ts' } } }), /cannot rename application source/);
});

test('stale plans and changed user work are refused before writing', () => {
  const f = fixture(); write(f.root, 'README.md', '# Existing\n'); const plan = planFor(f); write(f.root, 'README.md', '# Changed\n'); const before = snapshot(f.root);
  assert.throws(() => applyPlan(plan), /stale plan/); assert.deepEqual(snapshot(f.root), before);
});

test('migration rewrites inline/image/reference links while preserving code examples', () => {
  const text = '[doc](./old.md#heading)\n![image](./image.png)\n[reference][id]\n\n[id]: ./old.md#heading\n\n```md\n[example](./old.md)\n```\n';
  const rewritten = rewriteMarkdownLinks(text, 'docs/a.md', 'docs/new/a.md', { 'docs/old.md': 'docs/new/renamed.md' });
  assert.match(rewritten, /\.\/renamed\.md#heading/); assert.match(rewritten, /\.\.\/image\.png/); assert.match(rewritten, /\[id\]: \.\/renamed\.md#heading/); assert.match(rewritten, /\[example\]\(\.\/old\.md\)/);
});

test('partial migration resumes and rollback preserves the complete original content', () => {
  const f = fixture(); write(f.root, 'docs/OldName.design.md', '# Old design\n\nStatus: accepted for fixture task.\n\nRequired stages remain separate.\n'); write(f.root, 'README.md', '# Existing\n\n[design](docs/OldName.design.md)\n'); const before = snapshot(f.root);
  f.answers.acceptanceRecords = { 'docs/old-name.design.md': 'User accepted the fixture design in fixture-task-1.' };
  const plan = planFor(f, { mode: 'migrate' }); const journal = `.stavel/journals/${plan.id}.json`;
  assert.throws(() => applyPlan(plan, { failAfterOperations: 2 }), /earlier writes may remain/);
  resumeMigration({ root: f.root, journal }); assert.equal(verifyPlan(plan).ok, true);
  const migrated = fs.readFileSync(path.join(f.root, 'docs/old-name.design.md'), 'utf8'); assert.match(migrated, /Required stages remain separate/); assert.match(migrated, /state: accepted/);
  rollbackMigration({ root: f.root, journal }); assert.deepEqual(snapshot(f.root), before);
});

test('rollback refuses edits made after migration', () => {
  const f = fixture(); const plan = planFor(f); const result = applyPlan(plan); fs.appendFileSync(path.join(f.root, 'AGENTS.md'), '\nNew user instruction.\n'); const before = snapshot(f.root);
  assert.throws(() => rollbackMigration({ root: f.root, journal: result.journal! }), /user work changed/); assert.deepEqual(snapshot(f.root), before);
});

test('case collisions and archived-state inference are rejected', () => {
  const f = fixture(); write(f.root, 'docs/FooBar.design.md', '# A\n'); write(f.root, 'docs/foo-bar.design.md', '# Different\n'); assert.throws(() => planFor(f, { mode: 'migrate' }), /collision|differing migration/);
  const other = fixture(); write(other.root, 'docs/past.design.md', '# Past\n\nStatus: archived.\n'); assert.throws(() => planFor(other, { mode: 'migrate', answers: { ...other.answers, mappings: { 'docs/past.design.md': 'docs/_archive/past.design.md' } } }), /explicit meaningful state/);
});

test('serialized plan integrity is checked before apply', () => {
  const f = fixture(); const plan = planFor(f); const roundTrip = JSON.parse(jsonText(plan)); applyPlan(roundTrip, { dryRun: true });
  roundTrip.operations[0].content = Buffer.from('edited').toString('base64'); assert.throws(() => applyPlan(roundTrip), /checksum/);
});

test('case-only moves and rename cycles apply and roll back without losing content', () => {
  const f = fixture(); write(f.root, 'docs/Feature.design.md', metadata('Feature', 'design', 'Original feature body.'));
  const before = snapshot(f.root); const plan = planFor(f, { mode: 'migrate' }); const applied = applyPlan(plan);
  assert.equal(verifyPlan(plan).ok, true); assert.ok(fs.readdirSync(path.join(f.root, 'docs')).includes('feature.design.md'));
  rollbackMigration({ root: f.root, journal: applied.journal! }); assert.deepEqual(snapshot(f.root), before);
  const cycle = fixture(); write(cycle.root, 'docs/a.design.md', metadata('A', 'design', 'Original A.')); write(cycle.root, 'docs/b.design.md', metadata('B', 'design', 'Original B.'));
  const original = snapshot(cycle.root); cycle.answers.mappings = { 'docs/a.design.md': 'docs/b.design.md', 'docs/b.design.md': 'docs/a.design.md' };
  const migration = planFor(cycle, { mode: 'migrate' }); const result = applyPlan(migration);
  assert.match(fs.readFileSync(path.join(cycle.root, 'docs/b.design.md'), 'utf8'), /Original A/); assert.match(fs.readFileSync(path.join(cycle.root, 'docs/a.design.md'), 'utf8'), /Original B/);
  rollbackMigration({ root: cycle.root, journal: result.journal! }); assert.deepEqual(snapshot(cycle.root), original);
});

test('legacy approval claims require their actual record before conversion', () => {
  const f = fixture(); write(f.root, 'docs/Legacy.design.md', '# Legacy\n\nStatus: accepted.\n');
  assert.throws(() => planFor(f, { mode: 'migrate' }), /actual acceptance record/);
  const plan = planFor(f, { mode: 'migrate', answers: { ...f.answers, acceptanceRecords: { 'docs/legacy.design.md': 'docs/decisions/accepted-design.decision.md' } } });
  const content = Buffer.from(plan.operations.find(operation => operation.path === 'docs/legacy.design.md')!.content!, 'base64').toString('utf8');
  assert.match(content, /acceptance: "docs\/decisions\/accepted-design\.decision\.md"/); assert.doesNotMatch(content, /Preserved original declaration/);
});

test('previous product installations refuse discovery and generation before writes', async () => {
  for (const name of ['.constitutional-dev.json', 'constitutional-dev.config.json', '.constitutional-dev/journals/old.json', 'constitutional-dev-agents.policy.md', 'AGENTS.constitutional-dev.md']) {
    const f = fixture(); write(f.root, name, 'Original installation evidence.\n'); const before = snapshot(f.root);
    assert.throws(() => inspectRepository({ root: f.root }), /Constitutional Dev installation detected/);
    assert.throws(() => planFor(f), /Automatic legacy migration is not supported/);
    await assert.rejects(checkRepository({ root: f.root, sourceRoot: f.sourceRoot }), /clean restart/);
    assert.deepEqual(snapshot(f.root), before);
    assert.equal(fs.existsSync(path.join(f.root, '.stavel.json')), false);
    assert.equal(fs.existsSync(path.join(f.root, '.stavel')), false);
  }
});

test('legacy installations appearing after planning cannot be mixed into apply or recovery', () => {
  const f = fixture(); const plan = planFor(f); write(f.root, 'constitutional-dev.config.json', '{}\n'); const before = snapshot(f.root);
  assert.throws(() => applyPlan(plan), /Constitutional Dev installation detected/);
  assert.deepEqual(snapshot(f.root), before);
  const cli = path.join(projectRoot, 'dist/stavel.cli.cjs');
  const inspection = spawnSync(process.execPath, [cli, 'inspect', '--target', f.root], { encoding: 'utf8' });
  assert.equal(inspection.status, 1); assert.match(inspection.stderr, /clean restart/);
  const recovery = fixture(); const applied = applyPlan(planFor(recovery)); write(recovery.root, '.constitutional-dev.json', '{}\n'); const installed = snapshot(recovery.root);
  assert.throws(() => resumeMigration({ root: recovery.root, journal: applied.journal! }), /Constitutional Dev installation detected/);
  assert.throws(() => rollbackMigration({ root: recovery.root, journal: applied.journal! }), /Constitutional Dev installation detected/);
  assert.deepEqual(snapshot(recovery.root), installed);
});

test('manifest identity cannot be inferred from a renamed legacy file', async () => {
  for (const value of [{ format: 1 }, { format: 2 }, { product: 'constitutional-dev', format: 2 }]) {
    const f = fixture(); write(f.root, '.stavel.json', jsonText(value)); const before = snapshot(f.root);
    assert.throws(() => planFor(f), /unsupported Stavel manifest/);
    await assert.rejects(checkRepository({ root: f.root, sourceRoot: f.sourceRoot }), /product "stavel" and format 2/);
    assert.deepEqual(snapshot(f.root), before);
  }
});

test('plans and journals require Stavel identity even with a valid checksum', () => {
  const f = fixture(); const plan = planFor(f); assert.equal(plan.product, 'stavel');
  for (const identity of [undefined, 'constitutional-dev']) {
    const foreign = JSON.parse(jsonText(plan));
    if (identity === undefined) delete foreign.product; else foreign.product = identity;
    foreign.id = planDigest(foreign);
    assert.throws(() => applyPlan(foreign, { dryRun: true }), /unsupported plan product/);
    assert.throws(() => verifyPlan(foreign), /unsupported plan product/);
    assert.equal(fs.existsSync(f.root), false);
  }
  const applied = applyPlan(plan); const before = snapshot(f.root);
  const journalFile = path.join(f.root, applied.journal!); const journal = JSON.parse(fs.readFileSync(journalFile, 'utf8'));
  delete journal.plan.product; journal.plan.id = planDigest(journal.plan); fs.writeFileSync(journalFile, jsonText(journal));
  assert.throws(() => resumeMigration({ root: f.root, journal: applied.journal! }), /Legacy plans and journals are not supported/);
  assert.throws(() => rollbackMigration({ root: f.root, journal: applied.journal! }), /unsupported plan product/);
  assert.deepEqual(snapshot(f.root), before);
});

test('CLI exposes help and refuses missing alignment without creating target', () => {
  const f = fixture(); const cli = path.join(projectRoot, 'dist/stavel.cli.cjs');
  const help = spawnSync(process.execPath, [cli, '--help'], { encoding: 'utf8' }); assert.equal(help.status, 0); assert.match(help.stdout, /migrate rollback/);
  const refused = spawnSync(process.execPath, [cli, 'plan', '--target', f.root, '--name', 'Example', '--source-root', f.sourceRoot], { encoding: 'utf8' });
  assert.equal(refused.status, 1); assert.match(refused.stderr, /answers/); assert.equal(fs.existsSync(f.root), false);
});

test('aligned answers configure source languages and casing without renaming source', () => {
  const f = fixture(); const questionPath = path.join(f.sourceRoot, 'config/decisions.catalog.json');
  const catalog = JSON.parse(fs.readFileSync(questionPath, 'utf8')); catalog.questions.push({ id: 'source.languages', group: 'source', prompt: 'Languages?', required: true, type: 'list' }, { id: 'source.naming.identifierCase', group: 'source', prompt: 'Case?', required: true, options: ['snake', 'camel', 'kebab', 'pascal', 'any'] }, { id: 'project.owner', group: 'project', prompt: 'Owner?', type: 'text', required: true });
  fs.writeFileSync(questionPath, jsonText(catalog));
  write(f.root, 'src/ExistingModule.py', 'print("preserve source")\n');
  f.answers.answers = { ...f.answers.answers, 'source.languages': ['Python'], 'source.naming.identifierCase': 'snake', 'project.owner': 'Demo Maintainer' };
  const plan = planFor(f); const selected = JSON.parse(Buffer.from(plan.operations.find(operation => operation.path === 'stavel.config.json')!.content!, 'base64').toString('utf8'));
  assert.deepEqual(selected.source.languages, ['python']); assert.equal(selected.source.naming.identifierCase, 'snake');
  assert.equal(plan.operations.some(operation => operation.path.endsWith('.py')), false);
  const profile = Buffer.from(plan.operations.find(operation => operation.path === 'docs/internal/dev/project-profile.overview.md')!.content!, 'base64').toString('utf8');
  assert.match(profile, /audience: internal/);
  const generated = plan.decisions; assert.equal(generated['project.owner'], 'Demo Maintainer'); assert.equal(generated['workflow.mode'], 'adopt');
});

test('repository context and local profile retain the same selected project owner', () => {
  for (const owner of ['Demo Maintainer', 'Demo: "Maintainer"\nTeam']) {
    const f = fixture();
    addQuestions(f, [{ id: 'project.owner', group: 'project', prompt: 'Owner?', type: 'text', required: true }]);
    f.answers.answers['project.owner'] = owner;
    const template = path.join(f.sourceRoot, 'docs/internal/templates/project-profile.template.md');
    fs.writeFileSync(template, fs.readFileSync(template, 'utf8').replace('owner: test-maintainer', 'owner: "{{OWNER}}"'));
    const plan = planFor(f);
    const generatedMetadata = (name: string): Record<string, unknown> => parseMetadata(Buffer.from(plan.operations.find(operation => operation.path === name)!.content!, 'base64').toString('utf8')).data;
    assert.equal(generatedMetadata('docs/internal/dev/project-profile.overview.md').owner, owner);
    assert.equal(generatedMetadata('docs/internal/dev/repository-context.overview.md').owner, owner);
    assert.equal(plan.decisions['project.owner'], owner);
  }
  const fallback = fixture();
  const plan = planFor(fallback);
  const context = Buffer.from(plan.operations.find(operation => operation.path === 'docs/internal/dev/repository-context.overview.md')!.content!, 'base64').toString('utf8');
  assert.equal(parseMetadata(context).data.owner, 'project-maintainer');
});

test('migration ownership links follow renamed canonical documents and preserve metadata ownership', async () => {
  for (const selectedOwner of ['Demo: "Owner"\nTeam', undefined]) {
    const f = fixture();
    addQuestions(f, [{ id: 'project.owner', group: 'project', prompt: 'Owner?', type: 'text', required: true, default: 'Default Maintainer' }]);
    if (selectedOwner !== undefined) f.answers.answers['project.owner'] = selectedOwner;
    const expectedOwner = selectedOwner ?? 'Default Maintainer';
    const configuration = path.join(f.sourceRoot, 'config/default.profile.json');
    const profileConfig = JSON.parse(fs.readFileSync(configuration, 'utf8')); profileConfig.documentation.kinds.push('requirements'); fs.writeFileSync(configuration, jsonText(profileConfig));
    const template = path.join(f.sourceRoot, 'docs/internal/templates/project-profile.template.md');
    fs.appendFileSync(template, '\n## Canonical owners\n\n{{OWNERSHIP_LINKS}}\n');
    write(f.root, 'AGENTS.md', '# Existing instructions\nPreserve the required two stages.\n');
    write(f.root, 'docs/internal/project/normalize-inputs.requirements.md', '# Normalize inputs\n\nStatus: draft.\n\nPreserve the required two stages.\n');
    write(f.root, 'docs/internal/project/pinned-policy.requirements.md', metadata('Pinned policy', 'requirements', 'Existing owner remains authoritative.\n'));
    f.answers.answers['documentation.naming.identifierCase'] = 'camel';
    f.answers.ownership = { requirements: 'docs/internal/project/normalize-inputs.requirements.md' };
    const plan = planFor(f, { mode: 'migrate' }); applyPlan(plan);
    assert.equal(plan.decisions['project.owner'], expectedOwner);
    const manifest = JSON.parse(fs.readFileSync(path.join(f.root, '.stavel.json'), 'utf8'));
    const profile = fs.readFileSync(path.join(f.root, manifest.entrypoints.profile), 'utf8');
    const owned = markdownLinks(f.root, manifest.entrypoints.profile, profile);
    assert.ok(owned.targets.includes('docs/internal/project/normalizeInputs.requirements.md'));
    assert.deepEqual(owned.diagnostics, []);
    assert.equal(parseMetadata(fs.readFileSync(path.join(f.root, 'docs/internal/project/normalizeInputs.requirements.md'), 'utf8')).data.owner, expectedOwner);
    assert.equal(parseMetadata(fs.readFileSync(path.join(f.root, 'docs/internal/project/pinnedPolicy.requirements.md'), 'utf8')).data.owner, 'test-maintainer');
    fs.appendFileSync(path.join(f.root, 'AGENTS.md'), `\n[Index](${manifest.entrypoints.index})\n[Constitution](${manifest.entrypoints.constitution})\n`);
    const checked = await checkRepository({ root: f.root, sourceRoot: f.sourceRoot });
    assert.equal(checked.ok, true, jsonText(checked));
  }
});

test('unsupported answers, migration mappings during adoption, and conflicting identity refuse', () => {
  const f = fixture();
  assert.throws(() => planFor(f, { answers: { ...f.answers, mappings: { requirements: 'docs/requirements.design.md' } } }), /migration-only/);
  assert.throws(() => planFor(f, { answers: { ...f.answers, unexpected: true } as AnswersDocument }), /unsupported answers fields/);
  assert.throws(() => planFor(f, { name: 'Other project' }), /project.name/);
  assert.throws(() => planFor(f, { answers: { ...f.answers, answers: { ...f.answers.answers, 'workflow.mode': 'migrate' } } }), /workflow.mode/);
});

test('any identifier casing preserves existing styles while newly generated identifiers use a declared default', () => {
  const f = fixture(); write(f.root, 'docs/SomeFeature.design.md', metadata('Feature', 'design'));
  f.answers.answers['documentation.naming.identifierCase'] = 'any';
  const plan = planFor(f, { mode: 'migrate' }); assert.equal(plan.operations.some(operation => operation.from === 'docs/SomeFeature.design.md'), false);
  assert.equal(documentFilename('SomeFeature', 'design', { shape: 'typed', identifierCase: 'any', generatedIdentifierCase: 'snake' }), 'some_feature.design.md');
});

test('historical citations rebase against the generated context and follow migrated sources', async () => {
  const f = fixture(); write(f.root, 'docs/transform.requirements.md', '# Transform\n\n## Required stages\n\nKeep both stages.\n');
  f.answers.history = [{ topic: 'Required stages', observation: 'The owning requirements retain two stages.', status: 'observed', sources: ['docs/transform.requirements.md#required-stages', 'https://example.org/decision', 'git:0123456789abcdef'] }];
  const plan = planFor(f); applyPlan(plan);
  const context = fs.readFileSync(path.join(f.root, 'docs/internal/dev/repository-context.overview.md'), 'utf8');
  assert.match(context, /\.\.\/\.\.\/transform\.requirements\.md#required-stages/); assert.match(context, /https:\/\/example\.org\/decision/); assert.match(context, /git:0123456789abcdef/);
  const checked = await checkRepository({ root: f.root, sourceRoot: f.sourceRoot }); assert.equal(checked.ok, true, jsonText(checked));
  const migrated = fixture(); write(migrated.root, 'docs/OldSource.design.md', metadata('Old source', 'design'));
  migrated.answers.history = [{ topic: 'Legacy owner', observation: 'Original source retained.', sources: ['docs/OldSource.design.md'] }];
  const migration = planFor(migrated, { mode: 'migrate' }); const generated = Buffer.from(migration.operations.find(operation => operation.path === 'docs/internal/dev/repository-context.overview.md')!.content!, 'base64').toString('utf8');
  assert.match(generated, /\.\.\/\.\.\/old-source\.design\.md/);
});

test('untyped legacy documents need an explicit role mapping and required host names stay fixed', () => {
  const f = fixture(); write(f.root, 'docs/legacy.md', '# Legacy\n'); assert.throws(() => planFor(f, { mode: 'migrate' }), /explicit migration mapping/);
  write(f.root, 'AGENTS.md', '# Existing\n'); assert.throws(() => planFor(f, { mode: 'migrate', answers: { ...f.answers, mappings: { 'AGENTS.md': 'instructions.policy.md' } } }), /host-required/);
});

test('required project decisions cannot be deferred or bypassed with untyped confirmation', () => {
  const f = fixture();
  for (const status of ['deferred', 'not-applicable']) assert.throws(() => planFor(f, { answers: { ...f.answers, answers: { ...f.answers.answers, 'project.intent': { status } } } }), /unresolved/);
  assert.throws(() => planFor(f, { answers: { ...f.answers, alignment: { confirmed: 'false' as unknown as boolean, instruction: 'Not aligned.' } } }), /alignment/);
});

function addQuestions(f: ReturnType<typeof fixture>, questions: Array<Record<string, unknown>>): void {
  const file = path.join(f.sourceRoot, 'config/decisions.catalog.json'); const catalog = JSON.parse(fs.readFileSync(file, 'utf8')); catalog.questions.push(...questions); fs.writeFileSync(file, jsonText(catalog));
}

test('mapped taxonomy requires actual roots and owners and relocates executable policy scope', async () => {
  const f = fixture(); addQuestions(f, [{ id: 'documentation.taxonomy', prompt: 'Taxonomy?', group: 'documentation', type: 'choice', options: ['default', 'mapped'], required: true }]);
  f.answers.answers['documentation.taxonomy'] = 'mapped'; assert.throws(() => planFor(f), /unresolved/);
  write(f.root, 'docs/current.requirements.md', '# Current requirements\n'); f.answers.configuration = { schemaVersion: 1, documentation: { roots: ['handbook'] } }; f.answers.ownership = { requirements: 'docs/current.requirements.md' };
  const plan = planFor(f); applyPlan(plan); const check = await checkRepository({ root: f.root, sourceRoot: f.sourceRoot }); assert.equal(check.ok, true, jsonText(check));
  const configuration = JSON.parse(fs.readFileSync(path.join(f.root, 'stavel.config.json'), 'utf8')); assert.deepEqual(configuration.documentation.roots, ['handbook']);
  const constitution = path.join(f.root, 'handbook/process/development-constitution.policy.md'); assert.equal(fs.existsSync(constitution), true);
  fs.writeFileSync(constitution, fs.readFileSync(constitution, 'utf8').replace('state: draft', 'state: impossible'));
  assert.equal((await checkRepository({ root: f.root, sourceRoot: f.sourceRoot })).ok, false);
});

test('internal-only selection relocates public assets and changes publication metadata', async () => {
  const f = fixture(); addQuestions(f, [{ id: 'documentation.audiences', prompt: 'Audiences?', group: 'documentation', type: 'choice', options: ['internal', 'public-and-internal'], required: true }]);
  f.answers.answers['documentation.audiences'] = 'internal';
  const source = 'docs/public/install.guide.md'; write(f.sourceRoot, source, metadata('Install', 'guide').replace('audience: internal', 'audience: public'));
  const catalogFile = path.join(f.sourceRoot, 'config/assets.catalog.json'); const catalog = JSON.parse(fs.readFileSync(catalogFile, 'utf8')); catalog.assets.push({ source, target: source, role: 'documentation' }); fs.writeFileSync(catalogFile, jsonText(catalog));
  const plan = planFor(f); applyPlan(plan); assert.equal(fs.existsSync(path.join(f.root, 'docs/public')), false);
  const installed = fs.readFileSync(path.join(f.root, 'docs/internal/guides/install.guide.md'), 'utf8'); assert.match(installed, /audience: internal/);
  const checked = await checkRepository({ root: f.root, sourceRoot: f.sourceRoot }); assert.equal(checked.ok, true, jsonText(checked));
});

test('mapped lifecycle states are explicit and generic label conversions retain approval evidence', () => {
  const f = fixture(); addQuestions(f, [{ id: 'documentation.lifecycle', prompt: 'Lifecycle?', group: 'documentation', type: 'choice', options: ['default', 'mapped-legacy'], required: true }]);
  f.answers.answers['documentation.lifecycle'] = 'mapped-legacy'; assert.throws(() => planFor(f), /unresolved/);
  f.answers.configuration = { schemaVersion: 1, documentation: { states: ['draft', 'accepted', 'active', 'complete', 'deprecated', 'approved'] } }; f.answers.lifecycleMappings = { approved: 'accepted' };
  write(f.root, 'docs/Approval.design.md', '# Approval\n\nStatus: approved.\n'); assert.throws(() => planFor(f, { mode: 'migrate' }), /actual acceptance record/);
  f.answers.acceptanceRecords = { 'docs/approval.design.md': 'User accepted this design in decision 17.' };
  const plan = planFor(f, { mode: 'migrate' }); const document = Buffer.from(plan.operations.find(operation => operation.path === 'docs/approval.design.md')!.content!, 'base64').toString('utf8'); assert.match(document, /state: accepted/); assert.match(document, /decision 17/);
});

test('JavaScript tooling choices produce executable checks and ask for domain boundaries', async () => {
  const f = fixture(); addQuestions(f, [{ id: 'tooling.modules', prompt: 'Modules?', group: 'tooling', type: 'choice', options: ['markdown-defaults', 'markdown-and-javascript-typescript', 'custom'], required: true }]);
  f.answers.answers['tooling.modules'] = 'markdown-and-javascript-typescript';
  const questions = getQuestions({ root: f.root, sourceRoot: f.sourceRoot, answers: f.answers }); assert.ok(questions.unresolved.includes('configuration.rules.api-client-usage')); assert.throws(() => planFor(f), /unresolved/);
  f.answers.configuration = { schemaVersion: 1, source: { roots: ['src'], naming: { shape: 'typed', identifierCase: 'kebab' } }, rules: {
    'api-client-usage': { enabled: true, roots: ['src'], apiClientModule: '@example/api-client' },
    'api-error-codes': { enabled: false, reason: 'No backend API in this fixture.' },
    'frontend-i18n-copy': { enabled: false, reason: 'No UI in this fixture.' },
    'frontend-error-surfaces': { enabled: false, reason: 'No UI in this fixture.' },
  } };
  write(f.root, 'src/client.service.ts', 'export const load = () => fetch("/data");\n'); const plan = planFor(f); applyPlan(plan);
  const configuration = JSON.parse(fs.readFileSync(path.join(f.root, 'stavel.config.json'), 'utf8')); assert.equal(configuration.rules['source-naming'].enabled, true); assert.equal(configuration.rules['api-client-usage'].enabled, true);
  const checked = await checkRepository({ root: f.root, sourceRoot: f.sourceRoot }); assert.equal(checked.ok, false); assert.ok(checked.diagnostics.some(item => item.ruleId === 'api-client-usage'));
});

test('required single-choice answers reject arrays instead of recording an empty selection', () => {
  const f = fixture(); f.answers.answers['documentation.naming.style'] = [];
  assert.throws(() => planFor(f), /unresolved/);
});

test('migration rebases composition imports when their target moves and preserves fenced examples', async () => {
  const f = fixture();
  write(f.root, 'docs/internal/Shared.design.md', metadata('Shared', 'design', '## Keep\n\nRequired mechanism.\n'));
  write(f.root, 'docs/internal/consumer.design.md', metadata('Consumer', 'design', '<!-- @include(./Shared.design.md) -->\n\n```md\n<!-- @include(./Shared.design.md) -->\n```\n'));
  write(f.root, 'docs/internal/Overview.design.md', metadata('Overview', 'design', '<!-- @embed(./Shared.design.md#keep) -->\n'));
  const plan = planFor(f, { mode: 'migrate' });
  applyPlan(plan);
  const consumer = fs.readFileSync(path.join(f.root, 'docs/internal/consumer.design.md'), 'utf8');
  assert.match(consumer, /<!-- @include\(\.\/shared\.design\.md\) -->/);
  assert.match(consumer, /```md\n<!-- @include\(\.\/Shared\.design\.md\) -->\n```/);
  const overview = fs.readFileSync(path.join(f.root, 'docs/internal/overview.design.md'), 'utf8');
  assert.match(overview, /<!-- @embed\(\.\/shared\.design\.md#keep\) -->/);
  const checked = await checkRepository({ root: f.root, sourceRoot: f.sourceRoot });
  assert.equal(checked.ok, true, jsonText(checked));
});

test('blank text and invalid direct source scope configuration are refused', () => {
  const f = fixture(); f.answers.answers['project.intent'] = '   '; assert.throws(() => planFor(f), /unresolved/);
  f.answers.answers['project.intent'] = 'An explicit fixture outcome.';
  f.answers.configuration = { schemaVersion: 1, source: { scopes: { src: { naming: { identifierCase: 'unknown-case' } } } } };
  assert.throws(() => planFor(f), /unsupported casing/);
  f.answers.configuration = { schemaVersion: 1, source: { scopes: { src: { naming: { shape: 'plain', identifierCase: 'snake', allowedNames: ['index'] }, language: 'python' } } } };
  const plan = planFor(f); const config = JSON.parse(Buffer.from(plan.operations.find(operation => operation.path === 'stavel.config.json')!.content!, 'base64').toString('utf8'));
  assert.equal(config.source.scopes.src.naming.identifierCase, 'snake');
});


test('source catalogs must identify Stavel before planning or exporting', () => {
  for (const product of [undefined, 'constitutional-dev']) {
    const f = fixture(); const file = path.join(f.sourceRoot, 'config/assets.catalog.json');
    const catalog = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (product === undefined) delete catalog.product; else catalog.product = product;
    fs.writeFileSync(file, jsonText(catalog));
    assert.throws(() => planFor(f), /unsupported Stavel assets catalog/);
    const output = path.join(f.directory, 'foreign-export');
    assert.throws(() => exportSkill({ output, sourceRoot: f.sourceRoot }), /complete Stavel package/);
    assert.equal(fs.existsSync(f.root), false); assert.equal(fs.existsSync(output), false);
  }
});
