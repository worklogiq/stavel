# Configuration integration reconnaissance

<!-- mdcomposer:meta
title: "Configuration integration reconnaissance"
kind: recon
state: deprecated
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Scope and evidence boundary

Read-only source review for [CFG-01](./cfg-01-effective-config-reader.execution-slice.md), following the foundation contract tests. This record maps existing consumers and preservation requirements; it does not implement the resolver, accept a schema or waive design review. The [configuration design](../../../../../../product/contracts/configuration/repository-configuration.design.md) and [configuration contract](../../../../../../dev/configuration.contract.md) remain the owning sources. Revalidate this map against subsequent source changes before implementation.

## Current consumers and ownership

Source links below point to the reviewed functions rather than a second configuration specification.

| Source/function | Observed contract and integration boundary |
| --- | --- |
| [distribution.service.ts](../../../../../../../../src/distribution.service.ts): locateDistribution | Reads source-package assets catalog, config/default.profile.json, question catalog and package/profile identity. Keep source distribution separate from target policy; sourceRoot selects package assets. |
| [decisions.service.ts](../../../../../../../../src/decisions.service.ts): loadManifest | Reads .stavel.json installation identity, paths and hashes; preserves retired-product refusals. Installation evidence is separate from accepted policy. |
| decisions.service.ts: inspectRepository | Observes target files, fixed documentation-root candidates, languages, test layout and bounded Git history. It currently does not resolve accepted repository configuration. |
| decisions.service.ts: expandAnswers/getQuestions/alignedDecisions | Expands configuration.* answers, applies catalog applicability/defaults and requires actual alignment before generation. Existing nested configuration wins over expanded answer paths through nullish assignment. Accepted repository decisions must not be replaced by a fresh upstream default selection. |
| [planning.service.ts](../../../../../../../../src/planning.service.ts): configurationForAnswers | Clones the supplied baseline, overlays configuration and then applies specific selected decisions; validates source scopes, tools, testing and stories. Preserve its public API and existing answer precedence while introducing shared schema composition. |
| planning.service.ts: createPlan | Currently starts from distribution defaults, remaps docs/naming, preserves mutable templates and emits root stavel.config.json plus .stavel.json. CFG-01 must refuse unsupported directory-format writes; CFG-02 owns activation/migration. |
| [checking.service.ts](../../../../../../../../src/checking.service.ts): checkRepository | Explicit options.config wins; otherwise reads target root stavel.config.json, otherwise distribution defaults. Manifest routing remains independent. Pass resolved policy to structural checks and rule engine. |
| [testing.service.ts](../../../../../../../../src/testing.service.ts): resolveTestingConfig | Validates placement, fallback, roots, patterns and scopes. Optional/profile-default selections preserve configured settings; no tests are moved or generated. Reuse this validator. |
| [rules/policy.service.ts](../../../../../../../../src/rules/policy.service.ts): checkPolicy | Low-level explicit-config API; no repository discovery. Some fallback document kinds come from the build's packaged profile. Supply the complete resolved policy so newer packaged fallbacks cannot alter a pinned baseline. |
| [export.service.ts](../../../../../../../../src/export.service.ts): exportSkill | Uses explicit portable catalog, packaged defaults/questions, runtime and licenses. Never resolve the publishing repository's local policy into generic exports. |
| [stavel.cli.ts](../../../../../../../../src/stavel.cli.ts): runCli | Dispatches current consumers; target selects repository and source-root selects distribution. docs forwards to bundled mdcomposer. Keep Markdown-tool arguments distinct from Stavel policy discovery. |
| [index.ts](../../../../../../../../src/index.ts), [build tool](../../../../../../../../scripts/build.tool.mjs), [package.json](../../../../../../../../package.json) | Public API exports, bundled API/rules/CLI and explicit package assets need coordinated resolver export without local-policy leakage. |

## Exact compatibility traps

- [Checking tests](../../../../../../../../src/checking.service.test.ts) establish that explicit options.config remains authoritative even when root stavel.config.json contains malformed JSON. Current checking still reads the root path through fileBytes first, so path/directory/symlink failures are not the same as ignored malformed JSON. Preserve the deliberate override with explicit provenance; do not parse the ignored JSON first.
- [Filesystem walking](../../../../../../../../src/filesystem.service.ts) skips hidden directories. Consequently .stavel-config baseline/topics will not enter createPlan.inputs through current inspection. The resolver must return explicit read-set hashes for files actually consumed, plus expected absence of competing entrypoints; merge these into future plan preconditions. Otherwise hidden topic edits or newly added competing configuration can evade stale-plan protection.
- Current answer composition is shallow at each supplied top-level object, followed by specific decision transformations. It is evidence for compatibility, not permission to invent an arbitrary deep merge. Unknown legacy fields need explicit mapping/refusal before migration, not silent loss.
- Repository-template catalog assets preserve target bytes and stay outside immutable upstream hashes. Preserve story ask/always/never, selected template paths, testing scopes and post-preview hash protection. Configuration does not authorize moving tests or creating feature stories.

## Proposed integration seam

Use a filesystem-only discovery/validation layer and one shared resolver accepting an already selected target root, packaged fallback and any intentional explicit API override. Return effective policy, source kind, baseline identity/digest, located provenance, committed decision sources and explicit read-set hashes. Keep this below planning/questions to avoid import cycles. Scope selection remains the initialization slice's responsibility.

Resolve declared baseline/topic references relative to the configuration home, while owner/template paths retain repository-relative meaning. Check containment, missing references, schema versions and digest mismatches before use. Two active competing homes conflict rather than shadowing each other. Discovery and explanation create no target files. New-format mutation must fail clearly until the writer is supported. These are implementation recommendations pending the owning design selections.

## Minimal future vertical verification

1. Absent or nonexistent target resolves fallback provenance with a complete zero-write snapshot.
2. Root configuration retains source/testing/story choices and the explicit malformed-JSON override behavior above.
3. Directory configuration composes baseline/topics with independent expected values and located provenance; changed packaged defaults do not change the committed pinned result.
4. Missing/corrupt baseline, malformed/unsupported topic and two active homes refuse without fallback or writes.
5. Traversal and actual symlink/junction topic references refuse without touching target or outside bytes.
6. Read-set assertions cover hidden baseline/topics and absent competing entrypoints; subsequent changes fail preflight when writer integration arrives.
7. Read-only consumers agree on effective settings, while unsupported directory-format mutation refuses before generation.
8. Custom story-template bytes/path and scoped testing survive resolution. Generic exports remain unchanged by source-local policy and exclude filled local settings.

These are planned cases, not executed resolver evidence. Existing foundation tests establish their bounded current contracts; they do not prove this future reader, migration or agent behavior.
