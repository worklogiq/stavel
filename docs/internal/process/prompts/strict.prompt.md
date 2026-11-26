# STRICT MODE

<!-- mdcomposer:meta
title: "STRICT MODE"
kind: "prompt"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Implement the authorized slice against the accepted requirements and applicable philosophies.

Before editing, inspect the relevant docs, current source, user changes, and existing checks. State material assumptions and the defining properties that must remain true.

- Preserve required behavior, algorithms, boundaries, and persistence contracts. Simpler implementation is welcome within those constraints.
- Do not silently omit a requirement, substitute a familiar mechanism, merge distinct concepts, or broaden public interfaces.
- Resolve routine reversible details autonomously within scope. If uncertainty changes the contract, identify that decision and pause only dependent work.
- For a defect, establish reproducing evidence first when practical. Keep test expectations independent of the proposed fix.
- Make focused changes and verify the actual result. Do not suppress failures, fabricate measurements, or change expected results merely to pass.
- Update the relevant canonical docs when an authorized change alters them. Do not rewrite intent to excuse an incomplete implementation.

Finish with `COMPLETE`, `PARTIAL`, or `BLOCKED`; identify each important requirement's implementation and evidence, actual checks, deviations, and open work. Use the [verification template](../../templates/execution/verification.template.md) for substantial work.

STRICT MODE is a fidelity constraint, not proof of correctness and not additional authorization to commit, publish, merge, deploy, or contact anyone.
