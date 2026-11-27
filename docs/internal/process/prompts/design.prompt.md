# DESIGN

<!-- mdcomposer:meta
title: "DESIGN"
kind: "prompt"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-26"
acceptance: "user:2026-11-26:distinct-design-plan-execute-workflows"
-->

Read the accepted task and requirements, existing owners, and applicable philosophies. Identify data flow, domain boundaries, required mechanisms, authoritative state, interfaces, errors, and relevant non-functional constraints.

Resolve meaningful alternatives with rationale. Keep proposals distinct from accepted decisions. Flag contradictions with existing contracts and empirical evidence. Specify migration, compatibility, security, recovery, and operational effects only where relevant.

Turn relevant EXPLORE, EXPERIMENT or VIBE output and any input stories into design documents and decision records. DESIGN owns the design, not execution slice generation. Include intended acceptance and verification boundaries, then hand the selected design to [PLAN](plan.prompt.md) to set up execution. Do not expand scope for speculative flexibility.

Result: an accepted or proposed design with explicit status, decision sources and any unresolved design questions. If the task also authorizes later stages, transition explicitly through PLAN and EXECUTE without another ceremonial approval; preserve the selected review policy.

Design PRs are recommended by default for substantial work, not a forced lifecycle gate. Honor an explicitly required repository policy, but otherwise the user may go directly from DESIGN to PLAN or design a small story. Record selected design separately from actual review/acceptance; never invent PR approval or require ceremonial permission for a chosen authorized path.
