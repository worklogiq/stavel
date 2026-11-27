# Plan application, verification and recovery

<!-- mdcomposer:meta
title: "Plan application, verification and recovery"
kind: design
state: draft
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Scope and current evidence

Interface: apply; verify; migrate apply/resume/rollback. This feature owns the responsibility below. Existing behavior is observed from the linked source and tests; future changes require their actual accepted contract.

Preflight plan identity, paths, input hashes and destinations; apply explicit transitions, retain recovery journals, verify expected after-state and resume/roll back supported interrupted operations.

## Decisions, constraints and rationale

A dry-run creates no target files or journal. Stale plans, symlink/junction traversal, collisions and intervening edits refuse rather than overwrite. Journals support recovery; their existence alone does not prove crash durability or a transaction.

## Verification and gaps

Existing tests exercise stale inputs, plan integrity, partial resume/rollback, edits after migration, case-only moves, rename cycles and legacy identity. Keep focused before/after byte assertions and real temporary filesystems for every mutation/refusal boundary.

## Planned delivery and owners

S-06/S-10 reuse this engine where suitable. New repairs/status migrations need their own supported-version and interruption acceptance.

[source boundary](../../../../../../src/migration.service.ts) | [CLI architecture](../cli.design.md) | [public CLI contract](../../../../../public/framework-cli.contract.md) | [initiative requirements](../../skill/guided-workflows/guided-workflows.requirements.md)
