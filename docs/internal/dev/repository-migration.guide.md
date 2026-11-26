# Migrate repository conventions

<!-- mdcomposer:meta
title: "Migrate repository conventions"
kind: "guide"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Migration deliberately converts an existing repository to a specified default/profile version. Adoption retains existing conventions. The agent discovers intent and aligns mappings; the deterministic migrator executes only the concrete aligned plan.

## Plan

Inspect current owners, instructions, files, metadata, generated artifacts, links, source scopes, local modifications and relevant history. Gather all applicable [answers and alignment](agent-questions.guide.md) before generating target files. Resolve ambiguous ownership, conflicting definitions, uncertain approval states and unsupported reference syntax explicitly.

The plan records source/default versions, file hashes, chosen conventions, moves, content transformations, link/image/anchor/reference updates, generated navigation, agent routing, configuration changes, conflicts, deferrals and verification. Check all destinations, case-only renames, case-insensitive collisions and path containment before applying any planned changes.

## Apply and recover

Apply refuses stale source hashes or differing destination content. Journal operations and retain original content sufficient to resume or roll back a partial filesystem failure. Refusal detected during preflight happens before writes; an OS error during application can leave a partial migration, which must be reported honestly.

Resume verifies journal state and relevant hashes. Rollback checks for later user changes before restoring original paths/content. Never overwrite intervening work to simulate a clean rollback. A dry-run does not create directories, journals or answer files.

## Preserve meaning

Metadata conversion preserves actual acceptance and completion evidence. Rename document roles and relocate history without inventing approvals or rewriting discarded ideas into current policy. Keep execution status separate from document state. Preserve required algorithms, application behavior and data; a documentation migration is not authorization for an application redesign.

Verify the resulting links, headings, metadata, taxonomy, instructions, selected tooling and exported artifacts. Keep unmapped references and unavailable checks explicit. Versioned mappings also support future default@1 to later-default migrations.
