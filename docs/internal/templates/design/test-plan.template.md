# {{CAPABILITY}} test plan

<!-- mdcomposer:meta
title: "{{CAPABILITY}} test plan"
kind: "template"
state: "draft"
audience: "public"
owner: "{{OWNER}}"
updated: "2026-11-25"
-->

<!-- Template output: save as identifier.test-plan.md, replace placeholders, then record real acceptance. -->

Status: draft. Contract: {{REQUIREMENTS}}. Owner: {{OWNER}}.

## Acceptance coverage

| Requirement / defining property | Input and setup | Independent expected result | Check and layer | Environment |
| --- | --- | --- | --- | --- |
| R-01 | Fixed case | Reference or invariant | Behavior / contract / integration | Supported setup |

## Failure and recovery

Cover relevant invalid input, unavailable dependencies, authorization, persistence, restart, cancellation, concurrency, and rollback boundaries. Scope checks to the actual change.

## Empirical claims

If applicable, record dataset/version, held-out split, baseline, metrics, repetitions, cost model, and uncertainty. Separate conformance from performance.

## Commands and limitations

List real commands, manual procedures where needed, evidence outputs, and unsupported or deferred coverage. Do not select a new test stack solely for this framework.
