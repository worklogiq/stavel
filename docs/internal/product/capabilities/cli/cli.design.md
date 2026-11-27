# CLI architecture and service ownership

<!-- mdcomposer:meta
title: "CLI architecture and service ownership"
kind: design
state: draft
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Authority and conventions

The owner on 2026-11-26 explicitly identified the CLI as a separate capability, requested feature-level design owners and required CLI philosophy/service tests. This applies the existing product/capabilities/contracts model to observed behavior. The [CLI philosophy](../../../philosophies/cli-tools.philosophy.md) supplies portable principles; this document selects local TypeScript conventions. Current code is evidence, not automatic acceptance of every implementation detail.

## Adapter and services

The command adapter in [stavel.cli.ts](../../../../../src/stavel.cli.ts) parses arguments, maps command actions, renders output/errors/exits and delegates reusable work. Current init orchestration and docs process launching live there. Grow those boundaries deliberately; do not duplicate validation in skill/terminal adapters or force orchestration tests to mock away real effects.

Locally, .service.ts denotes a functional module with a cohesive operational responsibility and exported functions. It does not mean a remote service, class or microservice. Preserve this existing convention while documenting each boundary. A new generic helper must have a real role rather than receiving the suffix automatically. This is the rationale adopted now; the original author's unrecorded rationale is not asserted as historical fact.

Feature docs map observable behaviors; shared services can support multiple features. Keep src/framework.types.ts as the type/schema interface owner and src/index.ts as the public export barrel, linked to shared contracts. These are not service modules and do not need artificial service tests. Test compatibility at compile/API boundaries.

## Complete service ownership map

| Source module | Canonical design owner |
| --- | --- |
| [src/checking.service.ts](../../../../../src/checking.service.ts) | [checking](checking/checking.design.md) |
| [src/decisions.service.ts](../../../../../src/decisions.service.ts) | [inspection](inspection/inspection.design.md) |
| [src/distribution.service.ts](../../../../../src/distribution.service.ts) | [services](services/distribution/distribution.design.md) |
| [src/export.service.ts](../../../../../src/export.service.ts) | [skill-export](skill-export/skill-export.design.md) |
| [src/filesystem.service.ts](../../../../../src/filesystem.service.ts) | [services](services/filesystem/filesystem.design.md) |
| [src/markdown.service.ts](../../../../../src/markdown.service.ts) | [markdown](markdown/markdown.design.md) |
| [src/migration.service.ts](../../../../../src/migration.service.ts) | [migration](migration/migration.design.md) |
| [src/naming.service.ts](../../../../../src/naming.service.ts) | [services](services/naming/naming.design.md) |
| [src/planning.service.ts](../../../../../src/planning.service.ts) | [planning](planning/planning.design.md) |
| [src/rules/policy.service.ts](../../../../../src/rules/policy.service.ts) | [checking](checking/checking.design.md) |
| [src/rules/shared.service.ts](../../../../../src/rules/shared.service.ts) | [services](services/policy-support/policy-support.design.md) |
| [src/testing.service.ts](../../../../../src/testing.service.ts) | [testing policy and inspection](services/testing/testing.design.md) |

The capability documentation correction did not refactor implementation boundaries. The subsequent authorized test-placement task moved existing suites beside their actual owners and added the testing service with colocated tests. Documentation ownership does not require changing public imports or making every implementation file a product feature. New services must add their contract/test owner; feature growth can justify a new owner directory without copying shared definitions.

## Effects, compatibility and verification

The [CLI contract](../../../../public/framework-cli.contract.md) owns shipped commands, outputs and effects. Persistence/configuration and portable distribution definitions remain shared contract topics. Preserve existing automation and both public library formats when refactoring. Planned feature docs explicitly identify unimplemented behavior.

The [service verification plan](service-verification.test-plan.md) owns the test matrix. Each service needs identifiable focused behavioral coverage and relevant refusal/failure cases, with temporary real filesystem/process cases at side-effect boundaries. Existing aggregate tests remain useful; dedicated service contract gaps are explicit planned work in S-11. Tests named after files are insufficient without independent observable expectations.

## Decisions and tradeoffs

Selected local organization: CLI and skill are sibling capabilities; CLI feature folders own design/decision/acceptance references; shared service contracts live under services; guided workflows is a feature under skill. One cross-capability initiative remains at that feature owner. This follows the user's instruction without an unrelated source refactor.

The existing broad services and adapter may merit future decomposition when evidence exposes mixed responsibilities. Record that change with its consumers and tests; do not silently rename/refactor modules during a documentation move. CLI feature and library boundaries remain compatible until a separately verified change establishes otherwise.

Story bootstrap extends the existing planning/checking services: editable repo-owned templates, configured policy/refusal and shared kind registry validation. Mode summaries are currently static CLI help reused by skill guidance. No new service or command executor is implied.


## Execution packet for this owner

CLI foundations and service contracts execution plan (archived; see historical context) links concrete source slices, prerequisites, acceptance and scoped design inputs. The initiative coordination packet owns the cross-packet graph; no parallel lifecycle/status owner is introduced here.

## Historical context (archived)

- [CLI foundations and service contracts execution plan](../../../_archive/product/capabilities/cli/services/execution/foundations/foundations.execution-plan.md)
