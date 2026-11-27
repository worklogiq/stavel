# CLI capability

<!-- mdcomposer:meta
title: "CLI capability"
kind: overview
state: active
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

The CLI is an implemented Stavel capability alongside the [skill](../skill/index.md). It exposes deterministic inspection, planning, aligned application, checks, Markdown tooling and skill export. Agent workflows consume the same operations where supported.

[CLI overview](cli.overview.md) | [Architecture and service ownership](cli.design.md) | [Per-service test obligations](service-verification.test-plan.md)

## Feature owners

| Feature design | Current or explicitly planned interface |
| --- | --- |
| [Repository inspection and aligned decisions](inspection/inspection.design.md) | inspect; questions |
| [Adoption and migration planning](planning/planning.design.md) | plan; migrate plan |
| [Aligned initialization](initialization/initialization.design.md) | init; supported bootstrap/adopt planning routes |
| [Plan application, verification and recovery](migration/migration.design.md) | apply; verify; migrate apply/resume/rollback |
| [Repository checks and policy rules](checking/checking.design.md) | check; rules list |
| [Markdown tools and link integration](markdown/markdown.design.md) | docs <mdcomposer args> |
| [Portable skill export](skill-export/skill-export.design.md) | export-skill |
| [CLI help and capability discovery](help/help.design.md) | help; --help; -h |
| [Diagnosis and reviewed repair](doctor/doctor.design.md) | doctor; bounded preview/repair |
| [Work records, queries and schema upgrades](work-management/work-management.design.md) | work list/create/update/migrate/apply/recover |

## Shared services and delivery

The services directory documents filesystem, naming, distribution, test placement and shared policy helpers once; the architecture maps every current service to those or its owning feature. Shared framework/configuration/distribution contracts remain in their accepted homes.

The [guided-workflow initiative](../skill/guided-workflows/index.md) coordinates planned CLI and skill changes with one execution packet and accountable status owner. Do not copy that packet into each feature. [CLI status](cli.status.json) has no separately active delivery item; it does not duplicate the initiative state held by the skill capability.

Current CLI owner-local execution plans are indexed by the initiative coordination packet (archived; see historical context). CLI participates in that one accountable initiative; this index does not copy its phase/status.

## Historical context (archived)

- [initiative coordination packet](../../../_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/index.md)
