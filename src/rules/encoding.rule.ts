export interface EncodingFinding { code: string; line: number; column: number; match: string }

const patterns = [
  ['utf8-c2-prefix', /\u00C2[\u0080-\u00BF]?/gu],
  ['utf8-c3-prefix', /\u00C3[\u0080-\u00BF]?/gu],
  ['windows-1252-punctuation', /\u00E2(?:[\u0080-\u00BF\u201A-\u201E\u20AC\u2122]){1,4}/gu],
  ['visible-bom', /\u00EF\u00BB\u00BF/gu],
  ['replacement-character', /\uFFFD/gu],
  ['c1-control-character', /[\u0080-\u009F]/gu],
] as const;

export function findMojibakeInText(text: string): EncodingFinding[] {
  const findings: EncodingFinding[] = [];
  for (const [code, pattern] of patterns) {
    for (const match of text.matchAll(new RegExp(pattern.source, pattern.flags))) {
      const prefix = text.slice(0, match.index);
      findings.push({ code, line: prefix.split('\n').length, column: prefix.length - prefix.lastIndexOf('\n'), match: match[0] });
    }
  }
  return findings.sort((a, b) => a.line - b.line || a.column - b.column || a.code.localeCompare(b.code));
}
