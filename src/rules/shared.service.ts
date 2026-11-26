import fs from 'node:fs';
import path from 'node:path';
import type { PolicyDiagnostic, RuleOptions } from './policy.types.js';

export const posix = (value: string): string => value.replace(/\\/g, '/');
export const inside = (root: string, target: string): boolean => {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative));
};

export function globToRegExp(glob: string): RegExp {
  const input = posix(glob);
  let pattern = '';
  for (let index = 0; index < input.length; index++) {
    if (input.slice(index, index + 3) === '**/') { pattern += '(?:.*/)?'; index += 2; }
    else if (input.slice(index, index + 2) === '**') { pattern += '.*'; index++; }
    else if (input[index] === '*') pattern += '[^/]*';
    else if (input[index] === '?') pattern += '[^/]';
    else pattern += input[index].replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
  }
  return new RegExp(`^${pattern}$`);
}

export const matchesAny = (file: string, globs: string[]): boolean => globs.some(glob => globToRegExp(glob).test(posix(file)));
const ignored = new Set(['.git', 'node_modules', 'dist', '.generated', '.cache', '.next', '.turbo', '.terraform', '.runs', 'coverage', 'scratch', 'vendor']);

export function collectFiles(root: string, roots: string[], exclusions: string[] = []): string[] {
  const result: string[] = [];
  const walk = (directory: string): void => {
    if (!inside(root, directory)) throw new Error(`Scan root leaves repository: ${directory}`);
    if (!fs.existsSync(directory)) return;
    const stat = fs.lstatSync(directory);
    if (stat.isSymbolicLink() || !inside(fs.realpathSync(root), fs.realpathSync(directory))) throw new Error(`Scan crosses a symlink or junction: ${directory}`);
    if (stat.isFile()) { result.push(directory); return; }
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (ignored.has(entry.name)) continue;
      const target = path.join(directory, entry.name);
      if (matchesAny(posix(path.relative(root, target)), exclusions)) continue;
      if (entry.isSymbolicLink()) throw new Error(`Scan crosses a symlink or junction: ${target}`);
      walk(target);
    }
  };
  for (const item of roots) walk(path.resolve(root, item));
  return [...new Set(result)].sort();
}

export function diagnostic(ruleId: string, file: string, message: string, options: RuleOptions = {}, line?: number): PolicyDiagnostic {
  return { ruleId, path: posix(file), message, severity: options.severity ?? 'error', ...(line ? { line } : {}) };
}

export function stringList(value: unknown, fallback: string[] = []): string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string') ? value : fallback;
}
