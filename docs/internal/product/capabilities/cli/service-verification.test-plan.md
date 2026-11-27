# CLI service verification plan

<!-- mdcomposer:meta
title: "CLI service verification plan"
kind: test-plan
state: draft
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Contract and evidence boundary

The owner requires tests for every service. This matrix inventories all twelve current .service.ts modules and their identifiable existing evidence. It is an audit of obligations, not a measured coverage percentage or a claim that every planned case passed. Existing suites are src/index.test.ts, package.test.ts and src/rules/policy.service.test.ts.

## Service inventory

| Service | Observed evidence and remaining gap | Expected contract |
| --- | --- | --- |
| checking.service.ts | 6 direct cases: structure/routing/links/tokens, amendment notes, config/manifest/template refusal; plus existing API/policy cases. | [contract owner](checking/checking.design.md) |
| decisions.service.ts | 5 direct cases: malformed/missing/valid-empty package evidence, actual inspect/questions read-only behavior and filesystem refusal; 4 pass, 1 POSIX permission case skipped on Windows. | [contract owner](inspection/inspection.design.md) |
| distribution.service.ts | 5 direct cases: explicit source/version precedence, catalog/question schemas and identity, contained asset paths and missing sources. | [contract owner](services/distribution/distribution.design.md) |
| export.service.ts | 7 direct cases: exact catalog/provenance/hash bytes, dry-run/repeat, differing output, missing/empty SKILL/dependencies and injected partial-write reporting. | [contract owner](skill-export/skill-export.design.md) |
| filesystem.service.ts | 8 direct cases: path/root normalization, escapes/junctions, hashes/serialization, guarded reads/walks, collision checks and exclusive-write preservation. | [contract owner](services/filesystem/filesystem.design.md) |
| markdown.service.ts | 8 direct cases: headings/fragments, located malformed/missing/unsafe links, unique targets, exact rebasing/composition/fenced preservation and BOM bytes. | [contract owner](markdown/markdown.design.md) |
| migration.service.ts | 6 direct cases plus API integration: no-op/dry-run, binary/mixed operations, whole-state refusal, tampered journals, stale inputs and protected rollback/resume. | [contract owner](migration/migration.design.md) |
| naming.service.ts | 4 direct cases: independent casing/type roles, invalid IDs/kinds and required-host/explicit-role rename preservation. | [contract owner](services/naming/naming.design.md) |
| planning.service.ts | 10 direct cases: 7 story/bootstrap/override/preservation and 3 pure configuration/cross-scope/tooling validation cases; public API plan integrity is also covered. | [contract owner](planning/planning.design.md) |
| rules/policy.service.ts | 17 direct cases: every declared default kind, metadata/state/audience/archive, selected source rules and mechanism-specific review helpers. | [contract owner](checking/checking.design.md) |
| rules/shared.service.ts | 8 direct cases: glob/path semantics, real collection/exclusions, containment/junction refusal, diagnostic locations/severity and option normalization. | [contract owner](services/policy-support/policy-support.design.md) |
| testing.service.ts | 9 direct/process cases: policy/default/scope validation, heuristic layout evidence, custom input and actual init preservation. | [contract owner](services/testing/testing.design.md) |

## Delivery acceptance

The owner-local foundation packet (archived; see historical context) assigns FND-02/FND-03 to focused coverage gaps and FND-01 to the remaining malformed-package finding. The default-kind divergence is already fixed and verified. Add meaningful tests for each service with independent expected values, relevant invalid/refusal cases and explicit effect/preservation assertions. Use a colocated <responsibility>.service.test.ts file beside its implementation, retaining existing public API/package consumer suites beside their owners. The local [testing philosophy](../../../philosophies/stavel-testing.philosophy.md) owns placement; that filename choice does not replace behavioral evidence.

Use real temporary filesystems for containment/mutation/recovery and actual built processes for adapter argument/output/exit behavior. Mock only an actual external boundary when useful; do not mock away the contract being evaluated. Include deterministic pure-function examples and supported platform differences. Record deliberate not-applicable cases with reasons rather than manufacturing meaningless negative tests.

Run npm test and npm run check with focused evidence. Maintain compile/API checks for types and barrels, actual process cases for the CLI adapter, and packed/relocated checks at distribution boundaries. Those files are not extra service modules. New or changed service behavior supplies tests in its delivery increment; existing missing evidence remains visible until exercised.

## Limitations

The retained 67-test baseline is integration-heavy. Nine additional colocated testing-service cases now establish placement policy/evidence and init preservation boundaries; they do not close every older service contract or prove agent compliance. Documentation checks cannot establish per-service behavior. Close GW-35 only with an explicit service-to-case-to-result map and actual outcomes; no test-file-presence gate is claimed as semantic enforcement.

Current source mode help has a colocated CLI process case; current story/template groundwork adds seven planning cases and one public-kind regression. These are bounded evidence, not proof of full workflow orchestration or all older service contracts.


## Executed foundation scope

Foundation verification (archived; see historical context) records delivered FND-01/02/03 evidence. All twelve current service modules have colocated direct suites (93 declared cases), with API/CLI/package integration retained. Final local suite: 145 total, 144 passed, zero failed, one explicit Windows permission skip. This is contract assurance for current behavior, not exhaustive coverage or a pass for the unrun platform matrix/new workflow features.

## Guided workflow service coverage

The foundation table above records its original twelve-module scope. New source services also have direct colocated behavioral suites: configuration (pin/topic/override/amendment/migration parity), artifact (families/owners/template preservation/links), guided (scope/session/terminal/headless/alignment), initialization (product facts/routing/registry), effects (provenance/input binding/binary recovery), doctor (findings/allowlisted repairs/stale and marker refusal), work (pointer readers/writers/schema/recovery), lifecycle (readiness/closure/stories/archive/VIBE) and help (availability/provenance/relocation). Actual integrated counts and limitations belong in the current execution verification, rather than replacing the historical foundation measurements.

## Final direct-service evidence inventory

| Source owner | Colocated test owner | Declared cases |
| --- | --- | --- |
| [src/artifact.service.ts](../../../../../src/artifact.service.ts) | [src/artifact.service.test.ts](../../../../../src/artifact.service.test.ts) | 26 |
| [src/checking.service.ts](../../../../../src/checking.service.ts) | [src/checking.service.test.ts](../../../../../src/checking.service.test.ts) | 7 |
| [src/configuration.service.ts](../../../../../src/configuration.service.ts) | [src/configuration.service.test.ts](../../../../../src/configuration.service.test.ts) | 27 |
| [src/decisions.service.ts](../../../../../src/decisions.service.ts) | [src/decisions.service.test.ts](../../../../../src/decisions.service.test.ts) | 5 |
| [src/distribution.service.ts](../../../../../src/distribution.service.ts) | [src/distribution.service.test.ts](../../../../../src/distribution.service.test.ts) | 5 |
| [src/doctor.service.ts](../../../../../src/doctor.service.ts) | [src/doctor.service.test.ts](../../../../../src/doctor.service.test.ts) | 10 |
| [src/effects.service.ts](../../../../../src/effects.service.ts) | [src/effects.service.test.ts](../../../../../src/effects.service.test.ts) | 4 |
| [src/export.service.ts](../../../../../src/export.service.ts) | [src/export.service.test.ts](../../../../../src/export.service.test.ts) | 7 |
| [src/filesystem.service.ts](../../../../../src/filesystem.service.ts) | [src/filesystem.service.test.ts](../../../../../src/filesystem.service.test.ts) | 8 |
| [src/guided.service.ts](../../../../../src/guided.service.ts) | [src/guided.service.test.ts](../../../../../src/guided.service.test.ts) | 17 |
| [src/help.service.ts](../../../../../src/help.service.ts) | [src/help.service.test.ts](../../../../../src/help.service.test.ts) | 8 |
| [src/initialization.service.ts](../../../../../src/initialization.service.ts) | [src/initialization.service.test.ts](../../../../../src/initialization.service.test.ts) | 5 |
| [src/lifecycle.service.ts](../../../../../src/lifecycle.service.ts) | [src/lifecycle.service.test.ts](../../../../../src/lifecycle.service.test.ts) | 42 |
| [src/markdown.service.ts](../../../../../src/markdown.service.ts) | [src/markdown.service.test.ts](../../../../../src/markdown.service.test.ts) | 8 |
| [src/migration.service.ts](../../../../../src/migration.service.ts) | [src/migration.service.test.ts](../../../../../src/migration.service.test.ts) | 13 |
| [src/naming.service.ts](../../../../../src/naming.service.ts) | [src/naming.service.test.ts](../../../../../src/naming.service.test.ts) | 4 |
| [src/planning.service.ts](../../../../../src/planning.service.ts) | [src/planning.service.test.ts](../../../../../src/planning.service.test.ts) | 10 |
| [src/rules/policy.service.ts](../../../../../src/rules/policy.service.ts) | [src/rules/policy.service.test.ts](../../../../../src/rules/policy.service.test.ts) | 17 |
| [src/rules/shared.service.ts](../../../../../src/rules/shared.service.ts) | [src/rules/shared.service.test.ts](../../../../../src/rules/shared.service.test.ts) | 8 |
| [src/testing.service.ts](../../../../../src/testing.service.ts) | [src/testing.service.test.ts](../../../../../src/testing.service.test.ts) | 15 |
| [src/work.service.ts](../../../../../src/work.service.ts) | [src/work.service.test.ts](../../../../../src/work.service.test.ts) | 20 |

The 21 modules have 266 declared direct cases. Integrated API/CLI/package cases and the explicit Windows skip are recorded in the coordination verification. Case count alone does not establish semantic correctness.

## Historical context (archived)

- [owner-local foundation packet](../../../_archive/product/capabilities/cli/services/execution/foundations/foundations.execution-plan.md)
- [Foundation verification](../../../_archive/product/capabilities/cli/services/execution/foundations/foundations.verification.md)

## IDEA and guard delivery increment

The inventories above retain their historical counts. The current increment adds idea.service with 26 colocated cases and git-guard.service with 21, extends work to 24 cases, and adds readiness/doctor, CLI, help and artifact regression coverage beside their owners. [Current slice-to-evidence verification](../skill/guided-workflows/ideas-delivery.verification.md) records the actual final 387-test result (386 passed, one existing Windows permission skip) and 22 real commands on each Windows/Linux exported artifact. Every new service has behavioral preservation/refusal tests; no file-presence-only enforcement claim is made.
