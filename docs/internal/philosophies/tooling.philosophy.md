# Developer tooling

<!-- mdcomposer:meta
title: "Developer tooling"
kind: "philosophy"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Applies to command wrappers, generators, scaffolding, validation, and local automation.

- Prefer an obvious documented command with focused options over many hidden variants. Keep help output synchronized with behavior.
- State writes, network use, environment assumptions, skips, and defaults. Offer preview or dry-run when meaningful for bulk changes.
- Preserve existing files and user work. Scaffolders should detect conflicts before writing and explain recovery. Never hide overwrite behind a convenience default.
- Use dependency-free or existing tooling where suitable. Installing a documentation workflow must not start the application or mutate external infrastructure.
- Validate the failure paths that protect user data, not just the successful scaffold.
- Generated artifacts must identify their source and version. Repeated generation must not silently overwrite accepted local amendments.
- Keep debug harnesses and evidence collection separate from normal product dependencies unless explicitly designed otherwise.

## Recurring problems and reuse

Treat repeated user corrections, recurring defects and repeated manual work as evidence of a tooling opportunity. Investigate the root cause and search existing repository tools and established solutions before proposing new code. Suggest the smallest useful check, wrapper, generator or workflow change when it can materially reduce recurrence.

Explain the observed pattern, expected benefit, maintenance and false-positive costs, appropriate owner, side effects, limitations and verification. Distinguish deterministic checks from judgments needing review. Implement within existing task authorization; record useful deferred proposals through established tracking. Do not repeatedly offer a rejected suggestion without new evidence.

Keep one canonical implementation and let consumers select versioned packages/configuration. Package executable dependencies required after export; build-only dependencies prepare static assets before distribution. A wrapper remains local when its purpose is project-specific orchestration.

Verification: exercise commands, help, targeted operation, previews, conflict refusal, and generated output in isolated directories. Say which checks are structural and which exercise behavior.
