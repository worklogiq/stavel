# Engineering philosophies

<!-- mdcomposer:meta
title: "Engineering philosophies"
kind: "overview"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Read only the applicable subjects. Each policy states the behavior it protects and how to evaluate it. Product-specific rules belong in the project profile or owning capability, not in this portable core.

| Subject | Applicability |
| --- | --- |
| [AI collaboration](ai-collaboration.philosophy.md) | Coding sessions, prompts, model handoffs |
| [Product intent](product-intent.philosophy.md) | Scope, outcomes, non-goals, priorities |
| [Capability ownership](capability-ownership.philosophy.md) | Product surfaces, feature homes, shared services and proactive discovery |
| [CLI tools](cli-tools.philosophy.md) | Command/service boundaries, effects, naming rationale and per-service tests |
| [Architecture](architecture.philosophy.md) | Boundaries, domain logic, adapters, APIs |
| [Code quality](code-quality.philosophy.md) | Naming, types, dependencies, maintainability |
| [Data and persistence](data-and-persistence.philosophy.md) | Schemas, state, history, caches, migrations |
| [Verification](verification.philosophy.md) | Acceptance, regression, research claims |
| [Interfaces and accessibility](interfaces-and-accessibility.philosophy.md) | UI, CLI, SDK, errors, human interaction |
| [Security and privacy](security-and-privacy.philosophy.md) | Trust, identity, external boundaries, publication |
| [Observability](observability.philosophy.md) | Diagnostics, progress, costs, measurements |
| [Delivery and infrastructure](delivery-and-infrastructure.philosophy.md) | Builds, configuration, deployment, recovery |
| [Tooling](tooling.philosophy.md) | Developer commands, help, reproducibility |
| [Documentation](documentation.philosophy.md) | Canonical ownership, lifecycle, audience, links |

Use the [philosophy template](../templates/design/philosophy.template.md) and [extension guide](../process/framework-extension.policy.md) for additions. Requirements inside a policy apply when that policy's subject is in scope; adoption does not require every application to grow every subsystem.
