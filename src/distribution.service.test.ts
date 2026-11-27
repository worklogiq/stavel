import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { locateDistribution } from './distribution.service.js';

const fixture = (): string => fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-distribution-contract-'));
function write(root: string, name: string, value: unknown): void {
  const destination = path.join(root, name);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, typeof value === 'string' ? value : JSON.stringify(value));
}
function seed(root: string): void {
  write(root, 'config/assets.catalog.json', { product: 'stavel', schemaVersion: 1, assets: [{ source: 'docs/example.guide.md', target: 'docs/example.guide.md', role: 'documentation' }] });
  write(root, 'config/default.profile.json', { schemaVersion: 1, id: 'fixture', version: 3 });
  write(root, 'config/decisions.catalog.json', { schemaVersion: 1, questions: [{ id: 'fixture.choice', prompt: 'Fixture choice?' }] });
  write(root, 'docs/example.guide.md', '# Fixture\n');
  write(root, 'VERSION', '  3.2.1\n');
}

test('distribution resolution loads an explicit valid source and prefers its trimmed VERSION', () => {
  const root = fixture(); seed(root); write(root, 'package.json', { version: '9.9.9' });
  const loaded = locateDistribution(root);
  assert.equal(loaded.root, fs.realpathSync.native(root));
  assert.equal(loaded.version, '3.2.1');
  assert.deepEqual(loaded.config, { schemaVersion: 1, id: 'fixture', version: 3 });
  assert.deepEqual(loaded.questions, [{ id: 'fixture.choice', prompt: 'Fixture choice?' }]);
  assert.equal(loaded.catalog.assets[0].target, 'docs/example.guide.md');
});

test('an explicit missing or incomplete source refuses instead of falling back to the checkout', () => {
  const root = fixture();
  assert.throws(() => locateDistribution(path.join(root, 'missing')), /framework assets are missing/);
  assert.equal(fs.existsSync(path.join(root, 'missing')), false);
  write(root, 'config/assets.catalog.json', { product: 'stavel', schemaVersion: 1, assets: [] });
  assert.throws(() => locateDistribution(root), /cannot read JSON.*default\.profile\.json/);
  assert.deepEqual(fs.readdirSync(path.join(root, 'config')), ['assets.catalog.json']);
});

test('unsupported catalog identity/schema and unsafe asset references are refused', () => {
  for (const override of [
    { product: 'other-product' }, { schemaVersion: 2 }, { assets: {} },
    { assets: [{ source: '../escape.md', target: 'docs/safe.md' }] },
    { assets: [{ source: 'docs/safe.md', target: 'C:\\outside.md' }] },
  ]) {
    const root = fixture(); seed(root);
    const catalog = JSON.parse(fs.readFileSync(path.join(root, 'config/assets.catalog.json'), 'utf8'));
    write(root, 'config/assets.catalog.json', { ...catalog, ...override });
    assert.throws(() => locateDistribution(root), /unsupported|contained relative path/);
  }
});

test('profile/question schemas and malformed JSON fail at the actual metadata boundary', () => {
  for (const name of ['config/default.profile.json', 'config/decisions.catalog.json']) {
    const root = fixture(); seed(root); write(root, name, { schemaVersion: 2 });
    assert.throws(() => locateDistribution(root), /unsupported profile or question catalog schema/);
    write(root, name, '{');
    assert.throws(() => locateDistribution(root), /cannot read JSON/);
  }
});

test('package version and legacy question collection remain supported without VERSION', () => {
  const root = fixture(); seed(root); fs.unlinkSync(path.join(root, 'VERSION'));
  write(root, 'package.json', { version: '2.4.6' });
  write(root, 'config/decisions.catalog.json', { schemaVersion: 1, decisions: [{ id: 'legacy.collection', prompt: 'Accepted collection shape' }] });
  const loaded = locateDistribution(root);
  assert.equal(loaded.version, '2.4.6');
  assert.deepEqual(loaded.questions, [{ id: 'legacy.collection', prompt: 'Accepted collection shape' }]);
});
