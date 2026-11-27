# Repository checks and policy rules

<!-- mdcomposer:meta
title: "Repository checks and policy rules"
kind: design
state: draft
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Scope and current evidence

Interface: check; rules list. This feature owns the responsibility below. Existing behavior is observed from the linked source and tests; future changes require their actual accepted contract.

Resolve the current manifest/config/distribution, check required routing and Markdown references, report amendments and run selected policy modules. rules list exposes versioned rule identities. Rule implementation is under src/rules.

## Decisions, constraints and rationale

Structural diagnostics do not establish semantic acceptance or agent fidelity. Missing, malformed and conflicting configuration must remain actionable. The default-kind fallback divergence is a reproduced gap owned by S-01.

## Verification and gaps

Existing framework and policy suites cover routing, links/fragments, identity, naming, metadata, audiences, archives and optional source rules. Maintain focused checkRepository and policy-service contracts, plus shared-rule helper tests and actual CLI exit/output cases.

## Story/template validation update

Default kind validation now consumes the default profile's canonical registry, including story. The configured story template must exist and declare kind: template; it is treated as intentional placeholder-bearing template content even outside the standard template directory. Current policy/planning tests verify kind consistency and missing/misclassified template diagnostics. The malformed-package inspection gap remains a separate unresolved foundation issue.

## Planned delivery and owners

S-01 fixes fallback drift; S-06 builds doctor on mechanical findings plus explicitly review-required semantic work.

[source boundary](../../../../../../src/checking.service.ts) | [CLI architecture](../cli.design.md) | [public CLI contract](../../../../../public/framework-cli.contract.md) | [initiative requirements](../../skill/guided-workflows/guided-workflows.requirements.md)
