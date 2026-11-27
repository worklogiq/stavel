# Slice S03 packet catalog

<!-- mdcomposer:meta
title: "Slice S03 packet catalog"
kind: execution-slice
state: deprecated
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Superseded provisional work package

This S-03 record is retained as planning history, not an active execution slice or a completed implementation. The 2026-11-26 PLAN pass supersedes its broad scope with ART-01 (archived; see historical context), ART-02 (archived; see historical context). Use the [current coordination plan](./guided-workflows.execution-plan.md) for the active graph. Existing lower sections preserve earlier rationale; they do not override the new source records or accept unresolved design. No runtime completion is inferred.


Read the [shared execution contract](./index.md#shared-execution-contract) and [plan](./guided-workflows.execution-plan.md). This file owns S-03's status and eventual evidence.

Anchor identity for this slice is S-03. Title: Generalize and select design/execution packets.
prior-planning-status: superseded; not an execution result
Mode when authorized: STRICT MODE.

## Scope and decisions

Generalize relevant MenuLogiq artifact families, register their kinds/semantic targets, and render selected packets through the effective profile. Reuse existing owners and generic templates.

Required decisions: D-03 target/augmentation contract; accepted artifact-coverage and omission choices. Dependency ownership is in the [plan](./guided-workflows.execution-plan.md#ordered-slices-and-coverage).

## Contract to preserve

Language/provider/application choices stay local. Preserve requirements/decision evidence; omitted roles are explicit. Filled Stavel initiative docs are not portable templates.

## Steps

1. Map each source artifact family to a portable template, existing equivalent or documented omission; update origins and asset catalog together.
2. Implement artifact/section selection, augmentation and owner linking through stable IDs and resolved naming.
3. Render frontend, backend, CLI/library and mixed fixtures; validate links/metadata, omissions and export closure.

## Acceptance

- GW-26: Provide a generic cataloged product-overview template with aligned fields and canonical links; the filled Stavel overview is excluded from portable assets.

- GW-25: follow the selected product/capabilities/contracts semantic hierarchy, optional outer/deeper scopes and existing owner mappings. Use the [hierarchy design](../../../../../../../process/documentation-hierarchy.design.md); preserve owner-local delivery and the selected archive mirror.

- GW-24: template/packet placement honors the selected product capability home or configured alternative, updates links and retains existing canonical owners. Separate slice files and a macro tracker share a delivery directory that can later be archived as a unit.

- Coverage of the agreed design/execution families is explicit and usable.
- Task omission and standing section addition change the selected packet consistently without duplicate owners.
- Generated artifacts follow selected naming and state; no MenuLogiq-only paths/framework mandates leak into defaults.

- GW-30/GW-32/GW-33: Supply proportional artifacts and stable workflow targets for incremental PLAN, executor handoff and VIBE reconciliation; reuse existing canonical owners and preserve mode distinctions.

- GW-34: Generate feature-local docs under aligned semantic owners and link shared service contracts; avoid duplicating shared initiative requirements/trackers.

- GW-37: Preserve the cataloged repo-owned story template and its supported override/copy-once behavior; story outputs use canonical registered kinds and actual repo naming.

## Result and evidence

Not started. No implementation, feature-verification results or completion evidence yet. Record actual revision, changed locations, checks/results, omissions, deviations and next action here when executed.

Current bounded mode/help/story groundwork has [actual evidence](./workflow-story.verification.md); preserve it while implementing the remaining broader scope. The source prompts and static summary do not establish deterministic orchestration or observed agent conformance.

## Historical context (archived)

- [ART-01](../artifact-generation/art-01-portable-artifact-catalog.execution-slice.md)
- [ART-02](../artifact-generation/art-02-owner-aware-rendering.execution-slice.md)
