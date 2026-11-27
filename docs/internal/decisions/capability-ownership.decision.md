# CLI capability and feature documentation ownership

<!-- mdcomposer:meta
title: "CLI capability and feature documentation ownership"
kind: decision
state: accepted
audience: internal
owner: repository-maintainer
updated: 2026-11-26
acceptance: "user:2026-11-26:proactive-capability-and-feature-ownership"
-->

## Decision and source

On 2026-11-26 the owner explicitly corrected the skill-only product inventory after inspecting the CLI service files. CLI is a sibling capability; meaningful CLI features need their own design/decision homes; guided workflows is a feature under skill. Stavel must discover these responsibilities proactively or ask about material ambiguity. CLI philosophy must explain service naming and require meaningful tests for every service.

## Applied local organization

- [CLI](../product/capabilities/cli/index.md) owns feature designs for inspection, planning, initialization, migration, checking, Markdown tooling, skill export and help, plus explicitly planned doctor and work-management behavior.
- Shared filesystem, naming, distribution and policy-support responsibilities have single service-contract owners. The [architecture](../product/capabilities/cli/cli.design.md) maps all eleven current service modules; a source file is not automatically a product feature.
- [Guided workflows](../product/capabilities/skill/guided-workflows/index.md) owns the current cross-capability initiative and its execution packet. Capability status stays at the skill owner; the registry gains a reference to CLI's status without duplicating initiative state.
- The source skill and portable [ownership](../philosophies/capability-ownership.philosophy.md)/[CLI](../philosophies/cli-tools.philosophy.md) guidance now route agents through these discovery and verification obligations. Target-specific owner paths and source naming remain configurable.

The local convention preserves .service.ts as a cohesive functional-module responsibility, with reusable operations separate from argument/output/exit handling. It does not require remote services, classes or an unrelated source refactor. This records the rationale adopted now; no undocumented original rationale is invented.

## Migration and evidence boundary

A hash-bound migration moved 22 documents into the guided-workflows feature and updated ten referring/owner records. Its dry-run preserved 166 inputs and created no destination/journal. Immediate apply/verify succeeded; 44 other non-Markdown inputs retained their hashes. The skill status record's owner-relative references were explicitly rebased. Local plan/recovery evidence is .cache/guided-feature.plan.json and .cache/guided-feature-migration.journal.json. Later prose changes are intentional; recovery must protect those edits.

The [service verification plan](../product/capabilities/cli/service-verification.test-plan.md) identifies existing integration evidence and focused gaps. S-11 plans actual gap closure; adding docs does not create missing tests. Structured discovery/diagnostic support remains GW-34/D-15 work. No new CLI commands, mode orchestration, release or host skill replacement is established by this local documentation/skill-source correction.

## Consequences

Product navigation and future agents can find feature-local intent, decisions, source boundaries and test obligations. One shared initiative coordinates changes across owners. New features update this ownership map as part of normal work; meaningful ambiguity is raised early while settled mappings are applied within authorization. Review the proposed boundaries with actual usage rather than validating their suitability from folder presence.
