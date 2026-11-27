# Foundation execution verification

<!-- mdcomposer:meta
title: "Foundation execution verification"
kind: verification
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Executed scope

The owner explicitly requested EXECUTE with subagents and continued independent work while material decisions are collected once. FND-01, FND-02 and FND-03 used the existing accepted contracts. This record closes their local implementation/assurance scope; it does not accept the remaining design bundle, satisfy a future design PR, complete all packets or authorize external delivery.

Three subagents implemented nonoverlapping foundation portions and reviewed source/gate proposals. The coordinator reviewed/integrated changes, added migration/configuration cases, strengthened preservation assertions after independent review and ran the combined checks. Existing dirty source/planning work was preserved; no commits, pushes or publishing occurred.

## Requirement-to-implementation evidence

| Slice / requirement | Implementation and independent expected result | Actual evidence |
| --- | --- | --- |
| FND-01 / GW-01, T-01 | Malformed package.json adds a located inspection note. Missing/valid-empty packages have none; actual inspect keeps read-only exit-0 discovery behavior. Non-file/unreadable inputs retain refusal semantics where permissions can be enforced. | Three failing cases reproduced before the change. Four focused cases passed afterward; one POSIX permission case is skipped on Windows. Logs: .cache/fnd01-before.log and .cache/fnd01-after.log. |
| FND-02 / GW-35, GW-23, T-29/T-16 | Colocated distribution/filesystem/naming cases cover explicit source identity/schema, paths, hashes/serialization, writes/refusals and naming contracts. Markdown/shared-rule cases cover located diagnostics, exact rebasing, globs/collection and containment. | Two independent workers ran 17/17 and 16/16 focused cases. Actual Windows junction refusal/outside-byte preservation passed; Linux branches remain unrun locally. Evidence: .cache/fnd02-files/evidence.json and .cache/fnd02-markdown/evidence.json. |
| FND-03 / GW-35, GW-23, T-29/T-16 | Six checking cases, seven export cases, six migration cases and three new pure configuration cases augment existing planning/testing/policy/API evidence. Refused recovery compares every payload/journal byte, and binary originals, missing targets, no-op, stale input and tampered snapshots are exercised. | Focused checking/export passed 13/13; migration/planning passed 16/16 before review strengthening. Final integrated run below includes strengthened assertions. |
| Bounded export defect discovered during FND-03 | Missing or empty/BOM-whitespace SKILL.md now refuses before output writes. Existing metadata formats and CRLF/Unicode payload bytes are preserved; no new YAML restriction or atomic-source-snapshot claim is introduced. | Failures reproduced before the two-line preflight guard; missing dependencies, early/late differing output, repeat/no-op and actual injected partial-write reporting pass. Logs: .cache/fnd03-check-export-before.log, -repro.log and -after.log. |

## Integrated validation and review

- npm test: 145 total, 144 passed, zero failed, one explicitly skipped permission case. Actual environment: Windows, Node v20.19.6. Log: .cache/foundations-integrated-tests.log.
- npm run check: zero diagnostics after integration; required command ran against actual maintained source/docs.
- All twelve service modules now have colocated direct contract suites, with 93 declared direct cases plus existing API/CLI/package integration cases. Counts do not prove exhaustive correctness.
- An independent reviewer found no material issue in the bounded decisions/export production changes. Another reviewer ran nine focused root-added cases and requested stronger preservation proof and a narrower pure-validation claim; both improvements were applied before the final passing run.
- Existing packed offline-install, public ESM/CJS and relocated skill checks remain in the combined suite. No new service or exported command was introduced by this foundation work.

## Limits and next work

POSIX permission behavior and Linux/other Node matrix execution were not run locally. The test explicitly skips where chmod permissions cannot establish the intended boundary; no cross-platform pass is claimed. Broader supported-matrix/independent agent workflow proof remains INT-01 work.

The guard verifies a nonempty skill entrypoint, not full skill schema or an atomic source read. Tests establish documented boundaries, not general philosophical or agent conformance. Gated configuration/session/work/lifecycle implementations await the consolidated [contract proposal](../../../../skill/guided-workflows/execution/guided-workflows/execution-contracts.design.md) and actual review-policy decision. Independent inventories can continue without silently accepting those designs.
