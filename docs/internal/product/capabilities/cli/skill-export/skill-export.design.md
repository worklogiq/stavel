# Portable skill export

<!-- mdcomposer:meta
title: "Portable skill export"
kind: design
state: draft
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Scope and current evidence

Interface: export-skill. This feature owns the responsibility below. Existing behavior is observed from the linked source and tests; future changes require their actual accepted contract.

Resolve the source distribution; collect only explicit portable assets, skill source, license, bundled executables/notices and versioned manifests. Preflight differing output before writing and preserve reused identical bytes.

## Decisions, constraints and rationale

Exports must be relocatable/offline and self-contained. Filled product docs/status/profile remain local; export does not install or replace a host skill. Dry-run writes nothing. A failed multi-file export may leave earlier writes; report that actual boundary rather than promising rollback.

## Verification and gaps

Existing tests exercise export dry-run/conflicts, relocation, public library formats and offline package installation. Add focused missing assets/license/executable, unsupported catalog and identical-repeat cases with real byte assertions.

## Planned delivery and owners

S-09 verifies the richer catalog/guidance after relocation; publication and host skill replacement remain separately deferred.

[source boundary](../../../../../../src/export.service.ts) | [CLI architecture](../cli.design.md) | [public CLI contract](../../../../../public/framework-cli.contract.md) | [initiative requirements](../../skill/guided-workflows/guided-workflows.requirements.md)
