# Filesystem containment and preservation

<!-- mdcomposer:meta
title: "Filesystem containment and preservation"
kind: design
state: draft
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Shared responsibility

Own target-root normalization, contained relative paths, symlink/junction refusal, collision detection, hashes/canonical serialization, guarded file reads/walks and exclusive creation. These are shared operations consumed by several features; they are not a standalone CLI command.

Implementation: [src/filesystem.service.ts](../../../../../../../src/filesystem.service.ts). This document records the local boundary and verification obligations, not a claim that a filename proves architecture.

## Behavioral verification

Test relative/absolute/traversal/drive/NUL inputs, canonical aliases, symlink and parent-file cases, case-insensitive collisions, duplicate destinations, deterministic serialization and existing-file refusal with real temporary paths. Existing framework tests cover a subset through public operations; dedicated helper contracts remain incomplete.

[Service verification matrix](../../service-verification.test-plan.md) owns the explicit coverage gaps. Reuse fixtures where useful; test outcomes rather than private implementation shape.

## Consumers and change contract

[CLI architecture](../../cli.design.md) maps consumers and source ownership. Preserve accepted effects/errors and public-library consumers during changes. Material boundary changes update this owner and affected feature docs; shared definitions are not copied into every feature.
