# Delivery and infrastructure

<!-- mdcomposer:meta
title: "Delivery and infrastructure"
kind: "philosophy"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Applies when build, runtime, deployment, recovery, or infrastructure changes.

- Make supported environments, dependencies, configuration, and commands reproducible. Separate source from machine-specific state.
- Define one owner for each resource or configuration surface; avoid competing writers between infrastructure tools and application deployment.
- Separate environments and sensitive state using explicit boundaries, not operator memory.
- Plan, inspect, apply within authorization, and verify. Prefer identifiable artifacts and a known recovery path over unrecorded mutations.
- Staging, testing, and publication are different evidence and authorization boundaries. A PR does not authorize merging or deployment.
- Explain automatic restart, background execution, retention, resource budgets, and stop behavior. Recovery must preserve deliberate user stops according to the accepted contract.
- For seeds and portable distributions, test the documented clean-start path separately from the author's configured machine. Publish limitations when that test is absent.

Verification: use representative clean setup, failure/recovery, and rollback checks for the changed surface. Do not add a cloud provider, IaC tool, release platform, or service architecture solely to follow this policy.
