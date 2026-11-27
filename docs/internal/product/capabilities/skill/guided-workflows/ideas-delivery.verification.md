# IDEA and Git-guard delivery verification

<!-- mdcomposer:meta
title: "IDEA and Git-guard delivery verification"
kind: verification
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-27
-->

## Scope and actual results

The [execution selection](ideas-execution.decision.md) authorized the selected IDEA and Git-guard designs on docs/idea-capture-and-commit-guards. The implementation uses shared checked file plans, work records and repository configuration. No stories, main changes, merge or publication were selected.

Final npm test completed on Windows: **387 tests, 386 passed, zero failed, one existing Windows permission skip**. The local complete log is .cache/ideas-execution-verified-tests.log. npm run check returned zero diagnostics after source integration and local guard installation. The final staged documentation/archive tree is separately checked before delivery. No remote CI result is claimed.

| Slice | Delivered behavior | Focused evidence |
| --- | --- | --- |
| I01 | Original-text capture, effective templates, stable retry identity and atomic record/work registration | [idea service tests](../../../../../../src/idea.service.test.ts), 26 cases; [work service tests](../../../../../../src/work.service.test.ts), 24 cases; malformed/stale input, identity collisions, preservation and interrupted transaction recovery |
| I02 | Shared idea CLI, terminal/headless questions, preview/retry, IDEA help and portable assets | [CLI tests](../../../../../../src/stavel.cli.test.ts), shared help tests and actual native Windows terminal whitespace preservation (.cache/idea-tty-evidence.json) |
| I03 | Combined source/API/package checks and owner-record closure | Final full suite above, real work queries and bounded review below; actual exported Windows/Linux commands |
| G01 | Self-contained fail-closed commit/push runner and preserving local hook activation/recovery | [guard tests](../../../../../../src/git-guard.service.test.ts), 21 declared cases; actual commit/push fixtures, foreign integration refusal, locks, interruption, exact/folded ref backends and runtime upgrade/rollback |
| G02 | Readiness before cached onboarding, manual adoption, selected repair and repeat init | [guided](../../../../../../src/guided.service.test.ts), [initialization](../../../../../../src/initialization.service.test.ts) and [doctor](../../../../../../src/doctor.service.test.ts) suites; actual serialized repair apply/verify/resume/rollback regressions |
| G03 | Offline exported runner, checked activation, help/contract and source adoption | Final full suite, selected package exports and real cross-platform process trial below |

Counts distinguish declared module cases from the actually passed aggregate. The Windows permission skip is not passed coverage. The [bounded philosophy review](ideas-philosophy-review.verification.md) identifies integration findings and evidence limits.

## Independent relocated artifact trial

A separate agent exercised the final complete exported skill in isolated ordinary Git repositories against local bare remotes. Windows Node v20.19.6 passed 22 actual commands; Linux WSL2 Node v24.22.3 passed the same 22. Both observed aligned init, healthy repeat with no questions, read-only IDEA preview, literal multiline capture, source-backed work query, unchanged request-ID retry, main commit refusal, allowed task commit, protected destination push refusal and allowed task push. This is a bounded independent usage trial, not a universal agent or operating-system certification.

Local command-by-command receipts and stdout/stderr are under .cache/idea-delivery-independent/windows-final2 and linux-final2. Tested export tree SHA-256: `ee0f6eab833e491d13ccddabb5ff56c3816e24691e175250d60ac93e5b31b824`; CLI: `e609cbf171ebe270279604115ea8e12810fd8f1cef166c6d2f81934953178e5b`; guard: `fc9465281be44d1dbaf582187ac5a9e5cc0e1af647924ee85d8fe277034a0241`. Subsequent owner-document closure changes exported documentation bytes; the final export is recreated after closure without changing executable code. Linux Node came from a checksum-verified archive without a system installation.

## Source adoption and preservation

This repository explicitly selected enabled protection for main in its committed workflow configuration. The checked guard-only init preview installed four owned .stavel-hooks files and activated local core.hooksPath only after file application. Inspection reports ready, repeated guided init reports already-initialized with manual adoption, and no installer manifest was invented. Local receipts remain under private .git/stavel-guards; no Git config snapshot is committed. Source installation receipts are in .cache/source-guard-installation.verification.json. The pinned baseline remains `172c71ed3b25ab789d743c9e039dc2394e96a91b536f308fb034f2835298940d`.

## Deliberate limits and next step

Foreign hook managers, unsupported worktrees and bare repositories receive preserving diagnostics rather than takeover. Non-Git projects can stage selected assets but need explicit Git initialization and later activation. Local hooks can be bypassed by a person controlling Git; hosted branch protection is separate. Missing runtime/configuration fails closed. No macOS/full remote CI matrix, npm publication, hosted branch protection, global installed-skill replacement or human approval is claimed. Broader non-guard partial-setup reconstruction remains separate repeat-initialization work. Review this task branch; merge and release remain explicit owner actions.
