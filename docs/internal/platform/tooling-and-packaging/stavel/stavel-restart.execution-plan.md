# Stavel restart execution

<!-- mdcomposer:meta
title: "Stavel restart execution"
kind: execution-plan
state: draft
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

execution-status: in-progress

Implement the [accepted restart decision](../../../decisions/stavel-restart.decision.md). Separate core, consumer and independent-review ownership; the coordinator owns backups, source delivery, skill replacement and old-repository retirement.

## Evidence and completion gates

The predecessor source at 962f647 was backed up with all Git refs, restored into a temporary checkout and verified with Git integrity checks before importing tracked contents into the new main checkout. Backup directory: constitutional-dev-backups/pre-stavel-20261126T163214Z, beside the source repositories. All three predecessor CI runs and their available logs/artifacts were captured; four captured ZIP archives passed integrity checks. The backup manifest records 110 file hashes. There were no issues, tags, releases, repository secrets or repository variables to migrate. The installed predecessor skill was backed up. Hashes of MenuLogiq's 19 existing dirty files were captured before consumer work.

Stavel core passed 67 tests on Node 20.19.6 and Node 24.22.3; npm run check reported zero diagnostics. The suite includes real offline package installation/export, dual library formats, new product identities, legacy refusals and the retained migration/recovery properties. The exported skill passed frontmatter validation and Markdown checks for non-template portable documents; rendered template behavior is exercised by adoption tests.

An independent read-only review used the actual catalog for an 82-operation bootstrap, verified zero-write dry-run behavior, and passed apply, verify and check. Relocated skill and offline installed package commands passed; all catalog assets were present. Foreign plans/catalogs and legacy markers were refused. Normalized comparison with the predecessor found only the intended identity changes and explicitly removed legacy compatibility.

The independent agent-led trial preserved Python source, accepted requirements and original instructions, then passed adoption after the documented routing merge. It exposed two defects before cutover: generated context metadata retained a generic owner, and a migrated canonical ownership link retained its old filename. Both were reproduced by failing regressions and fixed; existing declared owners remain unchanged. Stale-plan, partial recovery, rollback, intervening-user-edit protection and clean-break refusals passed in the trial. The corrected export requires a final focused trial confirmation.

The initial Stavel main run passed all eight Windows/Linux jobs across Node 20/22/24/26. Final corrected-source CI, consumer verification, installed-skill cutover and GitHub deletion still require observed completion. Do not substitute predecessor evidence for Stavel evidence.

Npm publication and its release pipeline remain deferred by the user. Source delivery and tested package snapshots do not imply npm publication. WARP's experimental adoption is outside this task.
