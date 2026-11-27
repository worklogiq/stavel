# Document naming transformations

<!-- mdcomposer:meta
title: "Document naming transformations"
kind: design
state: draft
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Shared responsibility

Own identifier casing, typed document filename generation, fixed host exceptions and explicit known-kind checks for renames. Documentation naming stays separate from scoped source naming; its use in planning does not authorize source renames.

Implementation: [src/naming.service.ts](../../../../../../../src/naming.service.ts). This document records the local boundary and verification obligations, not a claim that a filename proves architecture.

## Behavioral verification

Test camel/snake/kebab/Pascal/any modes, declared generator casing, empty/invalid IDs, invalid kinds, host exceptions and unknown-role refusal. Existing tests call documentFilename and mapped plans; every helper boundary is not yet demonstrated independently.

[Service verification matrix](../../service-verification.test-plan.md) owns the explicit coverage gaps. Reuse fixtures where useful; test outcomes rather than private implementation shape.

## Consumers and change contract

[CLI architecture](../../cli.design.md) maps consumers and source ownership. Preserve accepted effects/errors and public-library consumers during changes. Material boundary changes update this owner and affected feature docs; shared definitions are not copied into every feature.
