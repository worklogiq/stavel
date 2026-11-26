import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

test('both public library formats execute optional source rules from bundled artifacts', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-package-'));
  fs.mkdirSync(path.join(root, 'src'));
  fs.writeFileSync(path.join(root, 'src', 'GoodName.service.ts'), 'export const item = 1;\n');
  const config = { documentation: { roots: [] }, source: {
    roots: ['src'], naming: { identifierCase: 'kebab' },
    scopes: { src: { naming: { identifierCase: 'pascal' } } },
  }, rules: { 'source-naming': true } };
  const requireArtifact = createRequire(path.resolve('package.json'));
  for (const entry of ['index', 'rules']) {
    const esm = await import(pathToFileURL(path.resolve(`dist/${entry}.js`)).href);
    const cjs = requireArtifact(path.resolve(`dist/${entry}.cjs`));
    for (const library of [esm, cjs]) {
      assert.equal((await library.checkPolicy({ root, config })).ok, true);
      fs.writeFileSync(path.join(root, 'src', 'bad_name.service.ts'), 'export const item = 1;\n');
      assert.equal((await library.checkPolicy({ root, config })).ok, false);
      fs.unlinkSync(path.join(root, 'src', 'bad_name.service.ts'));
    }
  }
});

test('packed package installs offline and exports its complete portable asset catalog', () => {
  const npmCli = process.env.npm_execpath;
  assert.ok(npmCli, 'Run the package checks through npm test.');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-offline-package-'));
  const run = (args: string[]): string => {
    const child = spawnSync(process.execPath, [npmCli, ...args], { encoding: 'utf8', cwd: process.cwd(), timeout: 120000 });
    assert.equal(child.status, 0, `${child.stdout}\n${child.stderr}`);
    return child.stdout;
  };
  const packed = JSON.parse(run(['pack', '--ignore-scripts', '--json', '--pack-destination', directory]))[0];
  assert.equal(packed.name, '@worklogiq/stavel');
  assert.equal(packed.version, '0.1.0');
  assert.equal(packed.files.some((file: { path: string }) => file.path === 'dist/constitutional-dev.cli.cjs' || file.path.startsWith('skills/constitutional-dev/')), false);
  const consumer = path.join(directory, 'consumer');
  run(['install', '--prefix', consumer, '--offline', '--ignore-scripts', '--no-audit', '--no-fund', path.join(directory, packed.filename)]);
  const cli = path.join(consumer, 'node_modules/@worklogiq/stavel/dist/stavel.cli.cjs');
  const output = path.join(directory, 'standalone-skill');
  const child = spawnSync(process.execPath, [cli, 'export-skill', '--output', output], { cwd: consumer, encoding: 'utf8', timeout: 30000 });
  assert.equal(child.status, 0, `${child.stdout}\n${child.stderr}`);
  assert.equal(fs.existsSync(path.join(output, 'assets/framework/examples/greenfield.example.md')), true);
  assert.equal(fs.existsSync(path.join(output, 'scripts/stavel.cli.cjs')), true);
  assert.equal(fs.existsSync(path.join(output, 'scripts/mdcomposer.cli.cjs')), true);
  assert.equal(fs.existsSync(path.join(output, 'scripts/THIRD-PARTY-NOTICES.txt')), true);
  assert.equal(JSON.parse(fs.readFileSync(path.join(output, 'assets/manifest.json'), 'utf8')).product, 'stavel');
  const requireConsumer = createRequire(path.join(consumer, 'package.json'));
  assert.deepEqual(requireConsumer('@worklogiq/stavel/package.json').bin, { stavel: 'dist/stavel.cli.cjs' });
  const library = requireConsumer('@worklogiq/stavel');
  assert.equal(typeof library.createPlan, 'function');
  assert.equal(typeof library.checkPolicy, 'function');
});
