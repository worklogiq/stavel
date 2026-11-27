# Slice S02 effective profile

<!-- mdcomposer:meta
title: "Slice S02 effective profile"
kind: execution-slice
state: deprecated
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Superseded provisional work package

This S-02 record is retained as planning history, not an active execution slice or a completed implementation. The 2026-11-26 PLAN pass supersedes its broad scope with CFG-01 (archived; see historical context), CFG-02 (archived; see historical context), CFG-03 (archived; see historical context). Use the [current coordination plan](./guided-workflows.execution-plan.md) for the active graph. Existing lower sections preserve earlier rationale; they do not override the new source records or accept unresolved design. No runtime completion is inferred.


Read the [shared execution contract](./index.md#shared-execution-contract) and [plan](./guided-workflows.execution-plan.md). This file owns S-02's status and eventual evidence.

Anchor identity for this slice is S-02. Title: Resolve structured amendments and shared capabilities.
prior-planning-status: superseded; not an execution result
Mode when authorized: STRICT MODE.

## Scope and decisions

Implement the accepted declarative amendment/effective-profile contract and shared workflow/artifact capability definitions, with provenance and consistent consumers. Keep reusable local record shape separate from unrequested registry infrastructure.

Required decisions: D-03 plus accepted compatibility/version strategy from D-08. Dependency ownership is in the [plan](./guided-workflows.execution-plan.md#ordered-slices-and-coverage).

## Contract to preserve

One canonical base and amendment source; task scope remains task-local; current instructions/authorization remain controlling. No silent last-writer-wins or arbitrary executable extension loading.

## Steps

1. Define/validate accepted IDs, versions, scope, applicability, origins, targets and allowed composition operations.
2. Resolve additive changes and diagnose conflicting replacements, removed targets, missing dependencies and incompatible upgrades.
3. Expose the effective result and origins for help, questions, generation and checks; preserve existing profile behavior.

## Acceptance

- GW-27: Implement the accepted repository-config resolver with baseline/provenance and scoped deterministic overrides, shared by consumers; do not maintain competing root and directory settings.

- GW-26: Resolve the product-overview role and configured root/naming through the same effective profile; preserve accepted existing overview mappings.

- GW-25: follow the selected product/capabilities/contracts semantic hierarchy, optional outer/deeper scopes and existing owner mappings. Use the [hierarchy design](../../../../../../../process/documentation-hierarchy.design.md); preserve owner-local delivery and the selected archive mirror.

- GW-24/D-10: represent the selected product capability home through a configurable semantic role, with explicit compatibility or reviewed migration for accepted platform/modules/edge mappings. The local source-doc move does not complete this runtime behavior.

- Equivalent inputs resolve deterministically with explainable origins.
- Task-only omission and standing addition have distinct persistence/scope; unsafe/unknown records refuse actionably.
- A changed upstream target yields a reviewed conflict/diff and preserves accepted local bytes.

- GW-36: Retain accepted testing policy and decision provenance through the shared future resolver; current validation/persistence must not reset explicit configuration to a default.

## Result and evidence

The broader package remains planned; separately verified GW-36 groundwork is linked below. No whole-package completion is claimed. Record actual revision, changed locations, checks/results, omissions, deviations and next action here when executed.

Bounded GW-36 groundwork now has [actual evidence](./test-placement.verification.md). This package remains planned for its wider accepted scope; do not discard the existing tested component or imply all remaining acceptance passed.

## Historical context (archived)

- [CFG-01](../../../../../contracts/configuration/execution/repository-configuration/cfg-01-effective-config-reader.execution-slice.md)
- [CFG-02](../../../../../contracts/configuration/execution/repository-configuration/cfg-02-config-migration-and-adoption.execution-slice.md)
- [CFG-03](../../../../../contracts/configuration/execution/repository-configuration/cfg-03-structured-amendments.execution-slice.md)
