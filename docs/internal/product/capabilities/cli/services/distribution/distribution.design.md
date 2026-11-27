# Distribution and catalog resolution

<!-- mdcomposer:meta
title: "Distribution and catalog resolution"
kind: design
state: draft
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Shared responsibility

Locate explicit or relocatable package/skill asset roots; validate product/schema and contained asset paths; load baseline configuration, questions and version evidence. This is reused by planning, checking, decisions and export.

Implementation: [src/distribution.service.ts](../../../../../../../src/distribution.service.ts). This document records the local boundary and verification obligations, not a claim that a filename proves architecture.

## Behavioral verification

Test an explicit valid root, missing/incomplete assets, unsupported product/schema, unsafe asset paths, missing versions and packed/relocated discovery. Existing catalog-refusal and offline packaging cases provide integration evidence; focused resolver fixtures remain to be completed.

[Service verification matrix](../../service-verification.test-plan.md) owns the explicit coverage gaps. Reuse fixtures where useful; test outcomes rather than private implementation shape.

## Consumers and change contract

[CLI architecture](../../cli.design.md) maps consumers and source ownership. Preserve accepted effects/errors and public-library consumers during changes. Material boundary changes update this owner and affected feature docs; shared definitions are not copied into every feature.
