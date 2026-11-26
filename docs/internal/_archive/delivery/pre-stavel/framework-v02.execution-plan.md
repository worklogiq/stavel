# Framework 0.2 implementation

<!-- mdcomposer:meta
title: "Framework 0.2 implementation"
kind: "execution-plan"
state: "deprecated"
audience: "internal"
owner: "repository-maintainer"
updated: "2026-11-25"
-->

execution-status: partial

## Accepted inputs

Implement the [accepted decision](./framework-v02.decision.md) and package requirements without weakening existing preservation or verification properties. Delivery uses subagents with disjoint source, tooling and documentation ownership, followed by integration review.

## Slices and evidence

| Slice | Outcome | Evidence state |
| --- | --- | --- |
| Generic Markdown mechanics | Standalone mdcomposer with composition, indexes, metadata and validation | 41 tests passed on Node 20/24; all eight hosted Windows/Linux jobs passed on Node 20/22/24/26 |
| Node framework runtime | Bootstrap/adopt/migrate/check/export with scoped naming and aligned decisions | Node test suite and independent relocated-skill trial passed, including an actual partial Windows filesystem failure and recovery |
| Documentation and config | MenuLogiq-derived taxonomy, 57-path migration map, portable catalog, thirteen decision groups and four illustrative profiles | Local links, selected policy checks and standalone skill frontmatter passed |
| Policy modules and packaging | Reusable Markdown/optional JS checks, self-contained skill and npm package artifacts | Offline packed-package install/export and both public library formats passed; public declarations compile without a separate mdcomposer installation |
| Consumer compatibility | MenuLogiq adapters reuse packages while preserving local policy | Full eight documentation checks and focused tooling tests passed on Node 20/24; final consumer evidence belongs to its tooling owner |

## Completion

The implementation is complete apart from the explicitly deferred registry-release work below. Keep this execution record active while that delivery remains outstanding; do not manufacture release completion from passing local checks.

## Verification and review

- Reproduced the original 0.1.0 baseline separately: 21 Python tests and its structural check passed before replacing the runtime. The current repository has no Python runtime dependency.
- Ran npm test on Node 20.19.6 and Node 24.22.3. The final suite covers 61 cases: preservation, complete preflight refusal, actual CLI behavior, applicable decisions, naming independence, configuration application, metadata boundaries, legacy manifests, reference rewriting including composition directives, stale inputs, partial recovery, rollback, source rules, dual library formats and offline package/export closure.
- Ran npm run check with zero diagnostics. Checked exported non-template documents and origins with mdcomposer; template placeholders are validated after rendering through adoption tests. The skill-creator frontmatter validator passed for the exported skill.
- The independent reviewer reproduced eight defects in the first implementation and verified all eight fixes against fresh builds and the actual decision catalog. Review also compiled isolated public declarations under strict NodeNext without a mdcomposer dependency.
- A separate agent used only relocated exported artifacts. Adoption retained existing instructions and Python ownership/history, produced an internal local profile with the selected owner and source naming, and passed after the documented root-routing integration. Migration refused stale sources and later user edits. An actual Windows file lock caused partial application; resume, verify and rollback succeeded, restoring all seven original input hashes.
- Independent mdcomposer probes verified destination-only rebasing with punctuation in link titles, code labels and escaped syntax, explicit public metadata plus publication marker enforcement, repeat composition with no changes, and link validation.
- The public [mdcomposer verification run](https://github.com/worklogiq/mdcomposer/actions/runs/45596479847) passed all eight configured jobs. Framework hosted CI results remain associated with its source branch and must be inspected directly; local results do not stand in for an unobserved hosted run.
- Cross-platform CI identified Linux-specific intermediate-file diagnostics and journal validation of case-only moves. The implementation now rejects parent-file traversal consistently and validates each journal phase's destinations separately while preserving collision refusals.

These checks establish tested mechanical behavior and the bounded observations above. They do not prove application correctness, visual quality, human acceptance or universal agent compliance. MenuLogiq application execution, deployment and a full application test suite are outside this tool extraction. Original uncommitted MenuLogiq documentation remains in its original checkout; integration uses an isolated worktree.

## Deferred release work

The user requested CI/CD-based npm publishing and then explicitly deferred that work on 2026-11-25. Keep the existing verification workflows; do not add or run a publishing workflow in this implementation. Public npm publication remains pending. Repositories use versioned, integrity-locked package snapshots for reproducible prepublication development; replace those temporary snapshots with registry dependencies after publication.

The later release task must establish npm ownership of the worklogiq scope, first-package registration and trusted-publisher configuration for both repositories. Then implement a release workflow that validates versions and artifacts, runs the required checks, and publishes mdcomposer before Constitutional Dev. Prefer GitHub Actions OIDC over stored publish credentials; the [npm trusted-publishing contract](https://docs.npmjs.com/trusted-publishers/) defines the required runtime, workflow identity and package settings. Actual account setup and release authorization remain separate from authored workflow files.


Retired on 2026-11-26 by the Stavel clean restart. Original decisions, versions and verification claims above remain historical evidence.
