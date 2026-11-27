# Configuration component verification

<!-- mdcomposer:meta
title: "Configuration component verification"
kind: verification
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Implemented boundary

The owner's acceptance of the consolidated contracts authorized this implementation. [configuration.service.ts](../../../../../../../../src/configuration.service.ts) resolves root or committed-directory policy, pinned snapshot/topic versions and digests, contained references, provenance, explicit read-set hashes, stable owners, definitions and repository/scope/task amendments. Conflicting homes, unsafe references, unsupported fields/versions, required-concern omissions and missing/cyclic dependencies refuse.

[Planning](../../../../../../../../src/planning.service.ts) carries hidden configuration inputs and absent competing-home preconditions, supports directory bootstrap/root retirement through hash-bound plans/journals and preserves story/testing choices and editable templates. Root answers-driven behavior remains supported. Active topic references and original pinned snapshot bytes are retained. Task/scope amendments cannot become standing adoption writes. Agent-assisted plan provenance requires its actual source and nondeterministic judgment warning.

[Inspection/questions](../../../../../../../../src/decisions.service.ts) expose configuration and reuse sourced accepted decisions; questions apply stable definitions. [Checking](../../../../../../../../src/checking.service.ts) shares policy/check amendments while preserving intentional explicit-config overrides. Generic export remains source-catalog driven.

## Observed checks

Isolated esbuild bundles under .cache/cfg-focused produced 37 cases across configuration/checking/planning/decisions: 36 passed, zero failed and one existing Windows permission skip. Evidence: .cache/cfg-focused/evidence.tap. Focused TypeScript no-emit checking of the new service/tests and integrated planning/checking/decisions sources passed.

The 16 new [configuration cases](../../../../../../../../src/configuration.service.test.ts) cover zero-write fallback, independent hashes/provenance, offline pinning despite package changes, explicit malformed-JSON override, conflicts/corruption/unsupported topics, real junction refusal, owner cycles, scoped/task isolation, dependency/refusal paths, actual directory bootstrap/repeat, preserved template bytes, root migration/rollback, interruption/resume, stale hidden inputs, question/check effects and source-export separation.

The subsequent serialization correction adds three cases, bringing configuration coverage to 19: fresh unchanged settings create no duplicated default topics; recursive object-field differences and array replacements preserve actual overrides and baseline provenance; original snapshot bytes/custom references survive compact serialization; explicit profile identity remains distinct from pinned baseline identity. Existing referenced topics that become empty remain versioned empty overrides instead of being deleted implicitly. Decisions contain actual supplied/preserved records only.

The latest isolated configuration/testing run passed 34 of 34 cases with zero skips (19 configuration, 15 testing). Evidence: .cache/cfg-focused/diff-testing-evidence.tap. Focused TypeScript no-emit checks including configuration, testing and guided sources/tests passed. The testing helpers choose the most specific configured source scope and offer evidence-first or explicitly sourced language/toolchain proposals; mixed/uncertain/unsupported guidance remains a question. They do not fetch guidance, install language packs, accept a proposal or move test files.

The explicit upgrade path adds two configuration cases, bringing configuration coverage to 21 passing cases. upgradeBaseline verifies the committed pin before composing the supplied packaged baseline with existing local topics/scopes/decisions. Ordinary reads keep the old pin; the upgrade explanation reports old/new baseline identity and field changes. Only an aligned migrate plan may replace the snapshot, and stale old-pin bytes refuse before writes. A converted legacy snapshot retains baseline.origin=legacy-root: upgrades refuse until its default/standing-choice mapping is reviewed, because conversion alone cannot reconstruct per-field intent. Actual caller answers versus selected profile defaults now retain their origin; unknown historical origins remain standing choices conservatively. This prevents later ordinary planning from restoring obsolete defaults after upgrade.

Evidence: .cache/cfg-focused/upgrade-guided-evidence.tap contains 21 passing configuration cases and 16 passing guided cases; its remaining guided case exposed a fixture Buffer-encoding error, corrected and passed separately in .cache/cfg-focused/binding-final-evidence.tap. Focused TypeScript checks passed. A combined current-source rerun remains a coordinator obligation rather than an inferred success.

Final bounded evidence: .cache/cfg-focused/upgrade-final-evidence.tap passes the three selected baseline-preview, upgrade-plan and legacy-conversion cases with zero failures (18 unrelated cases filtered). It covers the conservative legacy-origin refusal in addition to actual upgrade apply/repeat and stale-pin protection. Final focused TypeScript no-emit checks passed after that guard.

Shared-registry integration adds two cases, bringing the configuration set to 23. Every owned adapter now seeds the same packaged artifact/section/question metadata through packagedConfigurationDefinitions; old source fixtures without an artifact catalog retain adoption questions only. Artifact fact questions remain available for amendments/rendering but are excluded from adoption question dispatch. A real source-catalog section amendment and adoption-question replacement now work through inspection, questions, planning, checking and effective configuration. Malformed metadata refuses; this generic seed reader does not inspect template bodies or import the artifact/planning runtime. Evidence: .cache/cfg-focused/registry-parity-evidence.tap passes both selected cases with zero failures (21 filtered); focused TypeScript checks passed. Remaining coordinator adapters and final combined proof use the same exported helper.

Final configuration coverage is 27 cases after review-policy and standing-choice additions. Generic configuration questions use safe own-property lookup of the actual selected setting; explicit configuration leaves retain explicit-answer provenance and their declared shape. Existing topic leaves stay standing even when equal to the pin, until removed from their actual source. Fresh default-only topics remain compact. Selected generic values are materialized for thin baselines, and selected custom/JavaScript rule guards validate composed values with actual supplied-decision presence rather than demanding redundant raw answers.

The focused configuration/guided/planning/checking/testing/decisions run recorded 81 cases: 80 passed, zero failed and one existing Windows permission skip (.cache/cfg-focused/standing-full-regressions.tap). The subsequent small generic-materialization/rule-guard change passed all four selected consistency/preservation cases and focused TypeScript checks (.cache/cfg-focused/standing-final-evidence.tap). Full final integration results remain owned by coordinator verification.

## Remaining integration evidence

This is component/API/filesystem evidence. An isolated build of the evolving CLI stopped because its new help.service import was not yet present; no new CLI process success is claimed. Coordinator integration must complete actual new CLI plan/apply/check, required npm test/npm run check, source-repo adoption and relevant independent agent/relocation trials. Existing built-CLI cases in neighboring tests exercise the prior built interface, not the newly edited CLI. No commit, push, publication or global skill replacement occurred.

## Final integration reconciliation

The coordinator completed the previously pending combined proof: npm test reported 324 cases, 323 passed, zero failed and one existing Windows permission skip; npm run check returned zero diagnostics and TypeScript no-emit validation passed. Real CLI, native-terminal, independent-agent and relocated-package observations and their limits are recorded in the [integrated verification](../../../../capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md). Earlier pending statements above describe the component handoff at that time. They do not claim any unrun remote CI or external delivery.
