# Stavel product overview

<!-- mdcomposer:meta
title: "Stavel product overview"
kind: overview
state: active
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## What Stavel is

Stavel helps people and coding agents develop software while preserving the intent behind it. It brings project conventions, requirements, design decisions, execution work and verification evidence into a repository-owned workflow that humans can review and future agents can resume.

The product serves developers and maintainers guiding AI-assisted work in new or existing repositories. Teams choose their own language, application architecture and tools; Stavel supplies a shared development method, reusable guidance and optional automation.

## The problem and desired outcome

AI-assisted development can lose important decisions between sessions, implement a convenient substitute for the requested behavior, scatter documentation or report completion without enough evidence. Repeated human corrections also expose opportunities for clearer rules and focused tools.

Stavel's intended outcome is a traceable path from the user's problem and accepted requirements through design, reviewable implementation and actual verification. Each concept has a canonical owner. Material choices and amendments remain visible, execution increments leave coherent stopping points, and completion claims identify their evidence and limits.

## Current capabilities

The [skill](capabilities/skill/index.md) is the agent-facing capability. Its current [guided-workflows feature](capabilities/skill/guided-workflows/index.md) owns conversational and lifecycle design with one cross-capability execution packet.

The [CLI](capabilities/cli/index.md) is the implemented tooling capability. Inspection, aligned planning/initialization, migration/recovery, structural checking, Markdown tooling and skill export have their own feature designs. Shared service contracts explain filesystem, naming, distribution and rule-support boundaries. Planned doctor and work-management features are explicitly labeled.

These instructions guide agent behavior; they do not guarantee that an agent follows every requirement. Mechanical checks establish selected structural properties, while design suitability, required mechanisms and application behavior need appropriate review and behavioral evidence.

## Direction under design

The [guided-workflow packet](./capabilities/skill/guided-workflows/index.md#guided-workflows-draft-packet) develops conversational setup and diagnosis, richer design packets, scoped customization, explicit lifecycle orchestration, story-linked execution and closure. It also defines configurable capability/contract homes and product-overview bootstrap expectations. These are planned additions; the packet does not establish that the proposed guided commands or resolver have shipped.

Substantial features follow the selected design-review boundary before implementation commitment. Work is divided into coherent delivery increments linked to stories and canonical acceptance. Active execution packets stay with their owner and move to a mirrored archive after accurate closure, while current product/design/contract documents remain maintained.

## Shared contracts and boundaries

The [framework requirements](./contracts/framework/framework.requirements.md), [framework design](./contracts/framework/framework.design.md) and [distribution contract](./contracts/distribution/dependency-snapshots.contract.md) own the current package commitments. The [CLI contract](../../public/framework-cli.contract.md) and [repository README](../../../README.md) describe supported usage and setup.

Stavel does not choose an adopter's stack, prove application correctness from valid Markdown, or grant an agent permission beyond the user's task. Installing repository guidance is distinct from changing application runtime, publishing, merging or deploying. Framework adoption preserves accepted local conventions unless the user aligns a migration.

## Ownership and navigation

This is the canonical product-level explanation of what Stavel is and whom it serves. The [product index](./index.md) routes readers to [capabilities](./capabilities/index.md) and [contracts](./contracts/index.md). Capability/feature packets add scoped detail and link these owners instead of copying this overview.

The maintainer owns this overview. Update it when actual product scope or capability availability changes; retain planned versus observed behavior and do not infer product acceptance from generated prose.
