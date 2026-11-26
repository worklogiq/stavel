import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import type { PolicyDiagnostic, RuleContext, RuleOptions } from './policy.types.js';
import { collectFiles, diagnostic, matchesAny, posix, stringList } from './shared.service.js';

const sourceExtensions = /\.[cm]?[jt]sx?$/;
const codeRuleIds = ['source-naming', 'file-length', 'api-client-usage', 'api-error-codes', 'frontend-i18n-copy', 'frontend-error-surfaces'];
const defaultRoles = ['adapter', 'app', 'assert', 'cli', 'client', 'component', 'config', 'constants', 'container', 'context', 'contract', 'controller', 'd', 'dto', 'error-codes', 'factory', 'feature', 'guard', 'hook', 'index', 'mapper', 'messages', 'middleware', 'model', 'module', 'page', 'policy', 'provider', 'query', 'registry', 'repository', 'route', 'routes', 'rule', 'runner', 'schema', 'service', 'setup', 'spec', 'store', 'test', 'tool', 'types', 'util', 'view', 'worker'];
const copyAttributes = new Set(['label', 'title', 'placeholder', 'helperText', 'aria-label', 'aria-description', 'alt', 'tooltip', 'description', 'subtitle', 'caption', 'confirmText', 'cancelText', 'loadingText', 'noOptionsText', 'emptyText', 'children']);

function optionsFor(context: RuleContext, id: string): RuleOptions | undefined {
  const options = context.config.rules?.[id];
  if (!options || (typeof options === 'object' && options.enabled === false)) return undefined;
  return options === true ? {} : options;
}

function scopedOptions(context: RuleContext, relative: string, id: string, options: RuleOptions): RuleOptions | undefined {
  let selected = { ...options };
  const scopes = Object.entries(context.config.source?.scopes ?? {})
    .map(([root, scope]) => [posix(root).replace(/^\.\//, '').replace(/\/$/, ''), scope] as const)
    .filter(([root]) => root === '.' || relative === root || relative.startsWith(`${root}/`))
    .sort(([left], [right]) => left.length - right.length);
  for (const [, scope] of scopes) {
    if (id === 'source-naming') {
      selected = { ...selected, ...scope.naming, ...(scope.roles ? { roles: scope.roles } : {}) };
    }
    const override = scope.rules?.[id];
    if (typeof override === 'boolean') selected.enabled = override;
    else if (typeof override === 'object') selected = { ...selected, ...override };
  }
  return selected.enabled === false ? undefined : selected;
}

function inspectSource(context: RuleContext, file: string, ruleId: string, options: RuleOptions): PolicyDiagnostic[] {
  const text = fs.readFileSync(file, 'utf8');
  const relative = posix(path.relative(context.root, file));
  const result: PolicyDiagnostic[] = [];
  const record = (message: string, node?: ts.Node): void => {
    const line = node ? source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1 : undefined;
    result.push(diagnostic(ruleId, relative, message, options, line));
  };
  const source = ts.createSourceFile(relative, text, ts.ScriptTarget.Latest, true, /\.[jt]sx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS);

  if (ruleId === 'file-length') {
    const maximum = typeof options.maxLines === 'number' ? options.maxLines : 250;
    const count = text.split(/\r?\n/).length;
    if (count > maximum) result.push(diagnostic(ruleId, relative, `File has ${count} lines; configured threshold is ${maximum}.`, { ...options, severity: options.severity ?? 'warning' }));
    return result;
  }
  if (ruleId === 'source-naming') {
    const name = path.basename(file).replace(sourceExtensions, '');
    if (stringList(options.allowedNames, ['index', 'main', 'vite-env.d']).includes(name)) return result;
    const role = name.split('.').at(-1) ?? '';
    const roles = stringList(options.roles, context.config.source?.roles ?? defaultRoles);
    const shape = options.shape ?? context.config.source?.naming?.shape ?? 'typed';
    if (shape === 'typed' && (!name.includes('.') || !roles.includes(role))) record(`Source filename must declare a configured role (${roles.join(', ')}).`);
    const identifier = shape === 'plain' ? name : name.split('.')[0];
    const style = String(options.identifierCase ?? context.config.source?.naming?.identifierCase ?? 'any');
    const patterns: Record<string, RegExp> = { camel: /^[a-z][A-Za-z0-9]*$/, snake: /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/, kebab: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, pascal: /^[A-Z][A-Za-z0-9]*$/, any: /^[A-Za-z0-9][A-Za-z0-9_-]*$/ };
    if (!(patterns[style] ?? patterns.any).test(identifier)) record(`Source identifier must use ${style} case.`);
    return result;
  }

  const apiNames = new Set<string>();
  const apiNamespaces = new Set<string>();
  const hookNames = new Set<string>();
  const hookNamespaces = new Set<string>();
  const apiModule = typeof options.apiClientModule === 'string' ? options.apiClientModule : '';
  const queryModules = stringList(options.queryModules, ['@tanstack/react-query']);
  const safeExports = new Set(stringList(options.allowedExports));
  const callbackNodes = new Set<ts.Node>();
  const initializers = new Map<string, ts.Expression>();
  const namedFunctions = new Map<string, ts.Node>();
  const hookExports = new Set(stringList(options.queryHooks, ['useQuery', 'useMutation', 'useInfiniteQuery', 'useQueries', 'queryOptions', 'infiniteQueryOptions']));

  const facts = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const moduleName = node.moduleSpecifier.text;
      const bindings = node.importClause?.namedBindings;
      if (bindings && ts.isNamespaceImport(bindings)) {
        if (moduleName === apiModule) apiNamespaces.add(bindings.name.text);
        if (queryModules.includes(moduleName)) hookNamespaces.add(bindings.name.text);
      }
      if (bindings && ts.isNamedImports(bindings)) for (const specifier of bindings.elements) {
        const importedName = specifier.propertyName?.text ?? specifier.name.text;
        if (!specifier.isTypeOnly && !node.importClause?.isTypeOnly && moduleName === apiModule && !safeExports.has(importedName)) apiNames.add(specifier.name.text);
        if (queryModules.includes(moduleName) && hookExports.has(importedName)) hookNames.add(specifier.name.text);
      }
    }
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) initializers.set(node.name.text, node.initializer);
    if (ts.isFunctionDeclaration(node) && node.name) namedFunctions.set(node.name.text, node);
    ts.forEachChild(node, facts);
  };
  facts(source);

  const resolveCallbacks = (expression: ts.Expression, seen = new Set<string>()): void => {
    if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression) || ts.isSatisfiesExpression(expression)) { resolveCallbacks(expression.expression, seen); return; }
    if (ts.isIdentifier(expression) && !seen.has(expression.text)) {
      seen.add(expression.text);
      const target = initializers.get(expression.text);
      if (target) resolveCallbacks(target, seen);
      const functionNode = namedFunctions.get(expression.text);
      if (functionNode) callbackNodes.add(functionNode);
    }
    if (ts.isArrowFunction(expression) || ts.isFunctionExpression(expression)) callbackNodes.add(expression);
    if (ts.isArrayLiteralExpression(expression)) for (const item of expression.elements) if (ts.isExpression(item)) resolveCallbacks(item, new Set(seen));
    if (ts.isObjectLiteralExpression(expression)) for (const property of expression.properties) {
      if (ts.isPropertyAssignment(property)) {
        const name = property.name.getText(source).replace(/^['"]|['"]$/g, '');
        if (['queryFn', 'mutationFn'].includes(name)) resolveCallbacks(property.initializer, new Set(seen));
        if (name === 'queries') resolveCallbacks(property.initializer, new Set(seen));
      } else if (ts.isMethodDeclaration(property) && ['queryFn', 'mutationFn'].includes(property.name.getText(source))) callbackNodes.add(property);
    }
  };
  const queryFacts = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const expr = node.expression;
      const hook = ts.isIdentifier(expr) ? hookNames.has(expr.text) : ts.isPropertyAccessExpression(expr) && ts.isIdentifier(expr.expression) && hookNamespaces.has(expr.expression.text) && hookExports.has(expr.name.text);
      if (hook) for (const argument of node.arguments) resolveCallbacks(argument);
    }
    ts.forEachChild(node, queryFacts);
  };
  queryFacts(source);
  const inCallback = (node: ts.Node): boolean => { for (let current: ts.Node | undefined = node.parent; current; current = current.parent) if (callbackNodes.has(current)) return true; return false; };

  const visit = (node: ts.Node): void => {
    if (ruleId === 'api-client-usage') {
      if (ts.isCallExpression(node)) {
        const expr = node.expression;
        if ((ts.isIdentifier(expr) && expr.text === 'fetch') || (ts.isPropertyAccessExpression(expr) && expr.name.text === 'fetch' && ['window', 'globalThis', 'self'].includes(expr.expression.getText(source)))) record('Use the configured API transport instead of direct fetch.', node);
        const apiCall = ts.isIdentifier(expr) ? apiNames.has(expr.text) : ts.isPropertyAccessExpression(expr) && ts.isIdentifier(expr.expression) && apiNamespaces.has(expr.expression.text) && !safeExports.has(expr.name.text);
        if (apiCall && options.requireQueryCallbacks === true && !inCallback(node)) record('Configured API client calls belong in queryFn/mutationFn callbacks.', node);
        if (ts.isIdentifier(expr) && expr.text === 'require' && node.arguments[0] && ts.isStringLiteral(node.arguments[0]) && stringList(options.forbiddenTransports, ['axios', 'node-fetch', 'cross-fetch', 'undici']).includes(node.arguments[0].text)) record('Import the configured API transport.', node);
      }
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && stringList(options.forbiddenTransports, ['axios', 'node-fetch', 'cross-fetch', 'undici']).includes(node.moduleSpecifier.text)) record('Import the configured API transport.', node);
    }
    if (ruleId === 'api-error-codes' && ts.isPropertyAssignment(node) && node.name.getText(source).replace(/^['"]|['"]$/g, '') === String(options.property ?? 'code') && (ts.isStringLiteral(node.initializer) || ts.isNoSubstitutionTemplateLiteral(node.initializer))) record('Use a shared error-code constant instead of a literal.', node.initializer);
    if (ruleId === 'frontend-i18n-copy') {
      if (ts.isJsxText(node) && /[A-Za-z]/.test(node.getText(source))) record('Route user-facing JSX copy through the configured translation boundary.', node);
      if (ts.isJsxAttribute(node) && (stringList(options.copyAttributes).length ? stringList(options.copyAttributes) : [...copyAttributes]).includes(node.name.getText(source)) && node.initializer) {
        const value = ts.isStringLiteral(node.initializer) ? node.initializer.text : ts.isJsxExpression(node.initializer) && node.initializer.expression && (ts.isStringLiteral(node.initializer.expression) || ts.isNoSubstitutionTemplateLiteral(node.initializer.expression)) ? node.initializer.expression.text : '';
        if (/[A-Za-z]/.test(value)) record('Translate the user-facing attribute value.', node);
      }
    }
    if (ruleId === 'frontend-error-surfaces') {
      if (ts.isPropertyAccessExpression(node) && node.name.text === 'message' && ts.isIdentifier(node.expression) && ['err', 'error'].includes(node.expression.text)) record('Use the configured user-facing error mapper instead of raw error.message.', node);
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && ['toErrorMessage', 'getErrorMessage'].includes(node.expression.text)) record('Use the shared user-facing error mapper.', node);
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'String' && node.arguments[0] && ['err', 'error'].includes(node.arguments[0].getText(source))) record('Use the shared user-facing error mapper instead of String(error).', node);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return result;
}

export function checkTypeScriptRules(context: RuleContext): PolicyDiagnostic[] {
  const result: PolicyDiagnostic[] = [];
  for (const id of codeRuleIds) {
    const options = optionsFor(context, id);
    if (!options) continue;
    try {
      const roots = Array.isArray(options.roots) ? stringList(options.roots) : [...new Set([...(context.config.source?.roots ?? ['src']), ...Object.keys(context.config.source?.scopes ?? {})])];
      const excluded = stringList(options.exclude, ['**/*.test.*', '**/*.spec.*', '**/*.messages.*']);
      const allowed = stringList(options.allowlist);
      for (const file of collectFiles(context.root, roots, context.config.ignore)) {
        const relative = posix(path.relative(context.root, file));
        if (!sourceExtensions.test(file) || matchesAny(relative, excluded) || matchesAny(relative, allowed)) continue;
        if (id === 'frontend-i18n-copy' && !/\.[jt]sx$/.test(file)) continue;
        const scoped = scopedOptions(context, relative, id, options);
        if (!scoped || matchesAny(relative, stringList(scoped.exclude)) || matchesAny(relative, stringList(scoped.allowlist))) continue;
        result.push(...inspectSource(context, file, id, scoped));
      }
    } catch (error) { result.push(diagnostic(id, '.', error instanceof Error ? error.message : String(error), { severity: 'error' })); }
  }
  return result;
}
