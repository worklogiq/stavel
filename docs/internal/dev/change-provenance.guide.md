# Migration and repair provenance

<!-- mdcomposer:meta
title: "Migration and repair provenance"
kind: guide
state: accepted
audience: public
owner: repository-maintainer
updated: 2026-11-26
acceptance: "user:2026-11-26:eight-execution-contract-answers"
-->

Before presenting or performing a migration or repair, state whether its proposed transformations come from a supported deterministic implementation or AI-agent judgment. An AI-assisted transformation must visibly warn that its proposal is nondeterministic, identify the actual task/design source, and expose the concrete diff and verification. Apply the same rule in chat, CLI output and persisted evidence. Do not describe a generated script or hash-checked plan as proof that its AI-selected semantic changes are deterministic or correct.

Deterministic tools can validate hashes and apply a fixed plan repeatably. Record that mechanism separately from who selected or authored the transformation. Packaged schema migrations and allowlisted asset restoration can report deterministic provenance when no agent-authored semantic transformation is involved. Unknown/custom transformations require review and must not inherit that label automatically.

Preserve original bytes, accepted amendments and actual history. A declined or stale proposal does not authorize writes. A warning informs review; it does not replace alignment, task authorization, preview, verification or recovery.
