import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import type { Alignment, FrameworkConfig, MigrationPlan } from './framework.types.js';
import { assertNoLinks, contained, digest, fileBytes, fileHash, jsonText, Refused, relativeName, targetRoot } from './filesystem.service.js';
import { directoryConfigurationFiles, resolveRepositoryConfiguration } from './configuration.service.js';
import { mutationPlan } from './effects.service.js';
import { planDigest } from './planning.service.js';
import { locateDistribution } from './distribution.service.js';
import defaultProfile from '../config/default.profile.json' with { type: 'json' };
import artifactCatalog from '../config/artifacts.catalog.json' with { type: 'json' };
import decisionCatalog from '../config/decisions.catalog.json' with { type: 'json' };

export interface GitProtectionPolicy { state: 'absent' | 'disabled' | 'enabled'; enabled: boolean; protectedBranches: string[]; hooksPath: string }
export interface GitGuardIssue { code: string; message: string; repairable: boolean }
export interface GitGuardInspection {
  root: string; policy: GitProtectionPolicy; state: 'not-selected' | 'disabled' | 'pending-git' | 'unsupported' | 'conflict' | 'incomplete' | 'ready';
  ready: boolean; active: boolean; repairable: boolean; issues: GitGuardIssue[]; inputs: Record<string, string | null>;
  git: { state: 'ordinary' | 'non-git' | 'bare' | 'worktree' | 'unsupported'; configPath?: '.git/config'; configHash?: string; effectiveHooksPath?: string | null };
  assets: Array<{ path: string; expectedHash: string; currentHash: string | null; owned: boolean }>; bundlePath?: string;
  controls?: { local: 'inherit' | 'enabled' | 'disabled'; effectiveEnabled: boolean; commandAllow?: boolean };
}
export interface GitGuardActivation {
  schemaVersion: 1; kind: 'stavel-git-guard-activation'; id: string; root: string; hooksPath: string; gitConfigPath: '.git/config'; beforeConfigHash: string;
  policyHash: string; inputs: Record<string, string | null>; assets: Array<{ path: string; sha256: string; created: boolean; executable: boolean }>;
}
export interface GitGuardInstallPlan { assets: MigrationPlan; activation?: GitGuardActivation; inspection: GitGuardInspection }
export interface GitGuardActivationResult { ok: true; state: 'active' | 'rolled-back' | 'not-activated'; changed: boolean; journal?: string; dryRun?: boolean }
interface OwnedManifest { schemaVersion: 1; product: 'stavel-git-guard'; hooksPath: string; files: Record<string, string>; controlsVersion?: 1 }
interface Receipt { schemaVersion: 1; kind: 'stavel-git-guard-receipt'; checksum: string; activation: GitGuardActivation; beforeConfig: string; afterConfig: string; modes: Array<{ path: string; before: number; after: number }> }
const writerLock = '.stavel/runtime/writer.lock';
const recoveryLock = '.stavel/runtime/git-guard-recovery.lock';
const plain = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const isHash = (value: unknown): value is string => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const meaningful = (value: unknown): value is string => typeof value === 'string' && !!value.trim();
const names = ['pre-commit', 'pre-push', 'stavel.git-hook.cjs'] as const;

function bundledDefinitions() {
  const questions: Record<string, any> = {};
  for (const [stage, catalog] of [['adoption', decisionCatalog], ['artifact', artifactCatalog]] as const) for (const candidate of catalog.questions ?? []) {
    const record = candidate as unknown as Record<string, unknown>, id = String(record.id);
    if (questions[id]) throw new Refused(`duplicate bundled configuration definition: ${id}`);
    questions[id] = { ...record, version: record.version ?? 1, questionStage: stage, ...(stage === 'adoption' ? { required: record.required !== false } : {}) };
  }
  return { artifacts: Object.fromEntries(artifactCatalog.artifacts.map(item => [item.id, { ...item, version: item.version ?? 1 }])), sections: Object.fromEntries(artifactCatalog.sections.map(item => [item.id, { ...item, version: item.version ?? 1 }])), questions };
}
function currentConfiguration(root: string) {
  return resolveRepositoryConfiguration({ root, packagedBaseline: defaultProfile as unknown as FrameworkConfig, packagedDefinitions: bundledDefinitions() });
}
export function gitProtectionPolicy(config: FrameworkConfig): GitProtectionPolicy {
  const raw = config.workflow?.gitProtection;
  if (raw === undefined) return { state: 'absent', enabled: false, protectedBranches: [], hooksPath: '.stavel-hooks' };
  if (!plain(raw) || Object.keys(raw).some(key => !['enabled', 'protectedBranches', 'hooksPath'].includes(key)) || typeof raw.enabled !== 'boolean') throw new Refused('workflow.gitProtection needs enabled, protectedBranches and a contained hooksPath; unknown fields require explicit mapping');
  const branches = raw.protectedBranches ?? (raw.enabled ? undefined : []);
  if (!Array.isArray(branches) || raw.enabled && !branches.length || branches.some(name => !meaningful(name) || name === '@' || name.startsWith('refs/') || /[\x00-\x20\x7f~^:?*\[\\]/.test(name) || name.includes('..') || name.includes('@{') || name.includes('//') || name.startsWith('/') || name.endsWith('/') || name.endsWith('.') || name.split('/').some(part => part.startsWith('.') || part.endsWith('.lock'))) || new Set(branches).size !== branches.length) throw new Refused('gitProtection.protectedBranches must contain distinct exact Git branch identities (not patterns or refs)');
  const hooksPath = relativeName(typeof raw.hooksPath === 'string' ? raw.hooksPath : '.stavel-hooks');
  const reserved = hooksPath.toLowerCase();
  if (/[\x00-\x1f\x7f]/.test(hooksPath) || reserved === '.git' || reserved.startsWith('.git/') || reserved === '.stavel/runtime' || reserved.startsWith('.stavel/runtime/')) throw new Refused('gitProtection.hooksPath must be a dedicated contained repository directory outside Git/runtime state');
  return { state: raw.enabled ? 'enabled' : 'disabled', enabled: raw.enabled, protectedBranches: [...branches], hooksPath };
}
function git(root: string, args: string[], allowFailure = false): { status: number; stdout: string; stderr: string } {
  const result = spawnSync('git', ['-C', root, ...args], { encoding: 'utf8', shell: false, windowsHide: true, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } });
  const output = { status: result.status ?? 1, stdout: result.stdout ?? '', stderr: result.stderr ?? result.error?.message ?? '' };
  if (!allowFailure && output.status !== 0) throw new Refused(`cannot inspect Git ${args[0]}: ${output.stderr.trim() || 'Git is unavailable'}`);
  return output;
}
function gitFacts(root: string): GitGuardInspection['git'] {
  if (!fs.existsSync(root)) return { state: 'non-git' };
  const bare = git(root, ['rev-parse', '--is-bare-repository'], true);
  if (bare.status !== 0) return { state: 'non-git' };
  if (bare.stdout.trim() === 'true') return { state: 'bare' };
  const gitDirectory = path.resolve(root, git(root, ['rev-parse', '--git-dir']).stdout.trim());
  const common = path.resolve(root, git(root, ['rev-parse', '--git-common-dir']).stdout.trim());
  const top = targetRoot(git(root, ['rev-parse', '--show-toplevel']).stdout.trim());
  const marker = contained(root, '.git');
  if (gitDirectory !== common || fs.existsSync(marker) && !fs.statSync(marker).isDirectory()) return { state: 'worktree' };
  if (top !== root || gitDirectory !== marker || common !== marker) return { state: 'unsupported' };
  const active = git(root, ['config', '--get', 'core.hooksPath'], true);
  if (![0, 1].includes(active.status)) throw new Refused('cannot inspect effective core.hooksPath');
  return { state: 'ordinary', configPath: '.git/config', configHash: fileHash(root, '.git/config') ?? undefined, effectiveHooksPath: active.status === 0 ? active.stdout.replace(/\r?\n$/, '') : null };
}
function launcher(hook: 'pre-commit' | 'pre-push'): string {
  return `#!/bin/sh\n# Stavel-owned guard adapter; do not bypass a refusal.\ncommand -v node >/dev/null 2>&1 || { printf '%s\\n' 'Stavel refused: Node runtime is missing; restore Node before Git actions.' >&2; exit 1; }\nhook_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd) || exit 1\nexec node "$hook_dir/stavel.git-hook.cjs" ${hook} "$@"\n`;
}
function owned(root: string, hooksPath: string): OwnedManifest | undefined {
  const bytes = fileBytes(root, `${hooksPath}/ownership.json`); if (!bytes) return undefined;
  let value: OwnedManifest; try { value = JSON.parse(bytes.toString('utf8')); } catch { throw new Refused('guard ownership record is invalid JSON; preserve it and review integration'); }
  if (!plain(value) || value.schemaVersion !== 1 || value.product !== 'stavel-git-guard' || value.hooksPath !== hooksPath || !plain(value.files) || Object.keys(value.files).sort().join('|') !== [...names].sort().join('|') || Object.values(value.files).some(hash => !isHash(hash))) throw new Refused('unsupported guard ownership record');
  for (const hook of ['pre-commit', 'pre-push'] as const) if (value.files[hook] !== digest(launcher(hook))) throw new Refused('owned guard adapter format is unsupported; no automatic replacement is permitted');
  return value;
}
function bundle(options: { root: string; sourceRoot?: string; bundlePath?: string }): { path?: string; bytes?: Buffer } {
  let candidate = options.bundlePath;
  if (!candidate) { try { candidate = path.join(locateDistribution(options.sourceRoot).root, 'dist/stavel.git-hook.cjs'); } catch { return {}; } }
  const absolute = path.resolve(candidate); assertNoLinks(absolute);
  return fs.existsSync(absolute) && fs.statSync(absolute).isFile() ? { path: absolute, bytes: fs.readFileSync(absolute) } : {};
}
function directoryEntries(root: string, relative: string): string[] {
  const absolute = contained(root, relative); if (!fs.existsSync(absolute)) return [];
  if (!fs.statSync(absolute).isDirectory()) throw new Refused(`expected hook directory: ${relative}`);
  return fs.readdirSync(absolute).sort();
}
function sameHookPath(root: string, value: string | null | undefined, selected: string): boolean { return value != null && path.resolve(root, value) === contained(root, selected); }
function executable(root: string, filename: string): boolean { if (process.platform === 'win32') return true; try { fs.accessSync(contained(root, filename), fs.constants.X_OK); return true; } catch { return false; } }

export function inspectGitGuards(options: { root: string; config?: FrameworkConfig; sourceRoot?: string; bundlePath?: string }): GitGuardInspection {
  const root = targetRoot(options.root), selected = options.config ? undefined : currentConfiguration(root), policy = gitProtectionPolicy(options.config ?? (selected!.kind === 'absent' ? { schemaVersion: 1 } : selected!.config));
  const report: GitGuardInspection = { root, policy, state: policy.state === 'absent' ? 'not-selected' : policy.state === 'disabled' ? 'disabled' : 'incomplete', ready: false, active: false, repairable: false, issues: [], inputs: { ...selected?.inputs }, git: { state: 'non-git' }, assets: [] };
  report.git = gitFacts(root);
  if (report.git.state === 'ordinary') { const local = localGuardSetting(root), commandAllow = commandGuardAllowance(root); report.controls = { local, effectiveEnabled: policy.enabled && local !== 'disabled' && commandAllow !== true, ...(commandAllow !== undefined ? { commandAllow } : {}) }; }
  if (!policy.enabled) { report.git = gitFacts(root); return report; }
  const issue = (code: string, message: string, repairable = false) => report.issues.push({ code, message, repairable });
  const available = bundle(options); if (available.path) report.bundlePath = available.path;
  let ownership: OwnedManifest | undefined;
  try {
    ownership = owned(root, policy.hooksPath);
    const entries = directoryEntries(root, policy.hooksPath);
    if (entries.some(name => ![...names, 'ownership.json'].includes(name as any)) || entries.length && !ownership) issue('foreign-guard-directory', `Existing ${policy.hooksPath} is not an intact Stavel-owned directory; no files will be replaced.`);
    const runtime = ownership?.files['stavel.git-hook.cjs'] ?? (available.bytes ? digest(available.bytes) : undefined);
    if (!runtime) issue('missing-runtime-bundle', 'The selected standalone guard bundle is unavailable; build/reinstall the complete Stavel package.', false);
    for (const name of names) {
      const expectedHash = name === 'stavel.git-hook.cjs' ? runtime : digest(launcher(name)); if (!expectedHash) continue;
      const filename = `${policy.hooksPath}/${name}`, currentHash = fileHash(root, filename); report.inputs[filename] = currentHash;
      report.assets.push({ path: filename, expectedHash, currentHash, owned: Boolean(ownership) });
      if (currentHash === null) issue(`missing:${name}`, `Selected guard asset is missing: ${filename}`, name !== 'stavel.git-hook.cjs' || Boolean(available.bytes && digest(available.bytes) === expectedHash));
      else if (currentHash !== expectedHash) issue(`modified:${name}`, `Guard asset was modified; preserve user bytes and review integration: ${filename}`);
      else if (name !== 'stavel.git-hook.cjs' && !executable(root, filename)) issue(`executable:${name}`, `Owned launcher needs executable permission: ${filename}`, true);
    }
    report.inputs[`${policy.hooksPath}/ownership.json`] = fileHash(root, `${policy.hooksPath}/ownership.json`);
    if (!ownership && !entries.length && runtime) issue('missing-ownership', 'Selected guard ownership metadata has not been installed.', true);
    const node = spawnSync('node', ['--version'], { encoding: 'utf8', windowsHide: true, shell: false });
    if (node.status !== 0 || node.error) issue('missing-node', 'Node is unavailable on PATH; Git adapters will fail closed until it is restored.');
    report.git = gitFacts(root);
    if (report.git.state === 'non-git') { report.state = 'pending-git'; issue('git-pending', 'Protection activation is pending Git setup; Stavel does not run git init.'); }
    else if (report.git.state !== 'ordinary') { report.state = 'unsupported'; issue('unsupported-git-layout', `Guard activation does not support ${report.git.state} repositories/shared configuration yet.`); }
    else {
      report.inputs['.git/config'] = report.git.configHash ?? null;
      const origin = git(root, ['config', '--show-origin', '--get', 'core.hooksPath'], true);
      const originFile = origin.status === 0 ? origin.stdout.split('\t')[0] : undefined;
      if (report.git.effectiveHooksPath != null && (!originFile?.startsWith('file:') || path.resolve(root, originFile.slice(5)) !== contained(root, '.git/config') || !sameHookPath(root, report.git.effectiveHooksPath, policy.hooksPath) || !ownership)) issue('foreign-hooks-path', 'An existing foreign/shared core.hooksPath or manager is active; no local override will disable it.');
      const activeDirectory = report.git.effectiveHooksPath == null ? '.git/hooks' : sameHookPath(root, report.git.effectiveHooksPath, policy.hooksPath) ? policy.hooksPath : undefined;
      if (activeDirectory === '.git/hooks' && directoryEntries(root, activeDirectory).some(name => !name.endsWith('.sample'))) issue('foreign-active-hooks', 'The complete active default hooks directory contains custom files; preserve and integrate them explicitly.');
      report.active = sameHookPath(root, report.git.effectiveHooksPath, policy.hooksPath);
      if (!report.active) issue('activation-missing', 'Selected owned guards are not activated through local core.hooksPath.', true);
      if (readLock(root)?.kind === 'git-guard') issue('activation-pending', 'An activation journal is pending; run stavel hooks resume or hooks rollback before another setup.', false);
    }
  } catch (error) { issue('inspection-refused', (error as Error).message); }
  const conflicts = report.issues.some(item => /^(?:foreign-|modified:|inspection-refused)/.test(item.code));
  if (conflicts) report.state = 'conflict';
  report.ready = report.git.state === 'ordinary' && report.active && report.issues.length === 0;
  if (report.ready) report.state = 'ready';
  report.repairable = !conflicts && !report.issues.some(item => ['missing-runtime-bundle', 'missing-node', 'activation-pending'].includes(item.code)) && report.git.state !== 'bare' && report.git.state !== 'worktree' && report.git.state !== 'unsupported' && report.issues.some(item => item.repairable);
  return report;
}

function activationId(value: GitGuardActivation): string { return digest(jsonText({ ...value, id: '' })); }
export function validateGitGuardActivation(value: GitGuardActivation, rootValue?: string): void {
  if (!plain(value) || value.schemaVersion !== 1 || value.kind !== 'stavel-git-guard-activation' || value.gitConfigPath !== '.git/config' || !isHash(value.beforeConfigHash) || !isHash(value.policyHash) || !plain(value.inputs) || !Array.isArray(value.assets) || value.assets.length !== 4 || value.id !== activationId(value)) throw new Refused('invalid or tampered Git guard activation descriptor');
  const root = targetRoot(value.root); if (root !== value.root || rootValue && root !== targetRoot(rootValue)) throw new Refused('guard activation belongs to another repository');
  const hooksPath = gitProtectionPolicy({ schemaVersion: 1, workflow: { gitProtection: { enabled: true, protectedBranches: ['main'], hooksPath: value.hooksPath } } }).hooksPath;
  const expected = new Set([...names, 'ownership.json'].map(name => `${hooksPath}/${name}`));
  for (const asset of value.assets) {
    if (!plain(asset) || !expected.delete(asset.path) || !isHash(asset.sha256) || typeof asset.created !== 'boolean' || typeof asset.executable !== 'boolean' || asset.executable !== /\/(?:pre-commit|pre-push)$/.test(asset.path)) throw new Refused('invalid guard activation asset ownership');
    contained(root, asset.path);
  }
  if (expected.size) throw new Refused('guard activation asset set is incomplete');
  for (const [name, hash] of Object.entries(value.inputs)) { contained(root, name); if (hash !== null && !isHash(hash)) throw new Refused(`invalid guard activation read set: ${name}`); }
}

export function planGitGuardInstallation(options: { root: string; config?: FrameworkConfig; sourceRoot?: string; bundlePath?: string; upgradeRuntime?: boolean; alignment: Alignment }): GitGuardInstallPlan {
  const inspection = inspectGitGuards(options), root = inspection.root;
  const changes: Array<{ path: string; content: Buffer; reason: string }> = [];
  const finish = (activation?: GitGuardActivation): GitGuardInstallPlan => {
    const fileInputs = { ...inspection.inputs }; delete fileInputs['.git/config'];
    const assets = mutationPlan({ root, alignment: options.alignment, changes, inputs: fileInputs });
    if (activation) { assets.gitGuardActivation = activation; assets.id = planDigest(assets); }
    return { assets, ...(activation ? { activation } : {}), inspection };
  };
  if (!inspection.policy.enabled) return finish();
  if (['conflict', 'unsupported'].includes(inspection.state)) throw new Refused(`guard installation preserves existing integration: ${inspection.issues.map(issue => issue.message).join('; ')}`);
  const policy = inspection.policy, ownership = owned(root, policy.hooksPath), available = bundle(options);
  const installed = fileBytes(root, `${policy.hooksPath}/stavel.git-hook.cjs`);
  if (options.upgradeRuntime !== undefined && typeof options.upgradeRuntime !== 'boolean') throw new Refused('runtime upgrade selection must be an explicit boolean');
  const upgrade = Boolean(options.upgradeRuntime && ownership);
  if (upgrade) {
    const metadata = fileBytes(root, `${policy.hooksPath}/ownership.json`)!;
    if (Object.keys(ownership!).some(key => !['files', 'hooksPath', 'product', 'schemaVersion', 'controlsVersion'].includes(key)) || ownership!.controlsVersion !== undefined && ownership!.controlsVersion !== 1 || !metadata.equals(Buffer.from(jsonText(ownership))) || names.some(name => fileHash(root, `${policy.hooksPath}/${name}`) !== ownership!.files[name])) throw new Refused('explicit runtime upgrade requires intact owned assets/ownership; first restore exact pinned bytes without discarding edits');
    if (!available.bytes) throw new Refused('explicit runtime upgrade needs the selected package bundle; rebuild/reinstall it before previewing an upgrade');
  }
  const runtime = upgrade ? available.bytes : ownership ? installed && digest(installed) === ownership.files['stavel.git-hook.cjs'] ? installed : available.bytes && digest(available.bytes) === ownership.files['stavel.git-hook.cjs'] ? available.bytes : undefined : available.bytes;
  if (!runtime) throw new Refused('exact selected/pinned guard runtime is unavailable; rebuild/reinstall matching package bytes or explicitly plan an upgrade');
  const contents = new Map<string, Buffer>([['pre-commit', Buffer.from(launcher('pre-commit'))], ['pre-push', Buffer.from(launcher('pre-push'))], ['stavel.git-hook.cjs', runtime]]);
  const manifest: OwnedManifest = { schemaVersion: 1, product: 'stavel-git-guard', hooksPath: policy.hooksPath, files: Object.fromEntries([...contents].map(([name, bytes]) => [name, digest(bytes)])), ...(!ownership || upgrade || ownership.controlsVersion === 1 ? { controlsVersion: 1 as const } : {}) };
  contents.set('ownership.json', Buffer.from(jsonText(manifest)));
  const assets = [...contents].map(([name, bytes]) => {
    const filename = `${policy.hooksPath}/${name}`, before = fileHash(root, filename), after = digest(bytes); inspection.inputs[filename] = before;
    const ownedUpgrade = upgrade && (name === 'stavel.git-hook.cjs' && before === ownership!.files[name] || name === 'ownership.json' && before === digest(Buffer.from(jsonText(ownership))));
    if (before !== null && before !== after && !ownedUpgrade) throw new Refused(`guard installer refuses to overwrite modified or foreign bytes: ${filename}`);
    if (before !== after) changes.push({ path: filename, content: bytes, reason: ownedUpgrade ? 'explicit selected-package runtime upgrade; preserve previous owned bytes in the generic file journal' : 'install selected standalone Stavel guard with explicit owned metadata' });
    return { path: filename, sha256: after, created: before === null, executable: name === 'pre-commit' || name === 'pre-push' };
  });
  if (inspection.git.state !== 'ordinary') return finish();
  const descriptor: GitGuardActivation = { schemaVersion: 1, kind: 'stavel-git-guard-activation', id: '', root, hooksPath: policy.hooksPath, gitConfigPath: '.git/config', beforeConfigHash: inspection.git.configHash!, policyHash: digest(jsonText(policy)), inputs: { ...inspection.inputs }, assets };
  for (const asset of assets) descriptor.inputs[asset.path] = asset.sha256;
  delete descriptor.inputs['.git/config']; descriptor.id = activationId(descriptor);
  return finish(descriptor);
}

export function augmentGitGuardPlan(plan: MigrationPlan, options: { config: FrameworkConfig; sourceRoot?: string; bundlePath?: string; upgradeRuntime?: boolean }): { plan: MigrationPlan; activation?: GitGuardActivation; inspection: GitGuardInspection } {
  const selected = planGitGuardInstallation({ root: plan.root, config: options.config, sourceRoot: options.sourceRoot, bundlePath: options.bundlePath, upgradeRuntime: options.upgradeRuntime, alignment: plan.alignment });
  const result = structuredClone(plan);
  for (const [name, hash] of Object.entries(selected.assets.inputs)) { if (name in result.inputs && result.inputs[name] !== hash) throw new Refused(`conflicting guard setup input: ${name}`); result.inputs[name] = hash; }
  for (const operation of selected.assets.operations) {
    if (result.operations.some(existing => existing.path === operation.path || existing.from === operation.path)) throw new Refused(`guard asset collides with another initialization operation: ${operation.path}`);
    result.operations.push(operation);
  }
  let activation = selected.activation ? structuredClone(selected.activation) : undefined;
  if (activation) {
    if (result.operations.some(operation => [operation.path, operation.from].some(name => name?.replace(/\\/g, '/').toLowerCase() === '.git/config'))) throw new Refused('local Git config effects belong to the checked activation descriptor, not generic file operations');
    // Readiness/doctor may inspect Git config, but activation owns its transition.
    // Retaining the old hash as an untouched file input poisons later recovery.
    delete result.inputs['.git/config'];
    activation.inputs = { ...result.inputs }; delete activation.inputs['.git/config'];
    for (const operation of result.operations) {
      activation.inputs[operation.path] = operation.afterHash;
      if (operation.kind === 'move' && operation.from && operation.from !== operation.path) activation.inputs[operation.from] = null;
    }
    activation.id = activationId(activation); result.gitGuardActivation = activation;
  }
  result.operations.forEach((operation, index) => { operation.id = `op-${index + 1}`; }); result.id = planDigest(result);
  return { plan: result, ...(activation ? { activation } : {}), inspection: selected.inspection };
}

function verifyInputs(activation: GitGuardActivation, allowRemoved = false): void {
  for (const [name, hash] of Object.entries(activation.inputs)) {
    const actual = fileHash(activation.root, name);
    if (actual !== hash && !(allowRemoved && actual === null && activation.assets.some(asset => asset.path === name && asset.created))) throw new Refused(`guard setup input changed; no activation/recovery overwrite: ${name}`);
  }
}
function runtimePolicy(root: string): GitProtectionPolicy {
  const selected = currentConfiguration(root);
  if (selected.kind === 'absent') throw new Refused('Stavel guard refused: repository configuration is missing; restore the selected committed policy');
  const policy = gitProtectionPolicy(selected.config);
  if (policy.state === 'absent') throw new Refused('Stavel guard refused: gitProtection policy is missing; select an explicit policy rather than bypassing the hook');
  return policy;
}
function desiredConfig(before: Buffer, activation: GitGuardActivation): Buffer {
  const value = activation.hooksPath.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return Buffer.concat([before, Buffer.from(`${before.length && before[before.length - 1] !== 10 ? '\n' : ''}\n# Stavel-owned local hook activation ${activation.id}\n[core]\n\thooksPath = "${value}"\n`)]);
}
const receiptName = (activation: GitGuardActivation) => `.git/stavel-guards/activation-${activation.id}.json`;
function receiptChecksum(receipt: Receipt): string { return digest(jsonText({ ...receipt, checksum: '' })); }
function readReceipt(activation: GitGuardActivation): Receipt | undefined {
  const bytes = fileBytes(activation.root, receiptName(activation)); if (!bytes) return undefined;
  let receipt: Receipt; try { receipt = JSON.parse(bytes.toString('utf8')); } catch { throw new Refused('guard activation journal is invalid JSON'); }
  if (!plain(receipt) || receipt.schemaVersion !== 1 || receipt.kind !== 'stavel-git-guard-receipt' || receipt.checksum !== receiptChecksum(receipt) || jsonText(receipt.activation) !== jsonText(activation) || !Array.isArray(receipt.modes)) throw new Refused('guard activation journal checksum/identity mismatch');
  const before = Buffer.from(receipt.beforeConfig, 'base64'), after = Buffer.from(receipt.afterConfig, 'base64');
  if (digest(before) !== activation.beforeConfigHash || !after.equals(desiredConfig(before, activation)) || receipt.modes.length !== activation.assets.length || new Set(receipt.modes.map(mode => mode.path)).size !== receipt.modes.length || receipt.modes.some(mode => !activation.assets.some(asset => asset.path === mode.path) || !Number.isInteger(mode.before) || !Number.isInteger(mode.after) || mode.before < 0 || mode.after > 0o777)) throw new Refused('guard activation journal snapshots are not the selected effects');
  return receipt;
}
export function preflightGitGuardActivation(activation: GitGuardActivation): void {
  validateGitGuardActivation(activation);
  const facts = gitFacts(activation.root); if (facts.state !== 'ordinary') throw new Refused(`guard activation unsupported: ${facts.state}`);
  const current = fileHash(activation.root, '.git/config'), receipt = readReceipt(activation);
  if (current !== activation.beforeConfigHash && (!receipt || current !== digest(Buffer.from(receipt.afterConfig, 'base64')))) throw new Refused('local Git config changed after guard preview; refuse stale activation');
  const report = inspectGitGuards({ root: activation.root, config: { schemaVersion: 1, workflow: { gitProtection: { enabled: true, protectedBranches: ['main'], hooksPath: activation.hooksPath } } } });
  const conflict = report.issues.find(issue => /^(?:foreign-|inspection-refused)/.test(issue.code)); if (conflict) throw new Refused(conflict.message);
}
function verifyActivationContents(activation: GitGuardActivation): boolean {
  try {
    validateGitGuardActivation(activation); verifyInputs(activation);
    if (digest(jsonText(runtimePolicy(activation.root))) !== activation.policyHash) return false;
    const facts = gitFacts(activation.root), receipt = readReceipt(activation);
    if (facts.state !== 'ordinary' || !sameHookPath(activation.root, facts.effectiveHooksPath, activation.hooksPath)) return false;
    if (fileHash(activation.root, '.git/config') !== activation.beforeConfigHash && (!receipt || fileHash(activation.root, '.git/config') !== digest(Buffer.from(receipt.afterConfig, 'base64')))) return false;
    return activation.assets.every(asset => fileHash(activation.root, asset.path) === asset.sha256 && (!asset.executable || executable(activation.root, asset.path)));
  } catch { return false; }
}
export function verifyGitGuardActivation(activation: GitGuardActivation): boolean {
  try { return !(readLock(activation.root)?.kind === 'git-guard') && !fs.existsSync(contained(activation.root, '.git/config.lock')) && verifyActivationContents(activation); } catch { return false; }
}

function stopped(pid: unknown): void {
  if (typeof pid !== 'number' || !Number.isInteger(pid) || pid <= 0) throw new Refused('uncertain guard writer identity; no lock is stolen');
  if (pid === process.pid) return;
  try { process.kill(pid, 0); } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ESRCH') return; throw new Refused('cannot establish that the guard writer stopped'); }
  throw new Refused('guard writer is still running; concurrent recovery is refused');
}
function readLock(root: string): Record<string, unknown> | undefined {
  const bytes = fileBytes(root, writerLock); if (!bytes) return undefined;
  try { const value: unknown = JSON.parse(bytes.toString('utf8')); if (!plain(value)) throw new Error(); return value; } catch { throw new Refused('uncertain repository writer lock; preserve it for explicit inspection'); }
}
function ownLock(activation: GitGuardActivation, checksum: string): { created: boolean } {
  const previous = readLock(activation.root);
  if (previous) {
    if (previous.kind !== 'git-guard' || previous.activationId !== activation.id || previous.journalChecksum !== checksum) throw new Refused('another or uncertain repository writer lock exists; guard effects refuse');
    stopped(previous.pid); return { created: false };
  }
  const destination = contained(activation.root, writerLock); fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, jsonText({ schemaVersion: 1, kind: 'git-guard', activationId: activation.id, journal: receiptName(activation), journalChecksum: checksum, pid: process.pid }), { flag: 'wx' });
  return { created: true };
}
function releaseLock(activation: GitGuardActivation): void {
  const lock = readLock(activation.root);
  if (!lock || lock.kind !== 'git-guard' || lock.activationId !== activation.id) throw new Refused('guard writer lock changed; retain journal and inspect before recovery');
  fs.unlinkSync(contained(activation.root, writerLock));
}
function checkAssets(activation: GitGuardActivation, allowRemoved = false): void {
  const known = new Set([...names, 'ownership.json']);
  if (directoryEntries(activation.root, activation.hooksPath).some(name => !known.has(name as any))) throw new Refused('foreign files appeared in the owned hooks directory; preserve/integrate them before recovery');
  for (const asset of activation.assets) {
    const actual = fileHash(activation.root, asset.path);
    if (actual !== asset.sha256 && !(allowRemoved && asset.created && actual === null)) throw new Refused(`owned guard asset changed; refuse recovery overwrite/removal: ${asset.path}`);
  }
}
function nodeAvailable(): void { const node = spawnSync('node', ['--version'], { encoding: 'utf8', windowsHide: true, shell: false }); if (node.error || node.status !== 0) throw new Refused('Node is missing from PATH; activation remains incomplete and hooks must fail closed'); }
function finalPreflight(activation: GitGuardActivation): void {
  preflightGitGuardActivation(activation); verifyInputs(activation); checkAssets(activation); nodeAvailable();
  if (digest(jsonText(runtimePolicy(activation.root))) !== activation.policyHash) throw new Refused('selected Git protection policy changed after preview; create a new aligned plan');
}
function receiptFor(activation: GitGuardActivation): Receipt {
  const before = fileBytes(activation.root, '.git/config')!;
  if (digest(before) !== activation.beforeConfigHash) throw new Refused('local Git configuration changed; no activation bytes were prepared');
  const modes = activation.assets.map(asset => {
    const before = fs.statSync(contained(activation.root, asset.path)).mode & 0o777;
    return { path: asset.path, before, after: asset.executable && process.platform !== 'win32' ? before | ((before & 0o444) >> 2) | 0o100 : before };
  });
  const receipt: Receipt = { schemaVersion: 1, kind: 'stavel-git-guard-receipt', checksum: '', activation, beforeConfig: before.toString('base64'), afterConfig: desiredConfig(before, activation).toString('base64'), modes };
  receipt.checksum = receiptChecksum(receipt); return receipt;
}
function writeConfigLock(activation: GitGuardActivation, bytes: Buffer, receipt: Receipt, allowExisting: boolean): void {
  const filename = contained(activation.root, '.git/config.lock');
  if (fs.existsSync(filename)) {
    if (!allowExisting) throw new Refused('Git config.lock already exists; a foreign/concurrent Git writer is preserved');
    const hash = digest(fs.readFileSync(filename));
    if (![digest(Buffer.alloc(0)), digest(Buffer.from(receipt.afterConfig, 'base64')), digest(Buffer.from(receipt.beforeConfig, 'base64'))].includes(hash)) throw new Refused('Git config.lock contains uncertain/intervening bytes; no recovery steals it');
  } else fs.writeFileSync(filename, Buffer.alloc(0), { flag: 'wx', mode: 0o600 });
  const currentMode = fs.statSync(contained(activation.root, '.git/config')).mode & 0o777;
  fs.writeFileSync(filename, bytes); if (process.platform !== 'win32') fs.chmodSync(filename, currentMode);
}
function finishReceipt(activation: GitGuardActivation, receipt: Receipt, mode: 'resume' | 'rollback', allowExistingConfigLock: boolean): GitGuardActivationResult {
  const root = activation.root, before = Buffer.from(receipt.beforeConfig, 'base64'), after = Buffer.from(receipt.afterConfig, 'base64');
  const actual = fileHash(root, '.git/config');
  if (actual !== digest(before) && actual !== digest(after)) throw new Refused('local Git configuration has intervening edits; recovery refuses to replace it');
  if (mode === 'resume') {
    verifyInputs(activation); checkAssets(activation); nodeAvailable();
    if (digest(jsonText(runtimePolicy(root))) !== activation.policyHash) throw new Refused('policy changed during guard recovery; preserve current choices and replan');
    for (const item of receipt.modes) {
      const filename = contained(root, item.path), current = fs.statSync(filename).mode & 0o777;
      if (process.platform !== 'win32' && current !== item.before && current !== item.after) throw new Refused(`guard file permissions changed after setup: ${item.path}`);
      if (process.platform !== 'win32' && current !== item.after) fs.chmodSync(filename, item.after);
    }
  } else { verifyInputs(activation, true); checkAssets(activation, true); }
  const desired = mode === 'resume' ? after : before;
  if (actual !== digest(desired)) {
    writeConfigLock(activation, desired, receipt, allowExistingConfigLock);
    if (fileHash(root, '.git/config') !== actual) throw new Refused('Git config changed before activation rename; preserve the journal/config.lock');
    fs.renameSync(contained(root, '.git/config.lock'), contained(root, '.git/config'));
  } else if (fs.existsSync(contained(root, '.git/config.lock'))) {
    if (!allowExistingConfigLock) throw new Refused('foreign Git config.lock exists; recovery refuses');
    const hash = fileHash(root, '.git/config.lock');
    if (![digest(before), digest(after), digest(Buffer.alloc(0))].includes(hash!)) throw new Refused('uncertain Git config.lock is preserved');
    fs.unlinkSync(contained(root, '.git/config.lock'));
  }
  if (mode === 'rollback') {
    for (const asset of [...activation.assets].reverse()) if (asset.created && fileHash(root, asset.path) !== null) {
      if (fileHash(root, asset.path) !== asset.sha256) throw new Refused(`guard asset changed during rollback: ${asset.path}`);
      fs.unlinkSync(contained(root, asset.path));
    }
    for (const item of receipt.modes) if (!activation.assets.find(asset => asset.path === item.path)!.created && fs.existsSync(contained(root, item.path)) && process.platform !== 'win32') {
      const current = fs.statSync(contained(root, item.path)).mode & 0o777;
      if (current !== item.before && current !== item.after) throw new Refused(`preserve changed guard permissions: ${item.path}`);
      if (current !== item.before) fs.chmodSync(contained(root, item.path), item.before);
    }
  } else if (!verifyActivationContents(activation)) throw new Refused('activation verification failed; current assets/config require explicit hooks recovery');
  return { ok: true, state: mode === 'resume' ? 'active' : 'rolled-back', changed: true, journal: receiptName(activation) };
}

export function activateGitGuards(activation: GitGuardActivation, options: { dryRun?: boolean } = {}): GitGuardActivationResult {
  validateGitGuardActivation(activation);
  const pending = readLock(activation.root), saved = readReceipt(activation);
  if (pending?.kind === 'git-guard' && pending.activationId === activation.id) return recoverGitGuardInstallation({ root: activation.root, mode: 'resume', activation, dryRun: options.dryRun });
  finalPreflight(activation);
  if (verifyGitGuardActivation(activation)) return { ok: true, state: 'active', changed: false, ...(options.dryRun ? { dryRun: true } : {}) };
  if (options.dryRun) return { ok: true, state: 'not-activated', changed: false, dryRun: true };
  if (fs.existsSync(contained(activation.root, '.git/config.lock'))) throw new Refused('foreign Git config.lock exists; activation will not claim or steal it');
  const receipt = saved ?? receiptFor(activation), lock = ownLock(activation, receipt.checksum), journal = contained(activation.root, receiptName(activation));
  let journalSaved = Boolean(saved), configLockCreated = false;
  try {
    finalPreflight(activation);
    const configLock = contained(activation.root, '.git/config.lock');
    fs.writeFileSync(configLock, Buffer.alloc(0), { flag: 'wx', mode: 0o600 }); configLockCreated = true;
    if (!saved) { fs.mkdirSync(path.dirname(journal), { recursive: true }); fs.writeFileSync(journal, jsonText(receipt), { flag: 'wx', mode: 0o600 }); journalSaved = true; }
    const result = finishReceipt(activation, receipt, 'resume', true); releaseLock(activation); return result;
  } catch (error) {
    if (!journalSaved || !configLockCreated) { if (configLockCreated && fileHash(activation.root, '.git/config.lock') === digest(Buffer.alloc(0))) fs.unlinkSync(contained(activation.root, '.git/config.lock')); if (lock.created) releaseLock(activation); }
    throw new Refused(`Git guard activation incomplete; owned files may remain. ${journalSaved ? 'Run stavel hooks resume or hooks rollback; the private Git journal/config lock is retained.' : 'No activation config was written; inspect and create a new preserving preview.'} ${(error as Error).message}`);
  }
}

export function recoverGitGuardInstallation(options: { root: string; mode: 'resume' | 'rollback'; activation?: GitGuardActivation; dryRun?: boolean }): GitGuardActivationResult {
  const root = targetRoot(options.root); let activation = options.activation;
  const previous = readLock(root);
  if (!activation && previous?.kind === 'git-guard' && typeof previous.journal === 'string') {
    const value = JSON.parse(fileBytes(root, previous.journal)!.toString('utf8')) as Receipt; activation = value.activation;
  }
  if (!activation) {
    const directory = contained(root, '.git/stavel-guards');
    const candidates = fs.existsSync(directory) ? fs.readdirSync(directory).filter(name => /^activation-[a-f0-9]{64}\.json$/.test(name)).flatMap(name => {
      const value = JSON.parse(fileBytes(root, `.git/stavel-guards/${name}`)!.toString('utf8')) as Receipt;
      return digest(Buffer.from(value.afterConfig ?? '', 'base64')) === fileHash(root, '.git/config') ? [value.activation] : [];
    }) : [];
    if (candidates.length !== 1) throw new Refused('no unique current/pending guard activation receipt; inspect hooks or use the saved aligned plan'); activation = candidates[0]!;
  }
  validateGitGuardActivation(activation, root);
  const receipt = readReceipt(activation);
  if (!receipt) {
    if (options.mode === 'rollback' && fileHash(root, '.git/config') === activation.beforeConfigHash && !previous && !fs.existsSync(contained(root, '.git/config.lock'))) return { ok: true, state: 'not-activated', changed: false, ...(options.dryRun ? { dryRun: true } : {}) };
    throw new Refused('guard activation journal is missing; refusing uncertain recovery');
  }
  if (previous && (previous.kind !== 'git-guard' || previous.activationId !== activation.id || previous.journalChecksum !== receipt.checksum)) throw new Refused('another/uncertain writer owns recovery state');
  if (previous) stopped(previous.pid);
  const configHash = fileHash(root, '.git/config');
  if (![activation.beforeConfigHash, digest(Buffer.from(receipt.afterConfig, 'base64'))].includes(configHash!)) throw new Refused('intervening local Git config edits are preserved; recovery refuses');
  verifyInputs(activation, options.mode === 'rollback'); checkAssets(activation, options.mode === 'rollback');
  if (!previous && fs.existsSync(contained(root, '.git/config.lock'))) throw new Refused('foreign Git config.lock exists; recovery will not steal it');
  if (options.dryRun) return { ok: true, state: options.mode === 'resume' ? 'not-activated' : 'rolled-back', changed: false, dryRun: true, journal: receiptName(activation) };
  const guard = contained(root, recoveryLock); fs.mkdirSync(path.dirname(guard), { recursive: true });
  try { fs.writeFileSync(guard, jsonText({ pid: process.pid, activationId: activation.id }), { flag: 'wx' }); } catch { throw new Refused('concurrent/uncertain guard recovery lock exists; no lock is stolen'); }
  let ownedLock = false;
  try { ownLock(activation, receipt.checksum); ownedLock = true; const result = finishReceipt(activation, receipt, options.mode, Boolean(previous)); releaseLock(activation); ownedLock = false; return result; }
  catch (error) { throw new Refused(`guard recovery stopped; private receipt and ${ownedLock ? 'owned writer/config locks' : 'original state'} retained: ${(error as Error).message}`); }
  finally { fs.unlinkSync(guard); }
}

function localGuardSetting(root: string): 'inherit' | 'enabled' | 'disabled' {
  const result = git(root, ['config', '--local', '--no-includes', '--get-all', 'stavel.guards.enabled'], true);
  if (result.status === 1) return 'inherit';
  if (result.status !== 0 || !['true', 'false'].includes(result.stdout.trim())) throw new Refused('invalid or duplicate local stavel.guards.enabled; use hooks enable/disable --local to select one boolean');
  return result.stdout.trim() === 'true' ? 'enabled' : 'disabled';
}
function guardControlContext(root: string): GitProtectionPolicy {
  if (gitFacts(root).state !== 'ordinary') throw new Refused('guard controls require a supported ordinary Git repository');
  const policy = runtimePolicy(root), manifest = owned(root, policy.hooksPath);
  if (!manifest || manifest.controlsVersion !== 1) throw new Refused('installed guard runtime predates explicit controls; select an owned runtime upgrade first');
  for (const name of names) if (fileHash(root, `${policy.hooksPath}/${name}`) !== manifest.files[name]) throw new Refused('guard controls require intact owned assets; restore the installation first');
  return policy;
}
function withControlLock<T>(root: string, action: () => T): T {
  const lock = contained(root, writerLock); fs.mkdirSync(path.dirname(lock), { recursive: true });
  try { fs.writeFileSync(lock, jsonText({ kind: 'git-guard-control', pid: process.pid }), { flag: 'wx' }); } catch { throw new Refused('another writer owns repository state; guard controls will not steal its lock'); }
  try { if (fileHash(root, '.git/config.lock') !== null) throw new Refused('foreign Git config.lock exists; no guard control was changed'); return action(); }
  finally { fs.unlinkSync(lock); }
}
/** A private checkout setting; never changes core.hooksPath or committed policy. */
export function setLocalGitGuards(options: { root: string; enabled: boolean; dryRun?: boolean }) {
  if (typeof options.enabled !== 'boolean') throw new Refused('enabled must be boolean');
  const root = targetRoot(options.root); guardControlContext(root);
  const before = localGuardSetting(root), after = options.enabled ? 'enabled' : 'disabled';
  if (options.dryRun || before === after) return { ok: true, scope: 'local', before, after, changed: false, ...(options.dryRun ? { dryRun: true } : {}) };
  return withControlLock(root, () => { git(root, ['config', '--local', '--replace-all', 'stavel.guards.enabled', String(options.enabled)]); return { ok: true, scope: 'local', before, after, changed: true }; });
}
/** Committed policy changes reuse the pinned configuration serializer and file journal. */
export function planRepositoryGitGuards(options: { root: string; enabled: boolean; alignment: Alignment }): MigrationPlan {
  const root = targetRoot(options.root), selected = currentConfiguration(root);
  if (!['configured-directory', 'legacy-root'].includes(selected.kind)) throw new Refused('repository guard selection requires an adopted repository configuration');
  const policy = gitProtectionPolicy(selected.config);
  if (policy.state === 'absent') throw new Refused('select guard policy through init before toggling it');
  const next = structuredClone(selected.config); next.workflow!.gitProtection = { enabled: options.enabled, protectedBranches: policy.protectedBranches, hooksPath: policy.hooksPath }; gitProtectionPolicy(next);
  const files = selected.kind === 'legacy-root' ? { 'stavel.config.json': Buffer.from(jsonText(next)) } : directoryConfigurationFiles({ config: next, baseline: selected.baselineProfile, previous: selected });
  return mutationPlan({ root, alignment: options.alignment, inputs: selected.inputs, changes: Object.entries(files).filter(([name, bytes]) => fileHash(root, name) !== digest(bytes)).map(([name, content]) => ({ path: name, content, reason: 'explicit repository-wide Git guard selection; preserve pinned baseline and other policy' })) });
}
/** Only invocation-scoped Git values may select this exception. Persisted keys are ignored. */
function commandGuardAllowance(root: string): boolean | undefined {
  const result = git(root, ['config', '--show-scope', '--null', '--get-all', 'stavel.allow'], true);
  if (result.status === 1) return;
  if (result.status !== 0) throw new Refused('cannot read command-scoped stavel.allow');
  const fields = result.stdout.split('\0');
  if (fields.pop() !== '' || fields.length % 2 !== 0) throw new Refused('invalid scoped Git configuration response');
  let value: string | undefined;
  for (let index = 0; index < fields.length; index += 2) if (fields[index] === 'command') value = fields[index + 1];
  if (value === undefined) return;
  if (!/^(?:true|false)$/i.test(value)) throw new Refused('command-scoped stavel.allow must be true or false');
  return value.toLowerCase() === 'true';
}

export function runGitHook(options: { cwd: string; hook: 'pre-commit' | 'pre-push'; stdin?: string; runtimePath?: string }): { ok: true; exception?: string } {
  const root = targetRoot(options.cwd), facts = gitFacts(root);
  if (facts.state !== 'ordinary') throw new Refused(`Stavel guard requires a supported ordinary Git repository; found ${facts.state}`);
  const policy = runtimePolicy(root); if (!policy.enabled) return { ok: true };
  const manifest = owned(root, policy.hooksPath); if (!manifest) throw new Refused('guard ownership/configuration is missing; restore selected setup rather than bypassing the hook');
  for (const name of names) if (fileHash(root, `${policy.hooksPath}/${name}`) !== manifest.files[name]) throw new Refused(`guard asset missing/modified: ${name}; restore the owned installation`);
  if (options.runtimePath && path.resolve(options.runtimePath) !== contained(root, `${policy.hooksPath}/stavel.git-hook.cjs`)) throw new Refused('guard runtime is outside the selected owned installation');
  if (commandGuardAllowance(root) === true) return { ok: true, exception: 'Explicit git -c stavel.allow=true exception for this Git invocation.' };
  if (localGuardSetting(root) === 'disabled') return { ok: true, exception: 'Git guards are explicitly disabled in this checkout (hooks enable --local to restore).' };
  for (const name of policy.protectedBranches) if (git(root, ['check-ref-format', `refs/heads/${name}`], true).status !== 0) throw new Refused(`invalid exact protected branch identity: ${name}`);
  // Case-insensitive ordinary files repositories permit MAIN to alias main.
  // Deny that ambiguity for destinations too; an offline hook cannot know the
  // remote platform. Case-sensitive files/reftable retain exact identities.
  const storageResult = git(root, ['config', '--get', 'extensions.refStorage'], true), ignoreCase = git(root, ['config', '--bool', '--get', 'core.ignoreCase'], true);
  if (![0, 1].includes(storageResult.status) || ![0, 1].includes(ignoreCase.status)) throw new Refused('cannot establish Git reference case behavior; refuse uncertain branch protection');
  const caseAliases = storageResult.stdout.trim() !== 'reftable' && (process.platform === 'win32' || ignoreCase.stdout.trim() === 'true');
  const protectedName = (branch: string) => policy.protectedBranches.find(name => name === branch || caseAliases && name.toLowerCase() === branch.toLowerCase());
  if (options.hook === 'pre-commit') {
    const ref = git(root, ['symbolic-ref', '--quiet', 'HEAD'], true);
    if (ref.status !== 0 || !ref.stdout.trim().startsWith('refs/heads/')) throw new Refused('Stavel blocked detached-HEAD commit; create/select a task branch first');
    const branch = ref.stdout.trim().slice('refs/heads/'.length);
    if (protectedName(branch)) throw new Refused(`Stavel blocked commit on protected branch ${branch}; create/select a task branch. Do not bypass with --no-verify.`);
  } else if (options.hook === 'pre-push') {
    for (const line of (options.stdin ?? '').split(/\r?\n/).filter(line => line.trim())) {
      const parts = line.trim().split(/\s+/);
      if (parts.length !== 4 || !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(parts[1]!) || !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(parts[3]!) || git(root, ['check-ref-format', parts[2]!], true).status !== 0) throw new Refused('malformed pre-push ref input; refusing uncertain updates');
      const destination = parts[2]!;
      if (destination.startsWith('refs/heads/') && protectedName(destination.slice('refs/heads/'.length))) throw new Refused(`Stavel blocked push updating/deleting protected destination ${destination}, regardless of source branch. Do not bypass with --no-verify.`);
    }
  } else throw new Refused('unsupported Git guard adapter');
  return { ok: true };
}
