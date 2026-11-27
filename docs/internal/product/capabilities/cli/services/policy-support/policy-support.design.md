# Policy service and shared rule helpers

<!-- mdcomposer:meta
title: "Policy service and shared rule helpers"
kind: design
state: draft
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Shared responsibility

Rule policy orchestration belongs to the checking feature. Shared rule helpers own glob/path matching, file collection, located diagnostic construction and option normalization; individual rule modules own their specific checks. Neither is an independent product feature just because it has a source file.

Implementation: [src/rules/shared.service.ts](../../../../../../../src/rules/shared.service.ts). This document records the local boundary and verification obligations, not a claim that a filename proves architecture.

## Behavioral verification

Maintain direct behavioral tests for policy.service.ts plus helper boundaries: glob/path normalization, exclusions/collection, severity/location and option fallback. Existing policy tests exercise many consumer cases; verify missing helper contracts and the reproduced default-kind drift explicitly.

[Service verification matrix](../../service-verification.test-plan.md) owns the explicit coverage gaps. Reuse fixtures where useful; test outcomes rather than private implementation shape.

## Consumers and change contract

[CLI architecture](../../cli.design.md) maps consumers and source ownership. Preserve accepted effects/errors and public-library consumers during changes. Material boundary changes update this owner and affected feature docs; shared definitions are not copied into every feature.
