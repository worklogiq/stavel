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

## Conversation

Use the host's native Q&A capability when available. Otherwise list grouped numbered questions in conversation, collect all applicable answers, resolve contradictions, and present one complete recap. Never infer an answer from silence or elapsed time. Resume interrupted questioning without discarding settled choices.

A direct instruction from the current or earlier authorized task can answer a question. An explicit selection of the presented defaults resolves those listed defaults together. Existing accepted policies provide cited selections. Observed code patterns remain proposals until alignment. The user's requested repository and scope remain controlling.

Before generating any target files, obtain alignment on the complete selected configuration, material choices, accepted mappings and explicit deferrals. Tools can return read-only structured questions and plan output; they must not write a draft answer file into the target first. Once aligned, execute routine authorized steps without ceremonial reapproval.

## Decision record and behavior

Record stable decision IDs, selected values, applicability, source evidence, resolution status, default/profile versions and the instruction establishing alignment. Resolution states are resolved-from-user, resolved-from-accepted-repo-policy, proposed-from-observation, unanswered and not-applicable.

Root instructions and the local profile route future agents to canonical owners, scoped naming, real test/build commands, selected checks and known exceptions. The framework changes session behavior through these durable instructions. It does not configure application-internal workers merely by installing documents.

An answer selecting a tool/provider does not expand authorization to network calls, secret changes, publication or deployment. Continue independently authorized work while pausing only the portion that depends on a material unanswered question.
