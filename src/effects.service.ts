import type { Alignment, MigrationPlan, PlanOperation } from './framework.types.js';
import { digest, fileHash, jsonText, Refused, relativeName, targetRoot, validateDestinations } from './filesystem.service.js';
import { planDigest, validatePlan } from './planning.service.js';

export const AI_EFFECT_WARNING = 'AI-assisted migration or repair: the proposed changes involve nondeterministic agent judgment. Review the actual diff and verification; deterministic plan application does not prove the proposed changes are correct.';
export function effectProvenance(kind: 'deterministic' | 'agent-assisted' = 'deterministic', source?: string): NonNullable<MigrationPlan['execution']> {
  if (!['deterministic', 'agent-assisted'].includes(kind)) throw new Refused('unsupported execution provenance');
  if (kind === 'agent-assisted' && !source?.trim()) throw new Refused('AI-assisted changes require their actual instruction or review source');
  return { kind, ...(source ? { source } : {}), warnings: kind === 'agent-assisted' ? [AI_EFFECT_WARNING] : [] };
}
export function annotateEffects(plan: MigrationPlan, kind: 'deterministic' | 'agent-assisted', source?: string): MigrationPlan {
  validatePlan(plan);
  if (plan.execution?.kind === 'agent-assisted' && kind === 'deterministic') throw new Refused('AI-assisted provenance cannot be downgraded to deterministic');
  const copy = structuredClone(plan);
  copy.execution = effectProvenance(kind, source);
  copy.id = planDigest(copy);
  return copy;
}
export function bindPlanInputs(plan: MigrationPlan, inputs: Record<string, string | null>): MigrationPlan {
  validatePlan(plan); const result = structuredClone(plan);
  for (const [name, expected] of Object.entries(inputs)) {
    if (name in result.inputs && result.inputs[name] !== expected || fileHash(result.root, name) !== expected) throw new Refused(`configuration/source changed while preparing preview: ${name}`);
    result.inputs[name] = expected;
  }
  result.id = planDigest(result); return result;
}
export function mutationPlan(options: { root: string; alignment: Alignment; changes: Array<{ path: string; content: string | Buffer | null; reason: string }>; inputs?: Record<string, string | null>; kind?: 'deterministic' | 'agent-assisted'; source?: string; version?: string }): MigrationPlan {
  const root = targetRoot(options.root);
  if (!options.alignment?.confirmed || !options.alignment.instruction?.trim()) throw new Refused('mutation preview requires actual alignment');
  validateDestinations(options.changes.map(change => change.path));
  const inputs = { ...options.inputs };
  const operations: PlanOperation[] = [];
  for (const change of options.changes) {
    const name = relativeName(change.path), before = fileHash(root, name);
    if (name in inputs && inputs[name] !== before) throw new Refused(`stale input while preparing mutation: ${name}`);
    inputs[name] = before;
    const bytes = change.content === null ? null : Buffer.from(change.content);
    const after = bytes === null ? null : digest(bytes);
    if (before === after) continue;
    operations.push({ id: `op-${operations.length + 1}`, path: name, kind: bytes === null ? 'delete' : before === null ? 'create' : 'update', beforeHash: before, afterHash: after, ...(bytes ? { content: bytes.toString('base64'), encoding: 'base64' as const } : {}), reason: change.reason });
  }
  const plan: MigrationPlan = { product: 'stavel', schemaVersion: 2, id: '', root, frameworkVersion: options.version ?? '0.1.0', profileVersion: 'default@1', mode: 'migrate', track: 'existing', projectName: 'repository-maintenance', alignment: options.alignment, decisions: {}, inputs, operations, diagnostics: [], createdAt: new Date().toISOString(), execution: effectProvenance(options.kind, options.source) };
  plan.id = planDigest(plan);
  return plan;
}
