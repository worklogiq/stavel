# Prepublication dependency snapshots

<!-- mdcomposer:meta
title: "Prepublication dependency snapshots"
kind: contract
state: draft
audience: internal
owner: repository-maintainer
updated: 2026-11-25
-->

Public npm publication and its release pipeline are deferred by the user. The framework therefore builds against a repository-contained npm package snapshot of mdcomposer under tools/vendor. The package lock records the snapshot integrity. A fresh checkout does not require a sibling checkout, npm login or an unpublished registry version. The published framework artifact bundles its executable dependencies and has no runtime package dependencies.

The snapshot is a temporary package delivery mechanism. mdcomposer's source remains owned by its separate public repository. Do not edit the archive or copy its implementation into the framework. To refresh it, validate mdcomposer, create its npm pack artifact, copy that artifact into tools/vendor, update the dependency and lock, and rerun framework package and standalone-skill checks. Record the source commit and SHA-256 alongside the archive.

The MenuLogiq integration uses the same approach through temporary pnpm overrides while retaining intended public version declarations. Its local policy supplements remain owned by MenuLogiq.

After publishing mdcomposer, replace this file dependency with the exact published version and regenerate package-lock.json. After publishing Stavel, remove MenuLogiq's temporary package overrides and snapshots, regenerate its lock and verify a fresh registry install. These changes belong to the deferred release task; a successful local snapshot install does not establish registry availability or publishing access.
