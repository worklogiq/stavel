import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

export class Refused extends Error { constructor(message: string) { super(message); this.name = 'Refused'; } }
export const digest = (content: string | Uint8Array): string => crypto.createHash('sha256').update(content).digest('hex');
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b, 'en')).map(([key, item]) => [key, canonical(item)]));
  return value;
}
export const jsonText = (value: unknown): string => `${JSON.stringify(canonical(value), null, 2)}\n`;
export const posix = (value: string): string => value.replace(/\\/g, '/');

export function relativeName(value: string): string {
  if (typeof value !== 'string' || !value || value.includes('\0') || /[\r\n:]/.test(value) || path.win32.isAbsolute(value) || /^[\\/]/.test(value)) throw new Refused(`expected a contained relative path: ${value}`);
  const normalized = posix(value);
  const pieces = normalized.split('/');
  if (pieces.some(piece => !piece || piece === '.' || piece === '..')) throw new Refused(`expected a contained relative path: ${value}`);
  return pieces.join('/');
}

export function assertNoLinks(absolute: string): void {
  const parsed = path.parse(absolute);
  let current = parsed.root;
  const pieces = absolute.slice(parsed.root.length).split(path.sep).filter(Boolean);
  for (const [index, piece] of pieces.entries()) {
    current = path.join(current, piece);
    try {
      const stat = fs.lstatSync(current);
      if (stat.isSymbolicLink()) throw new Refused(`path passes through a symlink or junction: ${current}`);
      if (index < pieces.length - 1 && !stat.isDirectory()) throw new Refused(`parent is a file: ${current}`);
    }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return; throw error; }
  }
}

export function targetRoot(value: string): string {
  const expanded = value === '~' ? os.homedir() : /^~[\\/]/.test(value) ? path.join(os.homedir(), value.slice(2)) : value;
  const absolute = path.resolve(expanded);
  assertNoLinks(absolute);
  if (fs.existsSync(absolute) && !fs.statSync(absolute).isDirectory()) throw new Refused(`target is not a directory: ${absolute}`);
  return fs.existsSync(absolute) ? fs.realpathSync.native(absolute) : absolute;
}

export function contained(root: string, name: string): string {
  const relative = relativeName(name);
  const target = path.resolve(root, ...relative.split('/'));
  const relation = path.relative(root, target);
  if (relation === '..' || relation.startsWith(`..${path.sep}`) || path.isAbsolute(relation)) throw new Refused(`destination leaves target: ${name}`);
  assertNoLinks(target);
  let parent = path.dirname(target);
  while (parent !== root && parent !== path.dirname(parent)) {
    if (fs.existsSync(parent) && !fs.statSync(parent).isDirectory()) throw new Refused(`parent is a file: ${posix(path.relative(root, parent))}`);
    parent = path.dirname(parent);
  }
  return target;
}

export function fileBytes(root: string, name: string): Buffer | null {
  const target = contained(root, name);
  if (!fs.existsSync(target)) return null;
  if (!fs.statSync(target).isFile()) throw new Refused(`expected a file; destination is a directory: ${name}`);
  return fs.readFileSync(target);
}
export const fileHash = (root: string, name: string): string | null => { const bytes = fileBytes(root, name); return bytes === null ? null : digest(bytes); };

export function readJson<T>(file: string): T {
  try { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')) as T; }
  catch (error) { throw new Refused(`cannot read JSON ${file}: ${(error as Error).message}`); }
}

const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', '.generated', '.stavel', '.venv', '__pycache__', '.cache', 'coverage']);
export function walkFiles(root: string, relative = '', options: { includeHidden?: boolean } = {}): string[] {
  const directory = relative ? contained(root, relative) : root;
  if (!fs.existsSync(directory)) return [];
  if (!fs.statSync(directory).isDirectory()) throw new Refused(`expected directory: ${relative}`);
  const output: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    const name = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) throw new Refused(`source asset is a symlink or junction: ${name}`);
    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name) || (!options.includeHidden && entry.name.startsWith('.') && entry.name !== '.github')) continue;
      output.push(...walkFiles(root, name, options));
    } else if (entry.isFile()) output.push(name);
  }
  return output;
}

export function validateDestinations(paths: string[]): void {
  const seen = new Map<string, string>();
  for (const raw of paths) {
    const name = relativeName(raw);
    const key = name.normalize('NFC').toLowerCase();
    const previous = seen.get(key);
    if (previous && previous !== name) throw new Refused(`case-insensitive destination collision: ${previous} and ${name}`);
    if (previous === name) throw new Refused(`duplicate planned file: ${name}`);
    seen.set(key, name);
  }
  for (const [key, name] of seen) {
    let parent = path.posix.dirname(key);
    while (parent !== '.') {
      if (seen.has(parent)) throw new Refused(`planned file is parent of another planned file: ${seen.get(parent)} and ${name}`);
      parent = path.posix.dirname(parent);
    }
  }
}

export function writeExclusive(root: string, name: string, content: Buffer): void {
  const target = contained(root, name);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  assertNoLinks(target);
  fs.writeFileSync(target, content, { flag: 'wx' });
}
