# Work records and versioned migrations packet

<!-- mdcomposer:meta
title: "Work records and versioned migrations packet"
kind: overview
state: deprecated
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

[Owner](../../../../../../../product/capabilities/cli/work-management/work-management.design.md) | [Execution plan](./work-records.execution-plan.md) | [Macro tracker](./work-records.macro-execution.md) | [Coordination packet](../../../../skill/guided-workflows/execution/guided-workflows/index.md)

This packet contains actual separately scoped delivery records for its owner. Read the shared contract and linked slice requirements/dependencies before execution. Story generation is omitted for this pass; no feature implementation is authorized by creating these files.

- [WRK-01: Query canonical work records without a status cache](./wrk-01-work-reader.execution-slice.md)
- [WRK-02: Create, register and transition work safely](./wrk-02-work-writers.execution-slice.md)
- [WRK-03: Upgrade supported work schemas without changing intent](./wrk-03-work-schema-migrations.execution-slice.md)
