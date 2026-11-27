# EXECUTE

<!-- mdcomposer:meta
title: "EXECUTE"
kind: prompt
state: accepted
audience: public
owner: repository-maintainer
updated: 2026-11-26
acceptance: "user:2026-11-26:distinct-design-plan-execute-workflows"
-->

Read the selected execution packet, accepted design/requirements, actual user changes, scope and dependency evidence. EXECUTE carries out ready authorized slices using [STRICT MODE](strict.prompt.md) automatically. Preserve direct STRICT MODE use for an already clear authorized slice.

If an execution packet is missing or unready, identify that boundary. Transition explicitly to [PLAN](plan.prompt.md) when the task authorizes preparing execution; return to [DESIGN](design.prompt.md) for material missing design decisions. A single lifecycle instruction can cover these transitions without ceremonial permission prompts, but keep the activities and actual current phase explicit. EXECUTE does not silently absorb planning/design or accept proposed requirements.

Implement dependency-ready scope, verify defining mechanisms and relevant behavior, reconcile canonical slice results and capability-owned status, and review/close the requested boundary. Continue independent authorized work when another portion is blocked. Source edits, conflicting selected plans and stale prerequisites require revalidation before resuming.

Result: COMPLETE, PARTIAL or BLOCKED for the actual selected scope, with implementation/check evidence, deviations and next action. Slice/PR readiness is distinct from initiative completion or permission to publish, merge, deploy or contact anyone.

Design PRs are recommended by default for substantial work, not a forced lifecycle gate. Honor an explicitly required repository policy, but otherwise the user may go directly from DESIGN to PLAN or design a small story. Record selected design separately from actual review/acceptance; never invent PR approval or require ceremonial permission for a chosen authorized path.
