# Stavel restart execution

<!-- mdcomposer:meta
title: "Stavel restart execution"
kind: execution-plan
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

execution-status: complete

Implemented the [accepted restart decision](../../decisions/stavel-restart.decision.md). Core, consumer and independent-review work used separate subagents; the coordinator owned backups, source delivery, skill replacement and old-repository retirement.

## Evidence and completion gates

The predecessor source at 962f647 was backed up with all Git refs, restored into a temporary checkout and verified with Git integrity checks before importing tracked contents into the new main checkout. Backup directory: constitutional-dev-backups/pre-stavel-20261126T163214Z, beside the source repositories. All three predecessor CI runs and their available logs/artifacts were captured; four captured ZIP archives passed integrity checks. The initial backup manifest recorded 110 file hashes; the final manifest verifies 202 files including cutover and retirement records. There were no issues, tags, releases, repository secrets or repository variables to migrate. The installed predecessor skill was backed up. Hashes of MenuLogiq's 19 existing dirty files were captured before consumer work and verified unchanged again after retirement. The restored Git checkout and bundle passed final integrity checks.

Stavel core passed 67 tests on Node 20.19.6 and Node 24.22.3; npm run check reported zero diagnostics. The suite includes real offline package installation/export, dual library formats, new product identities, legacy refusals and the retained migration/recovery properties. The exported skill passed frontmatter validation and Markdown checks for non-template portable documents; rendered template behavior is exercised by adoption tests.

An independent read-only review used the actual catalog for an 82-operation bootstrap, verified zero-write dry-run behavior, and passed apply, verify and check. Relocated skill and offline installed package commands passed; all catalog assets were present. Foreign plans/catalogs and legacy markers were refused. Normalized comparison with the predecessor found only the intended identity changes and explicitly removed legacy compatibility.

The independent agent-led trial preserved Python source, accepted requirements and original instructions, then passed adoption after the documented routing merge. It exposed two defects before cutover: generated context metadata retained a generic owner, and a migrated canonical ownership link retained its old filename. Both were reproduced by failing regressions and fixed; existing declared owners remain unchanged. Stale-plan, partial recovery, rollback, intervening-user-edit protection and clean-break refusals passed in the trial. A fresh relocated export passed the focused follow-up: generated owners and migrated ownership links were correct, existing declared-owner bytes and the required two-stage mechanism were preserved, and final check had zero diagnostics after only the documented routing integration.

The [corrected Stavel source](https://github.com/worklogiq/stavel/actions/runs/45861409766) and [skill-cutover documentation](https://github.com/worklogiq/stavel/actions/runs/45861834963) passed all eight Windows/Linux jobs across Node 20/22/24/26. mdcomposer's documentation update at d5bd0b7 also passed its eight-job matrix. The source has fresh Git history on lowercase main in public worklogiq/stavel.

The tested Stavel 0.1.0 package snapshot is from source 39fcb3e, SHA-256 de654bced7761af0130d56a1dd22c6030839eb39bd34d147a7138aea03bf8af4. It installed offline and exported the installed skill. All 87 manifest-listed skill files matched their hashes; the host skill is now named stavel, and the old discovery folder was moved to the verified backup. The existing Codex project-trust entry was retargeted to the new checkout with its section body retained. Installed CLI help, bundled Markdown help, frontmatter validation and the read-only question catalog probe passed without creating a target directory.

MenuLogiq's exact final package pair passed 52 tooling tests and all eight documentation checks on Node 20 and 24, plus an isolated frozen/offline two-package install, dual library imports and standalone export. The consumer update is committed and pushed at 003c0fa on feat/stavel-tooling in the separate menulogiq-stavel worktree; no application branch was merged or deployed. The actual branch, staged-format, ESLint, full-lint and commit-message hooks passed. Playwright discovered 18 tests in seven files; this is discovery evidence, not an application end-to-end run. The consumer documentation-tooling contract owns the detailed results. Original MenuLogiq dirty-file hashes still match all 19 pre-task files.

The old GitHub repository worklogiq/constitutional-dev was deleted on 2026-11-26 after the owner completed GitHub's fresh two-factor verification. GitHub displayed its successful-deletion message, and a separate authenticated repository API request returned HTTP 404. Its branch heads matched the saved inventory immediately before the deletion flow. The old local checkout remains preserved; the working project is now the sibling stavel checkout.

Npm publication and its release pipeline remain deferred by the user. Source delivery and tested package snapshots do not imply npm publication. WARP's experimental adoption is outside this task.
