# Native Git-guard controls verification

<!-- mdcomposer:meta
title: "Native Git-guard controls verification"
kind: verification
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-27
-->

The [accepted control decision](git-guard-controls.decision.md) is implemented in the [guard service](../../../../../../src/git-guard.service.ts) and CLI/Git adapters. The final unchanged executable source passed npm test: **393 cases, 392 passed, zero failed and one existing Windows permission skip** (.cache/native-guard-controls-final-tests.log). TypeScript declarations/build passed as part of that command. Repository checks returned zero diagnostics; final source/staged checks run after this evidence record is written.

The [27 colocated guard cases](../../../../../../src/git-guard.service.test.ts) include real Git processes exercising default refusal, native true permission, false refusal, last-command-value precedence, malformed values, persisted local/global values ignored, the next invocation protected again, and unchanged private configuration/receipts. Modified owned assets still refuse with true. Real pushes against isolated local bare remotes confirm destination protection and the invocation exception. The [CLI integration](../../../../../../src/stavel.cli.test.ts) also exercises actual init, local disable/enable and previews, native commit/push flags, repository toggles and unchanged baseline bytes. Existing lock, foreign integration, stale plan, runtime upgrade/rollback and preservation coverage remains in the suite.

An earlier run correctly refused a repeat-init fixture after its source agent template was edited during the run. The focused repeat test then passed (one selected, nine unselected); the final full run used frozen portable assets. No production precondition was weakened to accommodate that refusal.

The complete relocated skill's CLI/guard bytes match the tested dist binaries, and its real help advertises the native boolean and scoped persistent settings, with no separate allowance commands (.cache/native-guard-export.verification.json). The source checkout's owned runtime was explicitly upgraded through a dry-run and checked plan; inspection is ready with protection enabled. Installed runner SHA-256: `c61cbbf2b461f4b5174584a1b89b53ffcb957a032ebb8bdef71395d6058705c4`. Its baseline pin remains `172c71ed3b25ab789d743c9e039dc2394e96a91b536f308fb034f2835298940d`; local settings and main were not disabled or changed to perform delivery.

Bounded coordinator review confirms shared policy/serialization, explicit user authority in portable guidance, colocated behavioral tests and no pending token/wrapper/reason machinery. No independent agent review or new Linux/macOS/hosted CI matrix was performed for this increment. Hooks cannot distinguish humans from agents, and native -c settings extend to the invocation's subprocesses. False grants no exception; it does not re-enable a deliberately disabled policy. No per-invocation audit receipt, hosted permission or server-protection bypass is claimed. Merge/publication and global installed-skill replacement remain outside this delivery.
