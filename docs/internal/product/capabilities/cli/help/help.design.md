# Effective CLI and skill help

<!-- mdcomposer:meta
title: "Effective CLI and skill help"
kind: design
state: accepted
audience: internal
owner: repository-maintainer
updated: 2026-11-26
acceptance: "user:2026-11-26:eight-execution-contract-answers"
-->

## Shared records

Shared versioned capability records describe command/mode/artifact identity, summary, interface, availability/reason, prerequisites, examples and provenance. General help uses package assets and works outside a repository. Contextual help resolves committed policy and exposes naming/testing/stories/commits/review/owners and amendments; invalid/conflicting policy refuses.

The CLI renders shared mode/command summaries and supports structured help. The skill uses those records plus the applicable actual mode prompt. EXPERIMENT, EXPLORE, DESIGN, PLAN, EXECUTE, VIBE, REVIEW and direct STRICT remain distinct. CLI plan still prepares adoption/migration; packet plan prepares delivery records. Neither implies an autonomous CLI execute agent or universal host invocation syntax.

## Defaults and unavailable behavior

Conventional commits are the overridable default. PLAN asks about story outputs unless answered or always/never configured. Added/omitted artifact definitions and mode availability are explainable; an unknown mode/missing prompt is not advertised as working automation. Source-only metadata or a detected script never authorizes execution.

## Evidence

help.service.test.ts exercises general/contextual provenance, malformed state, amendments, missing assets and relocation. Actual built CLI/relocated exported skill and agent trials are separately recorded in the owner packet (archived; see historical context).

## Historical context (archived)

- [owner packet](../../../../_archive/product/capabilities/cli/help/execution/effective-help/effective-help.execution-plan.md)
