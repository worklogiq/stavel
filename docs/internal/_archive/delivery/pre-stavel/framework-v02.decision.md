# Framework 0.2 implementation decision

<!-- mdcomposer:meta
title: "Framework 0.2 implementation decision"
kind: "decision"
state: "deprecated"
audience: "internal"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

## Accepted task

The repository owner's 2026-11-25 instruction authorized implementing the discussed redesign: Node tooling, standalone reusable mdcomposer, useful Markdown and optional JavaScript/TypeScript checks, MenuLogiq-derived default taxonomy, independent source/document naming decisions, agent-led Q&A and historical recon, aligned bootstrap/adopt/migrate routes, self-contained skill exports and contribution profiles.

The [portable conventions decision](../../../process/default-conventions.decision.md) owns reusable policy. This record owns the work on this package. Existing task authorization covers routine implementation and requested repository/package publication; a plan does not independently expand authorization. No merge is implied.

## Implementation boundaries

Use subagents for independent tooling extraction, Node/adoption implementation, documentation/config migration and verification. Maintain one asset source and explicit export catalog. Exclude this package's requirements and local history from adopter assets. Preserve accepted behavior, no-overwrite protections and meaningful historical evidence.

## Evidence and limitations

The [execution record](./framework-v02.execution-plan.md) records actual checks as they become available. Accepted design is distinct from implemented or measured behavior.


Retired on 2026-11-26 by the Stavel clean restart. Original decisions, versions and verification claims above remain historical evidence.
