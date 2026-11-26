# Verification and evidence

<!-- mdcomposer:meta
title: "Verification and evidence"
kind: "philosophy"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Applies to all completion claims, with depth proportional to impact.

- Define acceptance from the requirement, not from whatever the implementation happens to do. Record test inputs, expected outcomes, and important invariants before coding when practical.
- For a reported defect, reproduce it with a failing regression check before the fix when practical. If automation is unsuitable, record the observed failure and closest stable verification boundary.
- Test behavior and contract boundaries. A mechanism required by the design also needs a check of its defining property; a matching class name or method call is insufficient.
- A functionally correct substitute may still violate a required mechanism. Conversely, conformance to an experimental mechanism does not establish usefulness or superiority.
- Distinguish unit, integration, end-to-end, benchmark, and manual evidence. Use the existing project tooling; do not impose a browser runner on non-browser software.
- Separate held-out evaluation from training examples. Record datasets, splits, seeds, hardware, versions, baseline, metric, and uncertainty for empirical claims when relevant.
- Record skipped checks, known failures, unsupported environments, and missing evidence. Never report tests as passed when they were not run.
- Use a requirement-to-implementation-to-evidence table for substantial work. Critical omissions prevent a complete claim even when unrelated tests pass.

Verification of this policy: another reader can locate each important assertion's evidence and understand what it does and does not establish. Use the [verification template](../templates/execution/verification.template.md).
