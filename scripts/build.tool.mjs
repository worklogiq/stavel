import { build } from 'esbuild';
import { mkdirSync, existsSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const markdownDependency = { name: 'markdown-commonjs', setup(builder) {
  builder.onResolve({ filter: /^@worklogiq\/mdcomposer$/ }, () => ({ path: require.resolve('@worklogiq/mdcomposer') }));
} };

mkdirSync('dist', { recursive: true });
const entries = [
  ['src/index.ts', 'dist/index'],
  ['src/rules/policy.service.ts', 'dist/rules'],
];
for (const [entry, output] of entries) {
  if (!existsSync(entry)) throw new Error(`Build entry is missing: ${entry}`);
  for (const format of ['esm', 'cjs']) {
    await build({ entryPoints: [entry], outfile: `${output}.${format === 'esm' ? 'js' : 'cjs'}`,
      bundle: true, platform: 'node', target: 'node20.19', format, sourcemap: true, plugins: [markdownDependency],
      define: format === 'cjs' ? { 'import.meta.url': 'undefined' } : undefined,
      banner: format === 'esm' ? { js: "import { createRequire as __createRequire } from 'node:module'; import { fileURLToPath as __fileURLToPath } from 'node:url'; import { dirname as __pathDirname } from 'node:path'; const __filename = __fileURLToPath(import.meta.url); const __dirname = __pathDirname(__filename); const require = __createRequire(__filename);" } : undefined });
  }
}
await build({ entryPoints: ['src/stavel.cli.ts'], outfile: 'dist/stavel.cli.cjs',
  bundle: true, platform: 'node', target: 'node20.19', format: 'cjs', sourcemap: true, plugins: [markdownDependency], define: { 'import.meta.url': 'undefined' } });
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json'], { stdio: 'inherit' });
const markdownDist = path.dirname(require.resolve('@worklogiq/mdcomposer'));
copyFileSync(path.join(markdownDist, 'mdcomposer.cli.cjs'), 'dist/mdcomposer.cli.cjs');
const markdownNotices = path.join(markdownDist, 'THIRD-PARTY-NOTICES.txt');
const typescriptLicense = require.resolve('typescript/LICENSE.txt');
const typescriptNotices = require.resolve('typescript/ThirdPartyNoticeText.txt');
const notices = 'Stavel bundles third-party software. Original licenses follow.\n\n'
  + (existsSync(markdownNotices) ? readFileSync(markdownNotices, 'utf8') : '')
  + '\n\nTypeScript (Microsoft Corporation), Apache License 2.0\n\n' + readFileSync(typescriptLicense, 'utf8')
  + '\n\nTypeScript third-party notices\n\n' + readFileSync(typescriptNotices, 'utf8');
writeFileSync('dist/THIRD-PARTY-NOTICES.txt', notices, 'utf8');
