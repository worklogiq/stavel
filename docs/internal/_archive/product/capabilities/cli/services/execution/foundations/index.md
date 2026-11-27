# CLI foundations and service contracts packet

<!-- mdcomposer:meta
title: "CLI foundations and service contracts packet"
kind: overview
state: deprecated
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

[Owner](../../../../../../../product/capabilities/cli/cli.design.md) | [Execution plan](./foundations.execution-plan.md) | [Macro tracker](./foundations.macro-execution.md) | [Coordination packet](../../../../skill/guided-workflows/execution/guided-workflows/index.md)

This packet contains actual separately scoped delivery records for its owner. Read the shared contract and linked slice requirements/dependencies before execution. Story generation is omitted for this pass; no feature implementation is authorized by creating these files.

- [FND-01: Report malformed package input accurately](./fnd-01-package-inspection.execution-slice.md)
- [FND-02: Verify shared pure and filesystem primitives](./fnd-02-pure-service-contracts.execution-slice.md)
- [FND-03: Verify orchestration and mutation service contracts](./fnd-03-effect-service-contracts.execution-slice.md)

All three foundation slices now have [local execution evidence](./foundations.verification.md). Later gated feature packets remain separate work.
