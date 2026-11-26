# Interfaces and accessibility

<!-- mdcomposer:meta
title: "Interfaces and accessibility"
kind: "philosophy"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Applies to human-facing UI, command lines, documentation, and consumer-facing SDKs.

- Define the audience, task, states, and recovery paths. Reuse established components and interaction patterns when their semantics fit.
- Keep interaction orchestration and presentation distinct from authoritative domain decisions. Clients may mirror validation for usability; they must not be the only enforcement point for protected operations.
- For visual interfaces, cover keyboard use, focus, semantics, labels, zoom, contrast, non-color cues, and motion as applicable. Record the project's chosen accessibility target rather than assuming this document certifies conformance.
- For CLIs and SDKs, make defaults, side effects, errors, cancellation, and machine-readable outputs explicit. Avoid success-shaped defaults after failure.
- Show understandable errors with useful recovery steps. Keep secrets, raw traces, and provider payloads in appropriate diagnostics, not normal user messages.
- Use stable test targets suited to the interface. Do not impose one selector strategy across all applications; verify user-observable behavior and accessibility.
- Keep public help aligned with actual behavior and the supported setup. Explain unavailable or experimental functionality honestly.

Verification: exercise representative happy, empty, loading, failure, retry, and cancellation paths. Include accessibility checks when a changed human interaction requires them.
