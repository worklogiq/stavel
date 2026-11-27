export type Severity = 'error' | 'warning';
export interface Diagnostic { ruleId: string; severity: Severity; path?: string; line?: number; message: string }
export type Track = 'greenfield' | 'existing' | 'research';
export type NamingCase = 'camel' | 'snake' | 'kebab' | 'pascal' | 'any';
export interface NamingConvention { shape: 'plain' | 'typed'; identifierCase: NamingCase; generatedIdentifierCase?: Exclude<NamingCase, 'any'> }
export interface TestLayout {
  placement: 'follow-repository' | 'language-convention' | 'colocated' | 'separate' | 'custom';
  roots?: string[]; patterns?: string[];
}
export interface TestingConfig extends TestLayout { fallback: 'ask' | 'language-convention'; scopes?: Record<string, TestLayout> }
export interface TestLayoutEvidence { layout: 'none' | 'unknown' | 'mixed' | 'colocated' | 'separate'; colocated: string[]; separate: string[]; unclassified: string[] }
export interface StoryConfig { generation: 'ask' | 'always' | 'never'; template: string }
export interface FrameworkConfig {
  schemaVersion: number; id?: string; version?: number;
  documentation?: { roots?: string[]; naming?: NamingConvention; kinds?: string[]; states?: string[]; metadata?: Record<string, unknown>; archive?: Record<string, unknown>; [key: string]: unknown };
  source?: Record<string, unknown>; rules?: Record<string, unknown>; testing?: TestingConfig; [key: string]: unknown;
  workflow?: { stories?: StoryConfig; [key: string]: unknown };
}
export interface Asset { source: string; target: string; role: string }
export interface AssetCatalog {
  product: 'stavel'; schemaVersion: number; assets: Asset[];
  entrypoints?: { index: string; constitution: string; profile: string };
  agentsTemplate?: string; profileTemplate?: string; skill?: { source: string };
}
export interface Question {
  id: string; group: string; prompt: string; type?: string; options?: Array<string | { value?: string; id?: string; label?: string }>;
  default?: unknown; required?: boolean; applicability?: unknown; [key: string]: unknown;
}
export interface AnswerRecord { value?: unknown; status?: string; source?: string; evidence?: string[]; [key: string]: unknown }
export interface Alignment { confirmed: boolean; instruction: string }
export interface AnswersDocument {
  answers: Record<string, unknown | AnswerRecord>; alignment: Alignment; useDefaults?: boolean;
  configuration?: FrameworkConfig; mappings?: Record<string, string>;
  lifecycleMappings?: Record<string, string>; ownership?: Record<string, string>;
  acceptanceRecords?: Record<string, string>;
  history?: Array<{ topic: string; observation: string; sources: string[]; status?: string }>;
}
export interface RepositoryFile { path: string; hash: string; size: number }
export interface Inspection {
  schemaVersion: 1; root: string; exists: boolean; files: RepositoryFile[];
  instructionFiles: string[]; documentRoots: string[]; languages: string[];
  packageScripts: Record<string, string>; manifest: Record<string, unknown> | null;
  historySources: string[]; notes: string[];
  testLayout?: TestLayoutEvidence;
  gitHistory?: { head?: string; entries: Array<{ revision: string; date: string; subject: string }>; limit: number; note: string };
}
export interface QuestionsResult { schemaVersion: 1; questions: Question[]; unresolved: string[]; resolved: Record<string, unknown>; observations: string[] }
export type OperationKind = 'create' | 'update' | 'move' | 'delete';
export interface PlanOperation {
  id: string; kind: OperationKind; path: string; from?: string; beforeHash: string | null;
  afterHash: string | null; content?: string; encoding?: 'base64'; reason: string;
}
export interface MigrationPlan {
  product: 'stavel'; schemaVersion: 2; id: string; root: string; frameworkVersion: string; profileVersion: string;
  mode: 'bootstrap' | 'adopt' | 'migrate'; track: Track; projectName: string; alignment: Alignment;
  decisions: Record<string, unknown>; inputs: Record<string, string | null>; operations: PlanOperation[];
  diagnostics: Diagnostic[]; createdAt: string;
  execution?: { kind: 'deterministic' | 'agent-assisted'; source?: string; warnings: string[] };
}
export interface FileTransition { path: string; beforePath?: string; before: string | null; after: string | null }
export interface MigrationJournal {
  schemaVersion: 1; plan: MigrationPlan; state: 'applying' | 'complete' | 'rolling-back' | 'rolled-back';
  files: FileTransition[]; completedPaths: string[]; createdDirectories: string[];
}
export interface CreatePlanOptions {
  root: string; name: string; track?: Track; mode?: 'bootstrap' | 'adopt' | 'migrate';
  answers: AnswersDocument; sourceRoot?: string; frameworkPath?: string;
  configurationHome?: 'root' | 'directory';
  upgradeBaseline?: boolean;
}
export interface CheckResult { ok: boolean; diagnostics: Diagnostic[]; notes: string[] }
export interface Distribution { root: string; version: string; catalog: AssetCatalog; config: FrameworkConfig; questions: Question[] }
