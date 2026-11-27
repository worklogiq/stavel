#!/usr/bin/env node
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runGitHook } from './git-guard.service.js';

try {
  const hook = process.argv[2];
  if (hook !== 'pre-commit' && hook !== 'pre-push') throw new Error('expected pre-commit or pre-push adapter');
  runGitHook({ cwd: process.cwd(), hook, ...(hook === 'pre-push' ? { stdin: fs.readFileSync(0, 'utf8') } : {}), runtimePath: typeof __filename === 'string' ? __filename : fileURLToPath(import.meta.url) });
} catch (error) {
  process.stderr.write(`Refused: ${(error as Error).message}\n`);
  process.exitCode = 1;
}
