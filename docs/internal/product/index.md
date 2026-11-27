# Product documentation

<!-- mdcomposer:meta
title: "Product documentation"
kind: overview
state: active
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

Start with the [product overview](./product.overview.md) for what Stavel is, whom it serves and its current scope. This index provides navigation through two explicit branches:

- [Capabilities](./capabilities/index.md): owned product behavior, workflows, design packets and capability-local delivery.
- [Contracts](./contracts/index.md): shared product obligations and stable interfaces, organized by topic and referenced by capabilities.

The [hierarchy design](../process/documentation-hierarchy.design.md) defines product, capability and feature responsibilities, optional outer platform/product nesting and configurable paths. The [documentation-home decision](../decisions/product-documentation-home.decision.md) records local migration authority. No repeated stavel directory is needed to identify this product.

[Skill](capabilities/skill/index.md) and [CLI](capabilities/cli/index.md) are current capabilities. Guided workflows is a skill feature with one cross-capability initiative packet; CLI behaviors and shared services have their own design owners. Website/docs remains a future example with no empty scaffold. Closed packets preserve their selected owner-relative archive mapping while durable design owners stay current.
