import path from 'node:path';
import fs from 'node:fs';
import { extractMarkdownLinks, headingSlugs as markdownHeadingSlugs, rebaseMarkdownLinks } from '@worklogiq/mdcomposer';
import { contained, posix, Refused } from './filesystem.service.js';
import type { Diagnostic } from './framework.types.js';

export function headingSlugs(text: string): Set<string> { return markdownHeadingSlugs(text); }

function localDestination(destination: string, source: string): { target: string; suffix: string } | null {
  if (/^[a-z][a-z0-9+.-]*:/i.test(destination) || destination.startsWith('//') || /\{\{[A-Z_]+\}\}/.test(destination)) return null;
  const boundary = destination.search(/[?#]/);
  const rawPath = boundary < 0 ? destination : destination.slice(0, boundary);
  const suffix = boundary < 0 ? '' : destination.slice(boundary);
  let decoded: string;
  try { decoded = decodeURIComponent(rawPath).replace(/\\([()])/g, '$1'); } catch { throw new Refused(`invalid encoded Markdown link: ${destination}`); }
  const target = !decoded ? source : decoded.startsWith('/') ? path.posix.normalize(decoded.slice(1)) : path.posix.normalize(path.posix.join(path.posix.dirname(source), decoded));
  return { target, suffix };
}

export function rewriteMarkdownLinks(text: string, oldName: string, newName: string, mapping: Record<string, string>): string {
  if (oldName === newName && !/<!--\s*@(include|embed)\(/.test(text) && !extractMarkdownLinks(text).some(link => { const target = localDestination(link.destination, oldName); return target && mapping[target.target] && mapping[target.target] !== target.target; })) return text;
  const virtualRoot = path.resolve('/__stavel-markdown__');
  const targets = Object.fromEntries(Object.entries(mapping).map(([from, to]) => [path.resolve(virtualRoot, from), path.resolve(virtualRoot, to)]));
  return rebaseMarkdownLinks(text, path.resolve(virtualRoot, oldName), path.resolve(virtualRoot, newName), virtualRoot, targets);
}

export function markdownLinks(root: string, name: string, text?: string): { targets: string[]; diagnostics: Diagnostic[] } {
  const content = text ?? fs.readFileSync(contained(root, name), 'utf8').replace(/^\uFEFF/, '');
  const diagnostics: Diagnostic[] = [];
  const targets = new Set<string>();
  const seen = new Set<string>();
  for (const link of extractMarkdownLinks(content)) {
    const key = `${link.line}:${link.destination}:${link.unresolvedReference ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (link.unresolvedReference) { diagnostics.push({ ruleId: 'markdown-links', severity: 'error', path: name, line: link.line, message: `reference link has no matching definition: ${link.unresolvedReference}` }); continue; }
    try {
      const destination = localDestination(link.destination, name);
      if (!destination) continue;
      const absolute = contained(root, destination.target);
      if (!fs.existsSync(absolute)) { diagnostics.push({ ruleId: 'markdown-links', severity: 'error', path: name, line: link.line, message: `missing local link: ${link.destination}` }); continue; }
      targets.add(posix(path.relative(root, absolute)));
      const fragment = destination.suffix.match(/#(.*)$/)?.[1];
      if (fragment && fs.statSync(absolute).isFile() && absolute.toLowerCase().endsWith('.md') && !headingSlugs(fs.readFileSync(absolute, 'utf8')).has(decodeURIComponent(fragment))) diagnostics.push({ ruleId: 'markdown-fragments', severity: 'error', path: name, line: link.line, message: `missing heading fragment: ${link.destination}` });
    } catch (error) { diagnostics.push({ ruleId: 'markdown-links', severity: 'error', path: name, line: link.line, message: `local link leaves repository or is unsafe: ${link.destination}: ${(error as Error).message}` }); }
  }
  return { targets: [...targets], diagnostics };
}
