# Adoption and migration planning

<!-- mdcomposer:meta
title: "Adoption and migration planning"
kind: design
state: draft
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Scope and current evidence

Interface: plan; migrate plan. This feature owns the responsibility below. Existing behavior is observed from the linked source and tests; future changes require their actual accepted contract.

Resolve aligned answers, selected catalog assets, owner mappings and naming into a serialized hash-bound MigrationPlan. Read source/target bytes, calculate explicit operations and diagnostics; validate plan identity and digest before use.

## Decisions, constraints and rationale

Planning does not apply target changes. Preserve required host files, accepted owners, license and actual acceptance evidence. The existing plan command remains adoption/migration planning; feature PLAN is an agent workflow with a distinct design owner.

## Verification and gaps

Existing tests cover all adoption tracks, alignment, mapping, casing, exact source selection, stale/integrity checks and preserved user instructions. Focused tests must isolate configurationForAnswers, validateAnswers, createPlan and plan integrity against independent expected outcomes.

## Repository-owned template behavior

The story template's repository-template catalog role seeds it once, then preserves target bytes and excludes it from immutable upstream manifest hashes. Plan input hashes still protect edits after preview. Current colocated planning-service tests cover actual init, repeats, custom overrides, mapped destinations and refusal paths. Generic managed framework docs are excluded from application capability heuristics so they do not invent new persistence questions on repeat; actual new application source still does.

## Planned delivery and owners

S-02/S-03 integrate resolved configuration/catalog behavior. S-07 owns feature PLAN orchestration; do not replace the current command contract.

[source boundary](../../../../../../src/planning.service.ts) | [CLI architecture](../cli.design.md) | [public CLI contract](../../../../../public/framework-cli.contract.md) | [initiative requirements](../../skill/guided-workflows/guided-workflows.requirements.md)

[Feature planning and execution workflow](../../skill/guided-workflows/delivery-workflows.design.md)
