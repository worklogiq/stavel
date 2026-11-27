# Agent working modes

<!-- mdcomposer:meta
title: "Agent working modes"
kind: "overview"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-26"
acceptance: "user:2026-11-26:distinct-design-plan-execute-workflows"
-->

Use these short instructions with any coding assistant. They inherit the [constitution](../development-constitution.policy.md) and the task's actual scope and authorization. They do not grant tools, external access, or permission to make changes.

- [EXPERIMENT](experiment.prompt.md): standalone experiments, proofs of concept and bounded learning.
- [EXPLORE](explore.prompt.md): discuss requirements or understand the codebase; capture recon.
- [DESIGN](design.prompt.md): turn exploration, experiments or VIBE output into design documents.
- [PLAN](plan.prompt.md): turn a selected design into execution slices, dependencies and optional stories.
- [EXECUTE](execute.prompt.md): carry out ready execution slices using STRICT MODE automatically.
- [VIBE](vibe.prompt.md): combine the development activities, documenting decisions and honoring philosophies throughout.

[STRICT MODE](strict.prompt.md) remains the implementation fidelity protocol and direct entrypoint. [REVIEW](review.prompt.md) assesses actual results and supports execution closure.

Stories can enter EXPLORE/DESIGN or be produced by PLAN in an enterprise or other selected workflow. They may flow both ways or be unused, as defined by the user for the task or repository. Input stories need not wait for design review; final implementation commitment still honors the selected substantial-feature review gate.

The source CLI's help explains these workflows. They are agent guidance, not implemented feature-execution CLI subcommands; the existing CLI plan still prepares adoption/migration operations. An overall task can authorize transitions among modes without manually invoking each one, while keeping their responsibilities explicit.

The [lifecycle](../development-lifecycle.policy.md) defines phases consistently. A small task may use several activities in one short pass. Do not claim to have entered another mode as a substitute for performing its work.
