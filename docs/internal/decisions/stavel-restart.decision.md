# Stavel clean restart

<!-- mdcomposer:meta
title: "Stavel clean restart"
kind: decision
state: accepted
audience: internal
owner: repository-maintainer
updated: 2026-11-26
acceptance: "user:2026-11-26:stavel-restart-implementation"
-->

The owner selected Stavel as the product name and approved implementation of the restart plan. There are no published npm consumers to preserve. The source is imported from the complete predecessor Node implementation at 962f647, with fresh Git history on lowercase main in public worklogiq/stavel.

The package, CLI and skill become @worklogiq/stavel@0.1.0, stavel and $stavel. Default conventions remain version 1. State files and exported tools use Stavel names. Predecessor aliases and automatic legacy imports are deliberately removed; generic adoption, documentation migration, hash preflight and journal recovery remain required.

The rejected alternatives were archiving the old GitHub repository, retaining legacy aliases, and continuing version 0.2.0. The selected retirement is deletion after verified backup and successful cutover. Backup preserves the original history and evidence; the new repository does not import that Git history.

Scope includes the installed skill, mdcomposer's active product references and MenuLogiq's tooling integration. WARP's older experimental adoption and unrelated MenuLogiq work remain untouched. MIT attribution is retained. Npm publication and its publishing pipeline remain deferred.

The active [execution owner](../platform/tooling-and-packaging/stavel/stavel-restart.execution-plan.md) records observed results separately from this accepted decision.
