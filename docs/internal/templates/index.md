# Templates

<!-- mdcomposer:meta
title: "Templates"
kind: "overview"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Copy the sections that clarify the task, then remove unused guidance. Do not create every template for every change. Keep real authority and evidence links in adopted documents.

| Template | Use |
| --- | --- |
| [AGENTS entrypoint](agents.template.md) | Route a coding assistant into the local hierarchy |
| [Product](design/product.template.md) | User problem, outcome, scope, non-goals |
| [Story](design/story.template.md) | Optional PLAN output or discovery/design input; repository-owned and editable after init |
| [Requirements](design/requirements.template.md) | Behavior, required mechanisms, acceptance |
| [Design](design/design.template.md) | Data flow, boundaries, alternatives, compatibility |
| [Decision](design/decision.template.md) | Accept or supersede a meaningful choice |
| [Recon](execution/recon.template.md) | Evidence-backed map before changing an existing system |
| [Plan](execution/execution-plan.template.md) | Sequence multiple reviewable slices |
| [Slice](execution/execution-slice.template.md) | Execute a small change with explicit acceptance |
| [Test plan](design/test-plan.template.md) | Coordinate verification across boundaries |
| [Verification](execution/verification.template.md) | Show requirement-level evidence and gaps |
| [Experiment](execution/experiment.template.md) | Evaluate a hypothesis or required mechanism |
| [Philosophy](design/philosophy.template.md) | Add a scoped rule with enforcement and tradeoffs |
| [Interface design](design/interface.template.md) | Human-facing states, accessibility, and recovery |

Metadata: document state is draft/accepted/active/complete/deprecated; implementation state is separate. Record the accepting decision or instruction instead of having an assistant invent approval.

## Portable artifact families

The versioned artifact catalog supplies stable artifact, section and question identities for product overview, product/requirements/design/backend/interface/UI, architecture, decisions, test plans, accessibility, access control, observability, documentation/help/public documentation, stories, recon, experiments and execution. Select applicable families and record omissions; do not generate every document for every task. Repository-owned story/custom templates retain their edits.

New generic templates include [product overview](design/product-overview.template.md), [backend](design/backend-design.template.md), [architecture](design/architecture-diagram.template.md), [access control](design/authorization-matrix.template.md), [observability](design/observability-plan.template.md) and [macro tracker](execution/macro-execution.template.md). The explicit asset catalog owns portable membership; filled source product records are excluded.
