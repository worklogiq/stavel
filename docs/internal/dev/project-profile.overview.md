# Stavel project profile

<!-- mdcomposer:meta
title: "Stavel project profile"
kind: "overview"
state: "accepted"
audience: "internal"
owner: "repository-maintainer"
updated: "2026-11-26"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

## Purpose and ownership

The [product overview](../product/product.overview.md) owns the product-level explanation, audience and scope. This profile maps local authority, conventions and commands.

Project: Stavel. Maintainer and acceptance authority: repository owner. Goal: preserve accepted intent across AI-assisted sessions with useful reusable tooling. Package version: 0.1.0. Default profile: default@1.

The owner's 2026-11-26 instruction selected a clean Stavel 0.1.0 restart on main. It retains the MenuLogiq-derived documentation taxonomy, independent documentation/source naming, Node tooling, question-led aligned adoption, generic migration, historical context, tool extraction and subagent delivery. It removes predecessor aliases and automatic legacy imports. See the [restart decision](../decisions/stavel-restart.decision.md).

## Canonical owners

The [constitution](../process/development-constitution.policy.md), [philosophies](../philosophies/index.md), [documentation policy](../process/documentation-taxonomy.policy.md), [default-conventions decision](../process/default-conventions.decision.md) and versioned configuration own portable behavior. Package [requirements](../product/contracts/framework/framework.requirements.md) and [design](../product/contracts/framework/framework.design.md) own release acceptance. [CLI behavior](../../public/framework-cli.contract.md) and actual command help own executable usage.

The [work registry](../work-index.json) references capability-owned status files for current work state, phase and next action. It does not duplicate status. The implemented work CLI reads/manages versioned source records; query summaries remain transient.

This filled profile and package acceptance documents are local to Stavel and excluded from adopter assets.

## Environment and verification

Use supported Node LTS, npm install, npm run build, npm test and npm run check. TypeScript is this toolkit's implementation choice, not a requirement for adopting applications. Generated bundles and dependencies are development artifacts. Do not claim a check passed unless it ran.

## Local choices and boundaries

The owner's 2026-11-26 [documentation-home decision](../decisions/product-documentation-home.decision.md) selects [product](../product/index.md) as this repository's capability home. The current source documents use explicit capabilities and contracts branches. Skill and CLI are sibling current capabilities. The skill/guided-workflows feature owns the cross-capability separate-slice delivery directory; common framework and distribution contract topics have their own canonical homes. Configurable adopter defaults and neutral role keys are delivered under GW-24; current execution verification records the supported runtime scope. Current source slice/manifest records and execution verification own actual delivery readiness. The owner's later explicit test-placement task additionally produced bounded source/configuration changes with verification (archived; see historical context); it does not authorize unrelated feature execution.

Use main as the default branch and reviewable task branches for subsequent changes; do not commit/push to main or merge without authorization. The current restart task authorizes the initial Stavel main history and its completion commits. Publication is distinct from source delivery or releasing a consumer application; npm publication and its release pipeline remain deferred. Keep the portable export sourced from explicit asset catalog entries and include every executable dependency needed after relocation.

Deferred publication work is bounded by the [dependency snapshot contract](../product/contracts/distribution/dependency-snapshots.contract.md). Accepted requirements are distinct from completion evidence.

## CLI implementation conventions

Follow the [CLI architecture](../product/capabilities/cli/cli.design.md), [feature owners](../product/capabilities/cli/index.md) and portable [CLI philosophy](../philosophies/cli-tools.philosophy.md). Here .service.ts means a cohesive functional module, not a network service or mandatory class. CLI adapters handle arguments/output/exits; reusable operations own validation, effects and domain behavior. Shared helpers have explicit owners.

Every service requires identifiable meaningful behavioral tests and relevant failure/refusal cases. The [service verification plan](../product/capabilities/cli/service-verification.test-plan.md) maps the original twelve modules and new guided services to identifiable evidence; FND-02/FND-03 (archived; see historical context) record delivered foundation assurance. New/changed service behavior includes tests in its delivery increment. Existing suite success is not a claim that focused service coverage is complete.

## Hash-bound records in Git

The default text policy remains LF. The local .gitattributes exceptions preserve exact bytes for the pinned baseline snapshot, product-mirror archived evidence and the currently pinned guided-workflows design. Whitespace checks recognize preserved CRLF while still checking trailing spaces. The authorized 2026-11-27 pre-commit review found that automatic normalization would otherwise invalidate recorded design, review, dependency and execution-proof hashes. This repair's rule selection involved nondeterministic agent judgment; staged-byte validation verifies the concrete preservation result. Do not regenerate historical hashes to disguise line-ending conversion. These local exceptions are not portable adopter defaults.

## Local test placement

The owner's 2026-11-26 instruction selects colocated test files under the [local testing philosophy](../philosophies/stavel-testing.philosophy.md). Focused service tests append .test before .ts, public API integration tests live at src/index.test.ts, and package checks at package.test.ts. The runner discovers colocated files and excludes dependencies/generated/cache paths; declaration generation excludes test sources. This local choice stays out of generic adopter assets.

The [placement guide](test-placement.guide.md) owns adopter choices and current answers-driven init support. Generic defaults follow repository conventions with a language-convention fallback; Stavel's own colocation preference is not imposed on other repositories.

## Guided workflow adoption

The owner accepted the eight execution contracts and amendments (archived; see historical context). Committed .stavel-config pins the selected defaults, actual product/CLI/skill/feature/contract owners, colocated tests and work-registry route. The CLI source schema migration converted registry/capability records explicitly to version 2, preserving actual history. AI-authored local policy mapping is labeled separately from deterministic serialization/application. The accountable capability status and execution verification own current completion/next action; no earlier provisional sentence supplies current readiness.

## Historical context (archived)

The completed [Stavel restart record](../_archive/delivery/stavel-restart.execution-plan.md) contains the implementation, consumer, installed-skill and repository-retirement evidence.

- [FND-02/FND-03](../_archive/product/capabilities/cli/services/execution/foundations/foundations.execution-plan.md)

- [verification](../_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/test-placement.verification.md)
- [eight execution contracts and amendments](../_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/execution-acceptance.decision.md)
