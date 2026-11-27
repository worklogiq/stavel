# IDEA mode proposal

<!-- mdcomposer:meta
title: "IDEA mode proposal"
kind: design
state: draft
audience: internal
owner: repository-maintainer
updated: 2026-11-27
-->

The owner requested this proposal on 2026-11-27: an IDEA mode for quickly capturing and registering an idea so it is not forgotten. This is proposed behavior, not an implemented mode or command.

## Proposed behavior

- Accept a short idea through the Stavel skill, with a possible CLI equivalent later.
- Save a small record with a stable ID, title, original intent/source and relevant owner or links. Follow repository naming and ownership conventions.
- Register the record in its capability-owned status file using the supported work CLI. Keep the work index pointer-only; do not create another status owner.
- Keep capture lightweight. Do not require a design packet, stories or execution planning merely to remember an idea.
- Later promote selected ideas into EXPLORE, DESIGN and PLAN. Capturing an idea does not accept its design or authorize implementation.

## First idea

[Packaged commit-safety hooks installed by init](../../cli/initialization/commit-safety-hooks.recon.md) is the first captured idea. It is already registered through today's work tooling; IDEA mode itself remains a proposal.
