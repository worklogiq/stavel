# Agent questions and alignment

<!-- mdcomposer:meta
title: "Agent questions and alignment"
kind: "guide"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

## Discover first

Inspect facts before questioning the user. Identify current accepted instructions, owner docs, existing tooling and actual commands. Distinguish direct user instructions, accepted repository policy, observations, proposals and unknowns.

The versioned catalog groups project intent, workflow, documentation, document naming, source structure, architecture/API, persistence, interfaces, verification, observability, delivery, tooling and history decisions. Ask only applicable unresolved or conflicting questions. Explicitly mark irrelevant subjects not applicable; do not require a frontend, database or cloud in every repository.

## Capability and feature ownership

Use the [ownership philosophy](../philosophies/capability-ownership.philosophy.md) to inspect actual product surfaces and propose coherent capabilities/features before choosing output destinations. Include a real CLI or library surface even when it supports a skill or website. Map shared services once instead of treating every source file as a feature. Reuse settled local choices; ask a focused ownership question only when materially ambiguous. Existing-target alignment still applies before generating adopting-target files.

## Test layout

Read the [test-placement guide](test-placement.guide.md). Inspect accepted repository policy, runner configuration and actual test/source evidence. Offer preserving conventions, the selected profile default or a sourced language/toolchain convention, plus explicit colocated/separate/custom layouts. Reuse prior explicit choices, ask about mixed or unclear scopes, and align before adopting-target generation. A convention proposal does not move existing tests.

## Conversation

Use the host's native Q&A capability when available. Otherwise list grouped numbered questions in conversation, collect all applicable answers, resolve contradictions, and present one complete recap. Never infer an answer from silence or elapsed time. Resume interrupted questioning without discarding settled choices.

A direct instruction from the current or earlier authorized task can answer a question. An explicit selection of the presented defaults resolves those listed defaults together. Existing accepted policies provide cited selections. Observed code patterns remain proposals until alignment. The user's requested repository and scope remain controlling.

Before generating any target files, obtain alignment on the complete selected configuration, material choices, accepted mappings and explicit deferrals. Tools can return read-only structured questions and plan output; they must not write a draft answer file into the target first. Once aligned, execute routine authorized steps without ceremonial reapproval.

## PLAN story question

Follow the [story guide](story-workflow.guide.md). Unless the selected policy is always/never or the current scope already has an explicit answer, ask whether PLAN should generate stories. Do this during PLAN; a story already supplied to EXPLORE/DESIGN is not an answer to the output question. Use the repository template seeded by init and preserve its overrides.

## Decision record and behavior

Record stable decision IDs, selected values, applicability, source evidence, resolution status, default/profile versions and the instruction establishing alignment. Resolution states are resolved-from-user, resolved-from-accepted-repo-policy, proposed-from-observation, unanswered and not-applicable.

Root instructions and the local profile route future agents to canonical owners, scoped naming, real test/build commands, selected checks and known exceptions. The framework changes session behavior through these durable instructions. It does not configure application-internal workers merely by installing documents.

An answer selecting a tool/provider does not expand authorization to network calls, secret changes, publication or deployment. Continue independently authorized work while pausing only the portion that depends on a material unanswered question.
