import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { effectiveHelp } from './help.service.js';

const sourceRoot = process.cwd(), roots: string[] = [];
const fixture = (): string => { const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-help-')); roots.push(root); return root; };
test.after(() => { for (const root of roots) fs.rmSync(root, { recursive: true, force: true }); });
function write(root: string, name: string, value: unknown): void { const file = path.join(root, name); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, typeof value === 'string' ? value : JSON.stringify(value)); }
function relocated(): string {
  const root = path.join(fixture(), 'assets', 'framework'); fs.mkdirSync(root, { recursive: true });
  fs.cpSync(path.join(sourceRoot, 'config'), path.join(root, 'config'), { recursive: true });
  for (const name of ['docs/internal/templates', 'docs/internal/process/prompts']) fs.cpSync(path.join(sourceRoot, name), path.join(root, name), { recursive: true });
  fs.copyFileSync(path.join(sourceRoot, 'VERSION'), path.join(root, 'VERSION'));
  return root;
}

test('general help works without target adoption and does not read even explicitly supplied invalid target policy', () => {
  const root = fixture(); write(root, 'stavel.config.json', '{ invalid');
  const result = effectiveHelp({ root, sourceRoot });
  assert.equal(result.contextual, false); assert.equal(result.configuration, undefined);
  assert.equal(result.conventions!.provenance.layer, 'packaged-baseline');
  assert.equal((result.conventions!.commits as { convention: string }).convention, 'conventional');
  assert.equal(result.modes.length, 9);
  assert(result.modes.some(mode => mode.name === 'IDEA' && mode.availability === 'available'));
  assert(result.commands.some(command => command.name === 'idea'));
  assert(result.commands.some(command => command.id === 'command.init' && command.availability === 'available'));
  assert.deepEqual(fs.readdirSync(root), ['stavel.config.json']);
});

test('shared help distinguishes CLI adoption plan, agent workflows and packet operations', () => {
  const result = effectiveHelp({ sourceRoot });
  assert.match(result.commands.find(command => command.name === 'plan')!.summary, /distinct from agent PLAN/);
  assert.deepEqual(result.commands.find(command => command.name === 'packet')!.subcommands, ['plan', 'migrate', 'read', 'update', 'close', 'archive', 'vibe']);
  assert(result.commands.find(command => command.name === 'packet')!.examples.some(example => example.includes('packet close')));
  assert(!result.commands.some(command => ['execute', 'design', 'strict'].includes(command.name)));
  assert.match(result.modes.find(mode => mode.name === 'EXECUTE')!.summary, /STRICT MODE automatically/);
  assert(result.modes.every(mode => mode.interface === 'agent' && mode.availability === 'available' && mode.prompt && mode.examples.length && mode.provenance.version));
  assert(result.notes.some(note => /nondeterministic/.test(note)));
});

test('contextual help explains effective settings and provenance without running configured application commands', () => {
  const root = fixture();
  write(root, 'package.json', { scripts: { test: 'node -e "require(\'fs\').writeFileSync(\'executed.txt\',\'bad\')"' } });
  write(root, 'stavel.config.json', { schemaVersion: 1, documentation: { naming: { shape: 'plain', identifierCase: 'snake' } }, testing: { placement: 'colocated', fallback: 'ask' }, workflow: { stories: { generation: 'never', template: 'custom.template.md' }, modes: ['EXPLORE', 'DESIGN', 'PLAN'] } });
  const result = effectiveHelp({ root, sourceRoot, contextual: true });
  assert.equal(result.configuration!.kind, 'legacy-root');
  assert.deepEqual(result.conventions!.naming, { shape: 'plain', identifierCase: 'snake' });
  assert.equal((result.conventions!.stories as { generation: string }).generation, 'never');
  assert.match(result.notes.join('\n'), /Effective story output policy: never/);
  assert.equal(result.modes.find(mode => mode.name === 'DESIGN')!.availability, 'available');
  assert.equal(result.modes.find(mode => mode.name === 'EXECUTE')!.availability, 'unavailable');
  assert.match(result.modes.find(mode => mode.name === 'EXECUTE')!.reason, /Excluded/);
  assert.equal(fs.existsSync(path.join(root, 'executed.txt')), false);
  assert.deepEqual(fs.readdirSync(root).sort(), ['package.json', 'stavel.config.json']);
});

test('contextual malformed policy and malformed mode vocabulary refuse rather than present defaults', () => {
  const root = fixture(); write(root, 'stavel.config.json', '{ invalid');
  assert.throws(() => effectiveHelp({ root, sourceRoot, contextual: true }), /cannot read JSON/);
  write(root, 'stavel.config.json', { schemaVersion: 1, workflow: { modes: { design: true } } });
  assert.throws(() => effectiveHelp({ root, sourceRoot, contextual: true }), /workflow.modes/);
  assert.deepEqual(fs.readdirSync(root), ['stavel.config.json']);
});

test('resolved artifact omissions/additions are visible with stable identity and truthful interface availability', () => {
  const root = fixture();
  write(root, 'stavel.config.json', { schemaVersion: 1, workflow: { definitions: { artifacts: { 'artifact.local': { id: 'artifact.local', family: 'design', title: 'Local review', kind: 'design', template: 'docs/internal/templates/design/design.template.md', surfaces: ['cli'], requiredFacts: ['title'], sections: [] } } }, amendments: [{ id: 'omit.backend', collection: 'artifacts', target: 'artifact.backend', action: 'omit', reason: 'No server surface in this package.', source: 'local decision' }], modes: ['explore', 'CUSTOM'] } });
  const result = effectiveHelp({ root, sourceRoot, contextual: true });
  assert.equal(result.artifacts.find(artifact => artifact.id === 'artifact.local')!.availability, 'available');
  assert.equal(result.artifacts.find(artifact => artifact.id === 'artifact.backend')!.availability, 'unavailable');
  assert.equal(result.artifacts.find(artifact => artifact.id === 'artifact.backend')!.provenance.source, 'local decision');
  assert.equal(result.modes.find(mode => mode.name === 'CUSTOM')!.availability, 'unavailable');
  assert(!result.commands.some(command => command.name === 'CUSTOM'));
});

test('relocated portable assets suffice without source checkout code or adopted target files', () => {
  const relocatedRoot = relocated(), target = fixture();
  const result = effectiveHelp({ sourceRoot: relocatedRoot, root: target, contextual: true });
  assert.equal(result.configuration!.kind, 'absent');
  assert.equal(result.artifacts.filter(artifact => artifact.availability === 'available').length, 23);
  assert(result.modes.every(mode => mode.availability === 'available'));
  assert.equal(fs.existsSync(path.join(relocatedRoot, 'src')), false);
  assert.equal(result.commands.find(command => command.name === 'export-skill')!.availability, 'unavailable');
  assert.deepEqual(fs.readdirSync(target), []);
});

test('missing portable prompt marks only affected agent workflow unavailable with actionable reason', () => {
  const root = relocated(); fs.unlinkSync(path.join(root, 'docs/internal/process/prompts/design.prompt.md'));
  const result = effectiveHelp({ sourceRoot: root });
  assert.equal(result.modes.find(mode => mode.name === 'DESIGN')!.availability, 'unavailable');
  assert.match(result.modes.find(mode => mode.name === 'DESIGN')!.reason, /missing or empty/);
  assert.equal(result.modes.find(mode => mode.name === 'EXPLORE')!.availability, 'available');
});

test('missing artifact template reports unavailable artifact commands while preserving usable general help', () => {
  const root = relocated(); fs.unlinkSync(path.join(root, 'docs/internal/templates/design/backend-design.template.md'));
  const result = effectiveHelp({ sourceRoot: root });
  assert.equal(result.commands.find(command => command.name === 'artifacts')!.availability, 'unavailable');
  assert.equal(result.commands.find(command => command.name === 'help')!.availability, 'available');
  assert(result.notes.some(note => /Artifact catalog unavailable/.test(note)));
});
