# Bounded philosophy and requirements review

<!-- mdcomposer:meta
title: "Bounded philosophy and requirements review"
kind: verification
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Assessment and authority

The reviewed implementation paths satisfy the authority, preservation, ownership and customization mechanisms assessed below. No unresolved material implementation gap was identified in this bounded final review after the coordinated corrections. Final slice closure still requires its actual check/result evidence; this record does not supply missing CI results or authorize Git, publication, deployment or global installation.

Reviewer: execution subagent execute_fnd02_markdown. This worker implemented configuration/guided/testing components and independently reviewed coordinator-owned CLI, initialization, diagnosis, work, export and delivery integration. The assessment combines cross-component source review with the focused evidence identified below; it is not a wholly independent audit of the worker's own implementation.

The [actual acceptance and amendments](./execution-acceptance.decision.md) control the historical planning text. In particular, the latest design-PR preference is recommended and configurable. DESIGN may proceed directly to PLAN using selected design evidence; selecting a design does not invent review acceptance. Teams can select a required review policy.

## Mechanisms checked

| Concern | Source and observed implementation |
| --- | --- |
| Source distribution versus adopter authority | [Distribution/export boundary](../../../../../../../../../src/export.service.ts) remains catalog-driven. [Configuration](../../../../../../../../../src/configuration.service.ts) resolves the selected target independently, pins profile bytes and checks topic containment. Local filled product prose/configuration is not selected as generic adopter content. |
| Shared configuration and standing intent | [Questions](../../../../../../../../../src/decisions.service.ts), [planning](../../../../../../../../../src/planning.service.ts), [guided preparation](../../../../../../../../../src/guided.service.ts), checks and root adapters use the common definition seed/resolver. Explicit choices agree with effective values; equal-default declared leaves retain their standing meaning. Default-only fresh topics stay compact. Scope/task amendments stay separate from repository adoption writes. |
| Status ownership | [Work records](../../../../../../../../../src/work.service.ts) enforce pointer-only registration and read actual capability-owned state with provenance. [Packet records](../../../../../../../../../src/lifecycle.service.ts) keep slice execution blocks canonical and macro trackers derived. Acceptance, selected design, execution result and capability lifecycle remain distinct. No persistent work-summary cache was introduced. |
| Product taxonomy and existing structures | Default owners use product with capabilities/contracts. [Initialization](../../../../../../../../../src/initialization.service.ts) uses actual semantic owner paths/canonical overviews, asks for missing facts and seeds no invented future capabilities. Explicit mapped platform/group/module paths remain supported; role identity is separate from folder spelling and depth. |
| Design customization and packet rendering | [Artifact rendering](../../../../../../../../../src/artifact.service.ts) and packet planning now share effective artifact/section definitions. Packets include an actual execution-plan document referenced by manifest.plan. Rendering retains amended template bodies while reserving canonical execution state and owned tracker blocks for the lifecycle service. Missing mandatory roles/refused input stay visible instead of falling back silently. |
| Modes, readiness and proportional work | Skill prompts retain EXPERIMENT, EXPLORE, DESIGN, PLAN, EXECUTE/STRICT, VIBE and REVIEW responsibilities. Packet planning records selection/review distinctly; dependency and coherent-endpoint fields precede execution. Semantic quality of the declared endpoint remains a reviewer responsibility. |
| Preservation, warnings and effects | Preview/hash/journal/recovery paths preserve inspected inputs and refuse stale/unsafe changes. [Effect provenance](../../../../../../../../../src/effects.service.ts), CLI and skill guidance distinguish supported deterministic transformations from declared AI-authored judgment, with the nondeterminism warning/source retained. Detected application scripts do not become an arbitrary execution hook. |
| Diagnosis, templates and closure | [Checking](../../../../../../../../../src/checking.service.ts) recognizes declared repository templates; [doctor](../../../../../../../../../src/doctor.service.ts) distinguishes structural results, unavailable evidence and semantic review. Repair remains allowlisted. Packet completion requires recorded evidence, required checks and review; archive preserves whole-packet identity/history and historical routing without completing current work owners automatically. |
| Testing and extension limits | [Testing policy](../../../../../../../../../src/testing.service.ts) selects the most specific declared source scope. Evidence and supplied language/toolchain guidance produce proposals; unsupported/mixed guidance asks. Colocated service tests, selected behavior checks and type/API checks serve different obligations. Java/Python/frontend/backend examples remain decision aids, not installed language packs. |

These checks were read against the [CLI philosophy](../../../../../../../philosophies/cli-tools.philosophy.md), [capability ownership](../../../../../../../philosophies/capability-ownership.philosophy.md), [local test ownership](../../../../../../../philosophies/stavel-testing.philosophy.md), [taxonomy](../../../../../../../process/documentation-taxonomy.policy.md), current skill guidance and the accepted guided-workflow requirements.

## Findings addressed and observed evidence

The review raised concrete issues with incomplete shared definition seeds, packet rendering bypassing amendments/missing a plan document, stale effective local review preference, preview writes, repeat companion routing and raw-versus-composed configuration choices. Final source inspection confirms the shared renderer/manifest plan, common registry, optional review selection, explicit local policy update and preserved owned routing. Focused configuration cases exercise question/effective-policy agreement, standing leaves, upgrades and the selected-rule guard correction.

Observed worker evidence: .cache/cfg-focused/standing-full-regressions.tap records 81 focused cases with 80 passed, zero failed and one existing Windows permission skip. That run preceded the final small generic-decision materialization/selected-rule guard change. After that change, standing-final-evidence.tap records all four selected preservation/consistency cases passing, and focused TypeScript no-emit checks passed. Coordinator full-suite, CLI, packaging and independent-agent evidence belong in their own actual verification records; no pending aggregate result is inferred here.

One documentation-only inconsistency was reported to the coordinator: the accepted requirements document still contained historical prose calling itself draft and describing only planning authorization. The coordinator reconciled that prose with the actual acceptance record during final documentation closure; the current user instruction remains controlling.

## Reviewed source fingerprint and limits

Reviewed source set: artifact.service.ts, checking.service.ts, configuration.service.ts, decisions.service.ts, doctor.service.ts, effects.service.ts, export.service.ts, guided.service.ts, help.service.ts, initialization.service.ts, lifecycle.service.ts, planning.service.ts, stavel.cli.ts, testing.service.ts and work.service.ts, all under src. The focus was the named boundaries above, rather than a line-by-line audit of every function.

Combined fingerprint at review: 4986ab3ed9ef2d5af136c1b1e93b8361af042af6824ea1152514ff1d371b0e14. Reproduce by sorting those src paths, computing each file's SHA-256, JSON-stringifying the resulting sorted [path, fileSha256] pairs without indentation, then hashing that JSON with SHA-256. Later relevant source changes require revalidation of the affected assessment.

Linux and the full supported Node/OS CI matrix were not run by this worker. A Windows permission-enforcement skip is unavailable POSIX evidence, not a passed permission test. Agent behavior depends on the host, repository, actual inputs and selected task; this review cannot certify every future agent or adopting project. Caller-provided authorship, review authority, substantive-feature classification and semantic evidence still require honest human/agent assessment. Unknown legacy default-versus-override intent refuses automatic baseline upgrade until mapped. No new language pack or external tracker integration is claimed.

## Coordinator verification

The final unchanged reviewed source passed npm test: 324 cases, 323 passed, zero failures and one existing Windows permission skip (.cache/stavel-reviewed-tests.log). npm run check returned zero diagnostics and TypeScript no-emit validation passed. This closes the local verification obligation without asserting remote CI, human approval or publication.
