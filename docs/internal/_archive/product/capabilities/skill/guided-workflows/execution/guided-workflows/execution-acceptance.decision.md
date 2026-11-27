# Execution contract acceptance and amendments

<!-- mdcomposer:meta
title: "Execution contract acceptance and amendments"
kind: decision
state: deprecated
audience: internal
owner: repository-maintainer
updated: 2026-11-26
acceptance: "user:2026-11-26:eight-execution-contract-answers"
-->

## Actual acceptance

The owner answered all eight consolidated questions with recommended. Question 4 additionally requires a warning when a migration is performed by an AI agent and is not deterministic. Question 6 adds the same warning for repairs. Question 8 accepts this chat as the reviewed design baseline for this unpublished initiative only; the reusable design-PR preference is recommended by default and configurable. The owner explicitly permits DESIGN directly to PLAN and smaller story designs without a forced PR or exception ceremony. Teams may select a required review policy. No external delivery or global skill installation is authorized by these answers.

Reviewed proposal before this acceptance annotation: SHA-256 2e79cc392b4d278541cfb6d3b4bd6223ac2810bb6d21439866c94fc93d7557f3. The [contract document](./execution-contracts.design.md), the numbered questions and the actual answers together form the reviewed baseline. This digest identifies the reviewed content; it is not a manufactured PR approval.

Accepted choices: committed pinned defaults; baseline/repository/capability/task precedence; resumable local sessions retained until cleanup; explicit preserving schema migrations; checked/locked/journaled writers; conservative reviewed repairs; manifest identities and canonical slice records; and the scoped chat-review exception. Routine details within these choices remain autonomous.

## AI versus deterministic transformations

Each migration/repair preview and result identifies execution kind: deterministic or agent-assisted. A model producing a plan, mapping, replacement prose or semantic decision makes that portion agent-assisted even if deterministic code later applies its bytes. Show a clear nondeterminism warning before changes, in terminal output and structured/agent output. Preserve that classification/source through plan, journal and result; reject missing/unsupported execution kinds in the new interfaces. Do not label agent judgment deterministic because a file writer is deterministic. Existing historical plans retain their legacy format; new authored inputs can declare agent assistance explicitly. Deterministic packaged transformations need no AI warning.

## Conventional commits

The owner additionally selected conventional commits as the default, overridable repository configuration. Default types are feat, fix, docs, style, refactor, perf, test, build, ci, chore and revert; scope is optional. Preserve existing accepted repository conventions or an explicit custom policy during init rather than imposing the default. Help and skill guidance explain the effective choice. Merely selecting this policy neither installs hooks nor authorizes a Git commit; checking an explicitly supplied message can be deterministic.

## Readiness and execution

G-01 through G-08 have their design selections resolved by this acceptance and the contract proposal, subject to the amendments above. Source prerequisites, actual tests, review findings and delivery evidence still control slice completion. CFG-01 is the next implementation slice after the completed foundations. Continue independent workers while integrating shared APIs. No slice becomes complete merely because its design is accepted.

## Review flexibility clarification

The owner's answer 8 explicitly says design PRs are up to the person using Stavel and the workflow must provide tools without forcing its sequence. Accordingly the default is recommended-for-substantial, with required-for-substantial available as repository policy. Direct PLAN records selected design evidence as design-selection, not invented acceptance/PR review. The one-time reviewed chat baseline for this actual initiative remains real. Slice completion still requires actual verification and semantic/philosophy review evidence.
