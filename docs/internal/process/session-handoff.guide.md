# Handoffs across sessions and assistants

<!-- mdcomposer:meta
title: "Handoffs across sessions and assistants"
kind: "guide"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Before ending substantial work, leave a concise durable record in the owning task or execution note:

- Task, branch, source revision, mode, and lifecycle phase.
- Authoritative requirements and decisions, including required mechanisms.
- What changed and where; distinguish observations from proposals.
- Commands actually run, results, evidence locations, and checks not run.
- Open decisions, assumptions, failures, and the next independent action.
- Relevant environment or artifact dependencies, excluding credentials and private data.

A new assistant reads the entrypoint, profile, owning docs, and current diff before acting. A handoff summary routes to the source; it is not a substitute for the detailed contract. Recheck claims affected by intervening source or environment changes.

For apparent forgetting, trace whether the fact was stored, retrieved, included in the final input, and used correctly. For implementation drift, trace the accepted requirement through the diff and its evidence. Treat these as different diagnostic paths.
