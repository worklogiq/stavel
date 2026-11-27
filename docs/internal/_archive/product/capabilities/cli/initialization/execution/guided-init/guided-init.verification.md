# Guided initialization component verification

<!-- mdcomposer:meta
title: "Guided initialization component verification"
kind: verification
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Actual implementation and evidence

[guided.service.ts](../../../../../../../../../src/guided.service.ts) provides read-only scope discovery, external-cache decision sessions and guided initialization preparation. Explicit targets win; competing package/workspace/configuration boundaries become a structured scope question. Common Node, Python, Java, Go and Rust manifest evidence is recognized without executing those projects.

Sessions bind canonical target identity, package/profile/catalog inputs, selected pinned baseline and target read-set hashes. Corrupt, incompatible, stale or locked sessions refuse; cleanup/reset is explicit. Cache placement inside the target refuses. Guided writes use exclusive session locks and optimistic file hashes; they do not steal uncertain locks. Packaged defaults are not cached as standing repository overrides.

Headless preparation returns unresolved decisions without waiting or generating target files. Terminal preparation records actual responses, preserves them across interruption and presents the complete selected configuration, product facts and artifact destinations before alignment. Silence cannot select defaults or accept a recap. Input/catalog changes during conversation invalidate the preview. Actual selected workflow mode is passed to planning rather than inferred from track.

Preparation uses the [initialization composition service](../../../../../../../../../src/initialization.service.ts) to require missing product audience/scope/outcomes, preserve an existing mapped canonical overview and preview product navigation, overview, seeded story template and an empty version-2 pointer registry. Final configured owner/template paths follow actual plan mappings. No future capabilities, stories, accepted designs or active work are fabricated.

## Observed checks and limits

The isolated [colocated tests](../../../../../../../../../src/guided.service.test.ts) passed 15 of 15 cases with zero skips. Evidence: .cache/cfg-focused/guided-evidence.tap. Focused TypeScript checks identified a narrowing issue in the evolving initialization fact adapter; after coordinator correction the final focused check of configuration/testing/guided sources and tests passed. Cases exercise actual filesystem scope/cache/refusal behavior, terminal callbacks and resumable recaps, distinct headless product questions, actual preview/application, mapped paths, canonical overview preservation, verified companion routing on repeat, explicit configuration migration and stale-input refusal. Configuration component evidence is recorded in the CFG packet (archived; see historical context).

These tests exercise the shared APIs and terminal callback contract. They do not prove native host-agent Q&A behavior or the evolving CLI process. Required integrated suite/check, real CLI terminal/headless process trials, relocated/offline packaging and independent agent trials remain coordinator obligations. No full shared build, publication or global skill replacement was performed by this worker.

Two additional argument-preservation cases bring the guided test set to 17: explicit mode/name/layout flags reach the preview, conflicting supplied mode refuses, and saved sessions bind name/track/mode/frameworkPath/configurationHome/upgradeBaseline rather than reusing an old alignment for changed arguments. Requested flags appear in the recap. The combined bounded run passed 16 guided cases; a fixture encoding issue in the new binding case was corrected and that selected case passed separately. See .cache/cfg-focused/upgrade-guided-evidence.tap and binding-final-evidence.tap. Current combined-suite proof remains with the coordinator. Guided baseline upgrades use the same explicit aligned migrate-only path as configuration planning.

The later shared regression run passed all 17 guided cases within 81 cases across six services (80 passed, one existing Windows permission skip; .cache/cfg-focused/standing-full-regressions.tap). Guided preparation no longer copies inherited configuration into the answers as if it were newly explicit user input. It still resolves actual policy for questions/recap and binds all requested layout flags. Generic selected settings and standing-leaf preservation have the additional focused evidence in the CFG packet. Final integrated CLI/agent proof remains coordinator-owned.

## Final integration reconciliation

The coordinator completed the previously pending combined proof: npm test reported 324 cases, 323 passed, zero failed and one existing Windows permission skip; npm run check returned zero diagnostics and TypeScript no-emit validation passed. Real CLI, native-terminal, independent-agent and relocated-package observations and their limits are recorded in the [integrated verification](../../../../skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md). Earlier pending statements above describe the component handoff at that time. They do not claim any unrun remote CI or external delivery.

## Historical context (archived)

- [CFG packet](../../../../../contracts/configuration/execution/repository-configuration/configuration.verification.md)
