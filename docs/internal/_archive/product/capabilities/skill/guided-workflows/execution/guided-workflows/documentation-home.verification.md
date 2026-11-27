# Documentation home and execution layout verification

<!-- mdcomposer:meta
title: "Documentation home and execution layout verification"
kind: verification
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

Result: COMPLETE for the user-authorized source documentation move and packet refinement only. Source baseline: 11b62a9 plus local uncommitted documentation. Guided-workflow runtime implementation remains planned; this record does not complete any of its twelve slices.

## Authority and change

The [documentation-home decision](../../../../../../../decisions/product-documentation-home.decision.md) records the actual user instruction selecting product and the directory-based execution packet. The source home is now docs/internal/product. The initial rename preserved the old nesting; the follow-up hierarchy now places skill under product/capabilities and shared framework/distribution topics under product/contracts. Requirements, design, decisions and the test plan remain outside the delivery directory.

This directory holds an index, execution plan, macro tracker, twelve separate slice files and this scoped verification record. Current owner links, README, developer routing and vendor-snapshot references were rebased. Historical rename-map destinations retain their original values. The active packet has not been archived.

## Actual evidence

| Property | Check and observed result |
| --- | --- |
| Concrete migration preview | Stavel plan/apply dry-run accepted 26 operations: 22 moved documents and four updated referring documents. All 150 inspected inputs matched their original bytes; no product destination or journal was created by the dry-run. |
| Actual application | Existing journaled apply completed; verifyPlan reported ok with zero diagnostics immediately after the move. Only verified empty source directories were removed. |
| Two-branch refinement | A follow-up dry-run preserved 154 inspected inputs, planned 23 document moves and seven referring-document updates, and created no new destination or journal. Actual apply/verify completed with zero verification diagnostics. |
| Preservation outside Markdown | A later SHA-256 comparison matched all 43 non-Markdown inputs in the plan, including source/configuration/tests. |
| Execution layout | One delivery directory, twelve distinct typed slice files, plan and macro links targeting those files; no combined-slice file references remain in maintained docs. |
| Draft traceability | All 37 requirement IDs map to slices and the 31 planned acceptance cases. Sixteen decision-register entries are present; dependencies are acyclic and the tracker matches planned slice states. |
| Baseline regression suite | npm test passed 67 tests, zero failures. This includes the repository's existing package/export checks. |
| Maintained references and policy | npm run check reported zero diagnostics after the migration and packet changes. |
| Whitespace | git diff --check passed. |

Local plan and recovery evidence is under .cache/product-documentation.plan.json and .cache/product-documentation-migration.journal.json. Packet prose was deliberately refined after initial byte verification; journal recovery will correctly refuse to overwrite subsequent edits without review. The migration journal is not a blanket permission to discard later work.

## Capability and feature refinement

The [capability-ownership decision](../../../../../../../decisions/capability-ownership.decision.md) records the later owner correction: CLI is a sibling capability and guided workflows is a skill feature. A third hash-bound move relocated 22 Markdown documents and updated ten referring/owner records, including explicit status reference rebasing. Dry-run preserved 166 inputs with no destination/journal; immediate apply/verify passed and 44 other non-Markdown inputs stayed unchanged. Its journal is .cache/guided-feature-migration.journal.json. Current feature/service docs were authored after that verified move.

## Limits and next work

GW-24 and D-10 record configurable product defaults, neutral capability-home roles and accepted existing-home compatibility. The shipped runtime profile/remapper retains its existing role keys until those planned implementation slices reconcile it. No feature tests for the new guided commands or resolver are claimed.

The 31 acceptance scenarios are a test plan, not newly executed feature evidence. No design PR, issue, commit, push, publication, deployment or host-skill replacement occurred. Continue with the actual design-review/decision workflow and keep all initiative slices planned until their scoped implementation and verification occur.
