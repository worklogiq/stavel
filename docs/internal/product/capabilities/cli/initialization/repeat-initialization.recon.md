# Repeat initialization and setup recognition recon

<!-- mdcomposer:meta
title: "Repeat initialization and setup recognition recon"
kind: recon
state: active
audience: internal
owner: repository-maintainer
updated: 2026-11-27
-->

## Task, authority and problem

The owner observed that running init in this adopted source repository still asks onboarding questions, asked why it does not recognize prior setup, then explicitly requested EXPLORE. This pass investigates observable behavior and options. It authorizes a durable recon, normal work registration and isolated scratch trials; it does not implement a new initialization contract, accept a design, generate execution slices or change global skill installation.

The desired outcome expressed by the user is recognition of existing setup rather than unnecessary repeated onboarding. The assistant's preceding suggestions about a successful already-initialized exit, partial setup and explicit reconfiguration are proposals until aligned. Configuration presence alone does not prove every required setup component exists or that accepted policy is semantically correct.

Owner: [initialization design](initialization.design.md). Applicable [question/alignment guidance](../../../../dev/agent-questions.guide.md), [EXPLORE prompt](../../../../process/prompts/explore.prompt.md) and [CLI philosophy](../../../../philosophies/cli-tools.philosophy.md). Current lifecycle state lives in [CLI status](../cli.status.json), indexed by the pointer-only [work registry](../../../../work-index.json). The previous guided-workflow initiative remains its own historical completed scope; this is a new discovery item.

## Environment and bounded observations

Observed on 2026-11-27, Windows, Node v20.19.6, source checkout C:/Users/steve/Projects/stavel, HEAD 11b62a9719d7990e5c7ee848164462861e0d920d plus the existing uncommitted implementation. Source and built bundles were already synchronized by the preceding execution. No npm publication or installed global skill replacement is assumed.

The source repository has valid committed-policy files under .stavel-config, mapped product/CLI/skill owners, product overview, root instructions, selected commands and version-2 work records. It has no .stavel.json installation manifest. Those are different facts: this checkout follows selected conventions but was not installed as an ordinary exported-framework target. The prior claim that initialization behavior was complete was too broad; the completed execution's tests did not prove a bare repeat invocation.

Local scratch evidence: .cache/explore-init-repeat.evidence.json and the accompanying exploration script. These cache files are local raw evidence, not portable or committed policy. The seven observed cases below preserve their essential results durably. Trial targets/caches were temporary siblings outside this repository, and snapshots confirmed preservation after each read/refusal. Scratch initial application was deliberate fixture preparation, not adoption or repair of a user's project.

| Observed invocation/state | Actual result |
| --- | --- |
| Installed greenfield fixture, repeat with the same explicit aligned answers but no track argument | Refused differing .stavel.json; target bytes preserved. |
| Same installed fixture, same explicit aligned answers and original greenfield track supplied | Preview with zero operations; target bytes preserved. This controlled difference isolates implicit track selection. |
| Installed fixture, headless repeat with a fresh cache and no answers | input-required with alignment as the sole question; target bytes preserved. |
| Installed fixture, interactive repeat with a fresh cache | Asked about defaults and full configuration alignment, then refused a differing .stavel.json; target bytes preserved. |
| Same unchanged installed fixture and the newly saved aligned session | Refused differing .stavel.json; target bytes preserved. |
| Installed fixture after an ordinary README edit | Refused stale/incompatible saved session; target bytes preserved. |
| Immediate repeat after a genuine interactive first setup and successful application | Refused stale/incompatible saved session; installed target bytes preserved. |

Separately, direct source getQuestions with no supplied answers reports 14 unresolved IDs, including project identity/intent, workflow/format choices, source language, verification and heuristic persistence/deployment subjects. The actual guided CLI may ask fewer when an external session has already selected defaults. Thus an individual user's prompt list depends on their cached answers; neither list proves a new decision is actually needed for an already adopted repository.

## Current flow and mechanisms

1. [CLI adapter](../../../../../../src/stavel.cli.ts) routes bare/new guided init to [prepareGuidedInit](../../../../../../src/guided.service.ts); explicit name plus answers retains a separate compatibility path. No successful already-initialized result exists in the guided result union; the adapter treats a missing plan as unresolved input.
2. Root detection and [configuration resolution](../../../../../../src/configuration.service.ts) read real policy first. Guided preparation then classifies track from current file presence unless an explicit track is supplied. It does not reuse the installed manifest track by default. Installing files converts an empty fixture into a nonempty one, even when the desired setup is unchanged.
3. The wizard reads/binds its external cache before checking for completed durable setup. The binding covers the observed file hashes, package/profile/catalog identities and requested arguments. A first installation changes those files and can invalidate its own retained pre-application session immediately. Ordinary README changes also invalidate an aligned session in the observed trial.
4. The defaults prompt precedes unresolved-question computation. [Question resolution](../../../../../../src/decisions.service.ts) can already reuse aligned manifest decisions and accepted configuration decisions; it is not wholly unaware of prior answers. It nevertheless requires a fresh answers/session alignment before planning, and convention-shaped fields do not automatically cover all separately named catalog questions.
5. [Planning](../../../../../../src/planning.service.ts) regenerates the manifest with track, alignment, decisions, entrypoints and installed hashes. A changed track or fresh alignment can make that manifest differ and trigger the supported preserving refusal. Do not bypass that guard merely to make a repeat appear successful.
6. [Diagnosis](../../../../../../src/doctor.service.ts) checks selected structural/product/work properties and missing manifest assets, but currently describes a missing manifest as unavailable adoption and recommends guided init. It always keeps semantic review distinct. Doctor has no shared structured initialization-state classification for the wizard to consume.
7. [The repeated-guided test](../../../../../../src/guided.service.test.ts) starts with existing instructions and supplies complete aligned answers on both calls; both tracks are existing. It checks preserving routing and zero repeated writes. It does not cover empty-to-installed track transition, fresh-cache bare invocation, post-apply session completion, or ordinary edits after a completed setup. CLI tests do not establish those cases either.

## Discrepancies and implications

| Intended outcome | Observed gap | Proposed design concern, not an accepted solution |
| --- | --- | --- |
| Ask only applicable unresolved choices, reuse accepted decisions | Defaults/alignment can be requested for an unchanged installed target | Resolve durable setup and requested delta before deciding to open a questionnaire. No new acceptance claim for unchanged choices. |
| Preserve legitimate safety refusals | A default track changes after first install and creates a manifest difference | Preserve actual durable installation identity/track unless a real explicit change is selected. Avoid an unconditional manifest rewrite. |
| Resume interrupted setup without obstructing completed setup | The retained pre-install binding can reject an immediate successful repeat | Separate incomplete sessions, successful durable setup and history retention; do not remove stale-session protection for unfinished writes. |
| Respect repo conventions and manual adoption | This source checkout has working policy and owners but no installation inventory | Decide how configured/manual adoption is recognized without inventing an installer receipt or silently copying the framework into itself. |
| Same semantics for terminal, skill/API and automation | Guided and legacy adapter paths can make separate decisions about questions and mutation | A shared read-only classification/delta operation should serve callers; do not special-case the CLI or this repository name. |
| Helpful but proportionate health assessment | A full doctor run scans broad Markdown/work policy and always includes semantic-review observations | Separate initialization readiness from unrelated repo health; define which findings invalidate setup versus merely route to doctor. |

Capability applicability deserves a separate bounded note: the current detector uses broad path patterns. A migration service filename and CI workflow can suggest persistence or deployment even when no application database/environment choice belongs in setup. They are observations requiring context, not proof of those requirements. This pass has not accepted a replacement applicability mechanism or expanded into a detector rewrite.

## Candidate behavior and tradeoffs

Recommendation: make plain init ensure the selected setup, rather than restart its wizard. A shared read-only result should distinguish absence, interrupted/partial setup, configured manual adoption, installed setup, damaged setup and explicit change requests. These may be independent facts rather than a single overloaded enum: configuration, installation inventory, routing/assets and session state can disagree.

For a complete unchanged setup, report a brief successful already-initialized result, exit zero and perform zero writes/prompts, regardless of user cache availability or ordinary product edits. This should not install newer packaged defaults, refresh timestamps or rewrite accepted alignment. A lightweight verification must support the claim rather than trusting a lone done flag or file existence.

For partial setup, identify specific missing components and decisions; preserve known values and route only the dependent work into questions/preview. For damage or conflicting policy, retain actionable diagnostics/refusal rather than silently rebuilding it or treating it as greenfield. Explicit baseline upgrade stays opt-in and hash-bound. Existing --mode migrate, answers/name/layout flags, preview/dry-run and failure semantics must be respected; an early exit must not swallow an explicit requested change.

Two alternatives need a deliberate decision. Requiring every configured repository to create an installer manifest is simple to classify but can force duplicate generic files into manual/source adoption. Recognizing manual adoption from validated selected components preserves repo structure but needs an explicit support contract and transparent provenance. If a durable setup receipt is needed, decide its authority and migration/versioning during DESIGN; do not add a second competing answer/configuration owner.

Successful completion should be durable across machines. An interrupted-session cache is an optimization/history source, not the sole proof that onboarding happened. A proposed completion record could bind selected config/assets/decision schemas instead of every product file. Retain user-chosen explicit-cleanup history; completed-session recognition does not automatically mean deleting the cache or ignoring corruption in a session being resumed.

## Accepted product direction

The owner answered both bundled questions on 2026-11-27. The [decision record](repeat-initialization.decision.md) owns those accepted choices:

1. Recognize the validated existing setup without registration, including manual/source adoption without an installer manifest.
2. Explain partial/damaged setup gaps and offer a preserving completion/repair preview, reusing known decisions and requiring explicit application.

The original user expectation remains recognition without repeated onboarding for a healthy setup. Recommendation: report already initialized briefly, exit zero and perform no writes when no actual change is needed. No further product choice blocks a bounded DESIGN pass. Exact readiness rules, formats and interfaces remain technical design work.

## Candidate next design scope and acceptance

With the two product choices aligned, DESIGN should define the shared classification/delta contract; the selected-component readiness checklist and configurable opt-outs; installation versus manual-adoption authority; durable completed/interrupted session transitions and schema migrations; accepted decision reuse; unchanged alignment/track preservation; explicit reconfiguration controls; API/JSON/terminal results and exit codes; and boundaries shared with doctor. A design PR is optional under current selected policy. PLAN would then create coherent execution slices; this recon is not that plan.

Proposed regression matrix: new empty/nonempty target; first successful terminal install followed by bare init; fresh user cache/new machine; original greenfield track reused; existing instructions; manual configured source-like target; ordinary README/source edits; valid editable template changes; new packaged defaults remaining pinned; missing owned component; conflicting/malformed config and corrupt manifest; stale interrupted session; failed/partial application and recovery; explicit requested config/upgrade/layout changes; terminal/API/headless parity and zero target/cache writes on true no-op. Preserve existing checks, declined previews, locks, journals and direct-aligned automation.

The smallest next useful step is a bounded DESIGN pass for repeat recognition and session completion, using the accepted direction. No production code or installed skill behavior changed in this exploration. Actual repository verification results for this recon/status change are recorded below.

## Verification of exploration artifacts

npm test completed: 324 cases, 323 passed, zero failed and one existing Windows permission skip. The local log is .cache/explore-init-doc-tests.log. npm run check returned zero diagnostics, including after the accepted Q&A choices and work handoff were recorded. Only documentation and source-owned work records changed; production code was not modified. Scratch trial observations above are independent current-behavior evidence, not proposed regression tests or proof of the fix. The passing pre-existing suite does not remove the observed repeat-run coverage gap.
