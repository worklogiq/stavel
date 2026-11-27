# Repository inspection and aligned decisions

<!-- mdcomposer:meta
title: "Repository inspection and aligned decisions"
kind: design
state: draft
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Scope and current evidence

Interface: inspect; questions. This feature owns the responsibility below. Existing behavior is observed from the linked source and tests; future changes require their actual accepted contract.

Inspect instructions, structure, tool evidence and bounded Git history; expand/validate applicable answers and return unresolved questions. Inputs include root, track, catalog and optional answer records. Outputs distinguish observations, missing choices and aligned decisions.

## Decisions, constraints and rationale

Inspection/questions read without adopting the target. Existing policy and actual user instructions can settle choices; detected patterns and commit subjects do not establish acceptance. The current malformed-package JSON catch is a known diagnostic gap, not intended silent success.

## Verification and gaps

Existing framework tests cover read-only discovery, applicable decisions, actual alignment, malformed answer choices, source-language scope, identity and mapped owners. Add focused inspection/decision tests, including malformed versus absent package data and no writes.

## Planned delivery and owners

S-01 fixes the reproduced diagnostic gap; S-04 adds shared scope/Q&A. GW-34 adds proactive capability/feature ownership discovery.

[source boundary](../../../../../../src/decisions.service.ts) | [CLI architecture](../cli.design.md) | [public CLI contract](../../../../../public/framework-cli.contract.md) | [initiative requirements](../../skill/guided-workflows/guided-workflows.requirements.md)
