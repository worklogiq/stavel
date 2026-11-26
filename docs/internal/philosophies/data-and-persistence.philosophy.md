# Data and persistence

<!-- mdcomposer:meta
title: "Data and persistence"
kind: "philosophy"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Applies to stored state, schemas, indexes, caches, history, checkpoints, and migrations.

- Give each durable fact or record an authoritative owner. Distinguish source state from a projection, cache, export, snapshot, or training artifact.
- Define missing, unreadable, stale, and invalid data separately. Corruption must not silently become a successful empty initialization.
- State concurrency, atomicity, retry, idempotency, durability, and recovery expectations appropriate to the data. Do not claim them from a filename or temporary-write pattern alone.
- Version schemas and artifacts when past behavior must remain reproducible. Record migration and rollback consequences; avoid changing persistence shape as a casual implementation detail.
- Enforce access scope at the storage/service boundary where applicable. Do not rely on display filters or assumed current-user state to isolate data.
- Bound expensive reads and growth according to measured needs and explicit budgets. Report truncation, dropped records, unavailable measurements, and retention behavior.
- Define what a seed or export includes: code, knowledge, configuration, secrets, model weights, and local state are different artifacts. A code export does not establish preserved learned capability.

Verification: exercise write/read/restart or restore, malformed state, concurrent writers where relevant, and representative migrations. For learning systems, test persistence, retrieval, prompt inclusion, and model use as separate checkpoints.
