import { build } from 'esbuild';
import { readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const markdownDependency = { name: 'markdown-commonjs', setup(builder) {
  builder.onResolve({ filter: /^@worklogiq\/mdcomposer$/ }, () => ({ path: require.resolve('@worklogiq/mdcomposer') }));
} };

const ignored = new Set(['.git', 'node_modules', 'dist', '.generated', '.cache', '.venv', 'coverage']);
const walk = (directory) => readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en')).flatMap(entry => {
  if (entry.isSymbolicLink() || ignored.has(entry.name)) return [];
  const name = join(directory, entry.name);
  return entry.isDirectory() ? walk(name) : entry.isFile() && name.endsWith('.test.ts') ? [name] : [];
});
const sources = walk('.');
if (sources.length === 0) throw new Error('No Node tests were found.');
mkdirSync('.generated/tests', { recursive: true });
const outputs = [];
for (const [index, source] of sources.entries()) {
  const outfile = `.generated/tests/${index}-${source.split(/[\\/]/).at(-1).replace(/\.ts$/, '.cjs')}`;
  await build({ entryPoints: [source], outfile, bundle: true, platform: 'node', target: 'node20.19', format: 'cjs', plugins: [markdownDependency], define: { 'import.meta.url': 'undefined' } });
  outputs.push(outfile);
}
const result = spawnSync(process.execPath, ['--test', ...outputs], { stdio: 'inherit' });
process.exitCode = result.status ?? 1;
