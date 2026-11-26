export interface PolicyDiagnostic {
  ruleId: string;
  severity: 'error' | 'warning';
  path?: string;
  line?: number;
  column?: number;
  message: string;
}

export interface RuleOptions {
  enabled?: boolean;
  severity?: 'error' | 'warning';
  [key: string]: unknown;
}

export interface NamingPolicy {
  shape?: 'plain' | 'typed';
  identifierCase?: 'camel' | 'snake' | 'kebab' | 'pascal' | 'any';
  generatedIdentifierCase?: string;
  allowedNames?: string[];
  legacyKinds?: string[];
  typePatterns?: string[];
}

export interface PolicyConfig {
  schemaVersion?: number;
  documentation?: {
    roots?: string[];
    naming?: NamingPolicy;
    kinds?: string[];
    states?: string[];
    metadata?: { required?: string[]; requiredFields?: string[] };
    archive?: { root?: string; historicalHeading?: string; activeRoots?: string[]; allowedAudiences?: string[]; allowedStates?: string[] };
    publication?: { requirePublicMarkerForCrossRoot?: boolean };
    audiences?: string[];
  };
  source?: { roots?: string[]; naming?: NamingPolicy; roles?: string[]; scopes?: Record<string, { language?: string; naming?: NamingPolicy; roles?: string[]; rules?: Record<string, boolean | RuleOptions> }> };
  rules?: Record<string, boolean | RuleOptions>;
  ignore?: string[];
  [key: string]: unknown;
}

export interface RuleContext {
  root: string;
  config: PolicyConfig;
  inputs?: string[];
  changedFiles?: string[];
}

export interface PolicyResult {
  ok: boolean;
  diagnostics: PolicyDiagnostic[];
}

export interface RuleModule {
  id: string;
  version: 1;
  applicability: string;
  check: (context: RuleContext, options: RuleOptions) => PolicyDiagnostic[] | Promise<PolicyDiagnostic[]>;
}
