# Observability

<!-- mdcomposer:meta
title: "Observability"
kind: "philosophy"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Applies to background work, diagnostics, costs, and operational or learning progress.

- Record what happened, to which artifact or task, under which version, and with what outcome. Correlate across processes when the system requires it.
- Distinguish attempted, executed, completed, verified, skipped, refused, and failed. A growing queue or fact count alone is not progress toward a useful result.
- Represent absent measurements as absent. Do not fabricate a score, success, empty result, or loss value after a measurement fails.
- Capture errors near their cause with sufficient context and appropriate privacy. If a batch continues after failures, report both failures and completed items accurately.
- Expose the state needed to diagnose persistence, retrieval, generation, and promotion separately in AI systems.
- Use bounded, documented telemetry and retention. Introducing tracing or metrics should not force an external vendor or leak sensitive payloads.

Verification: induce a representative failure and trace it to an actionable diagnostic. Confirm progress reports can be tied to actual artifacts and checks, not only counters.
