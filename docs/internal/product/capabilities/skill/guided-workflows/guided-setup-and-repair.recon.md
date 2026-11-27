# Guided setup, delivery and customization exploration

<!-- mdcomposer:meta
title: "Guided setup, delivery and customization exploration"
kind: recon
state: draft
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

Document status: draft exploration, not an accepted implementation contract. Current work state, phase and next action belong to the [capability status file](../skill.status.json). Observed baseline: Stavel 0.1.0, source revision 11b62a9. This document preserves the discussion across sessions; maintain its current understanding and decision sources rather than copying the chat transcript. Move completed recon into the archive after its conclusions have been incorporated into the canonical owners.

## Task and authority

The owner requested exploration and discussion of guided initialization, diagnosis and repair after the philosophy review on 2026-11-26, then expanded the discussion to guided design/delivery packets, discoverable help and structured customization. Writing this exploration record is within that task. Runtime implementation, commits, publication and deployment are not part of this exploration slice.

Current owners are the [package requirements](../../../contracts/framework/framework.requirements.md), [package design](../../../contracts/framework/framework.design.md), [CLI contract](../../../../../public/framework-cli.contract.md), [Q&A workflow](../../../../dev/agent-questions.guide.md), [EXPLORE prompt](../../../../process/prompts/explore.prompt.md), [tooling philosophy](../../../../philosophies/tooling.philosophy.md) and [interface philosophy](../../../../philosophies/interfaces-and-accessibility.philosophy.md). This recon proposes changes to those owners; it does not replace their current contracts.

## Confirmed user choices

These choices come from the owner's direct instructions and Q&A answers in this discussion, not from inferred repository patterns. They settle the listed questions only.

| ID | Choice | Source |
| --- | --- | --- |
| UX-01 | Support bare stavel init and stavel doctor; explicit arguments remain available as overrides. | Direct instruction, 2026-11-26 |
| UX-02 | Direct CLI use asks questions in the terminal; the skill uses the agent host's native Q&A or conversation. Both share the same decisions and repair engine. | Q&A answer: Both terminal and agent chat |
| UX-03 | Doctor shows findings, then offers a repair preview by default. This choice does not itself approve applying every proposed repair. | Q&A answer: Show findings, then offer a repair preview |
| UX-04 | Discover the project root from the invocation directory; ask when scope is ambiguous. Explicit --target overrides discovery. | Q&A answer: Detect the project root; ask when scope is ambiguous |
| UX-05 | Run mechanical diagnostics in both interfaces; add an agent-led philosophy review when using the skill. The standalone CLI must identify review-required findings without claiming those reviews ran. | Q&A answer: Mechanical checks everywhere, plus agent review when using the skill |
| UX-06 | Provide easy-to-discover getting-started help through stavel help and a skill help request using the host's supported invocation syntax. | Direct instruction requesting help, 2026-11-26 |
| UX-07 | Users can instruct Stavel to omit designs, change designs and augment skill behavior through a structured mechanism that controls drift. | Direct instruction requesting structured augmentation, 2026-11-26 |
| UX-08 | A customization applies to the current task unless stated as a standing rule; ask when its scope is ambiguous. | Q&A answer: Use task scope unless stated as a standing rule; ask when ambiguous |
| UX-09 | Retain a macro-execution tracker to organize execution work; whether additional macro prompt/slice artifacts are useful is a design question. | Owner's preference for the macro execution tracker, 2026-11-26 |
| UX-10 | A natural-language request to enter STRICT MODE should invoke the skill's built-in execution protocol for the accepted, authorized work. | Direct description of desired skill behavior, 2026-11-26 |
| UX-11 | Execution closure should verify the result against applicable philosophies and run selected tooling before reporting PR readiness. | Owner's requested close-execution behavior, 2026-11-26 |
| UX-12 | For substantial features, an accepted design PR is the default gate before committing implementation stories and delivery slices; repositories/tasks can record explicit exceptions. | Q&A answer: Required by default for substantial features, with explicit exceptions, 2026-11-26 |
| UX-13 | Support story-based human coordination alongside AI execution, and ensure a completed delivery slice leaves a coherent repository state. | Owner's story/slice and partial-repository concern, 2026-11-26 |
| UX-14 | Store an execution packet in a dedicated directory with each slice in its own file and a macro-execution file alongside them; archive the closed packet as a unit in the later lifecycle stage. | Owner's execution-directory and whole-packet archival instruction, 2026-11-26 |
| UX-15 | Select product as the default capability-document home, keep that home configurable, move this repository's platform tree to product now, and retain the directory-based execution packet. | Explicit naming/move and continued packet-drafting instruction, 2026-11-26 |
| UX-16 | Define product -> capability -> feature with optional deeper outer/group levels, and organize product into explicit capabilities and contracts branches with meaningful subdirectories. Stavel is the product; the discussion then treated skill as the only current capability. UX-25 corrects that model to include the implemented CLI. | Owner hierarchy clarification and explicit capabilities/contracts correction, 2026-11-26 |
| UX-17 | Each product home has a root overview explaining what the product is; bootstrap creates it by default from aligned project information. | Direct product-overview and bootstrap-expectation instruction, 2026-11-26 |
| UX-18 | Persist repository-selected defaults, structured overrides and decision references as committed source and resolve them from the beginning, so Stavel follows accepted local structure. A .stavel-config directory with taxonomy.config.json is the proposed home. | Owner repository-configuration/startup proposal, 2026-11-26 |
| UX-19 | The work index contains references only; capability-owned status files own current work state and lifecycle. A read-only tool collects those files and produces a transient summary for Stavel without storing duplicate status in the index. | Owner correction to the proposed work-in-progress index, 2026-11-26 |
| UX-20 | CLI commands generate/register/manage work records; the skill uses those commands. Versioned coded migrations support evolving formats while preserving existing users and repository choices. | Owner CLI-management and upgrade instruction, 2026-11-26 |
| UX-21 | Provide PLAN to develop/refine selected plans incrementally into coherent execution slices; an executor can perform missing preparation without requiring a separately invoked planning session. | Explicit endorsement of the mode/readiness explanation and instruction to capture it using DESIGN, 2026-11-26 |
| UX-22 | EXECUTE accepts a selected slice, feature/plan or plan set, checks readiness/dependencies/conflicts, prepares missing work, implements ready authorized scope using STRICT MODE and verifies/closes the requested boundary. | Same explicit endorsement, 2026-11-26 |
| UX-23 | Provide VIBE for iterative product coding with contemporaneous decisions and proportionate design/plan/status updates, preserving existing requirements, review policy and verification. Keep it distinct from hypothesis-driven EXPERIMENT. | Same explicit endorsement, 2026-11-26 |
| UX-24 | EXPLORE is the discovery activity and produces recon; a separate installed recon skill is not required. Keep discovery, experimentation, design, planning, execution and review understandable through their distinct purposes. | Same explicit endorsement, 2026-11-26 |
| UX-25 | CLI is a sibling capability to skill, each meaningful CLI feature has its own documentation home, and guided workflows belongs in a subordinate skill feature directory. Shared service responsibilities have canonical design owners. | Owner correction after inspecting CLI service source, 2026-11-26 |
| UX-26 | Stavel proactively identifies these owners from actual intent/surfaces or asks a focused material ownership question rather than waiting for repeated human reminders. | Same direct instruction, 2026-11-26 |
| UX-27 | CLI tools need explicit engineering philosophy, documented service naming/boundaries and meaningful tests for every service. | Same direct instruction, 2026-11-26 |
| UX-28 | In Stavel itself, tests live in files beside the files/contracts they test, replacing the separate tests directory convention. | Owner direct local testing-philosophy instruction, 2026-11-26 |
| UX-29 | Test placement is configurable during init: follow accepted repo conventions, choose a profile default or propose a language/toolchain convention when appropriate, with explicit alternatives and alignment. | Same direct default-configuration/init instruction, 2026-11-26 |
| UX-30 | EXPERIMENT is standalone experimentation/POC/learning; EXPLORE discusses requirements or code; DESIGN turns that evidence, including VIBE output, into design docs; PLAN generates execution slices from the design; EXECUTE carries out the work. PLAN is a distinct activity, not part of DESIGN. | Owner explicit correction of mode boundaries, 2026-11-26 |
| UX-31 | Stories can be inputs to EXPLORE/DESIGN or optional outputs of PLAN, including enterprise workflows; the user can choose the flow per repository or on the fly. VIBE combines the applicable activities while documenting and honoring philosophies throughout. | Same explicit correction, 2026-11-26 |
| UX-32 | CLI help and skill help should explain these mode purposes and workflow choices. | Same help instruction, 2026-11-26 |
| UX-33 | PLAN asks whether to generate stories by default; explicit configured suppression chooses always/never generation without that question. Prior explicit answers for the current planning scope count. | Owner follow-up default-ask instruction, 2026-11-26 |
| UX-34 | Provide an overridable repository story template and seed it during init. | Same template/bootstrap instruction, 2026-11-26 |

The [work-status design](../../../contracts/configuration/work-status.design.md) captures UX-19/20 ownership and upgrade requirements. Current JSON records are source-local examples; CLI collection, mutation and schema migrations remain planned.

## Observed system

The current [CLI](../../../../../../src/stavel.cli.ts) already falls back to the current directory when --target is absent. However, init still requires --answers and --name, does not conduct terminal Q&A, and applies its plan without an integrated post-application check. Doctor is not a current command. The requested experience therefore needs orchestration and scope discovery, not just making --target optional.

[Inspection and questions](../../../../../../src/decisions.service.ts), [planning](../../../../../../src/planning.service.ts), [application and recovery](../../../../../../src/migration.service.ts), and [checking](../../../../../../src/checking.service.ts) are already separate. Reuse those boundaries and the question catalog; avoid separate terminal and agent implementations of decisions or file mutation.

The baseline philosophy review passed 67 tests and structural check with zero diagnostics, but additional probes demonstrated gaps:

| Finding | Evidence | Desired protection |
| --- | --- | --- |
| Default document-kind definitions diverge. | The [policy fallback](../../../../../../src/rules/policy.service.ts) rejects seven kinds accepted by the [default profile](../../../../../../config/default.profile.json), including execution-slice and profiles. | One canonical registry and regression coverage of all defaults. A generic duplication detector requires agent judgment about ownership. |
| Invalid package.json becomes an empty script inventory without a diagnostic. | A scratch inspection of malformed JSON returned packageScripts as an empty object and only the generic observation note. | Explicit missing/invalid/unavailable states; no success-shaped empty observation after parsing failure. |
| Relevant tooling selection remains implicit in Stavel itself. | The generic default disables documentation-impact and source-naming; the package has no explicit local Stavel configuration. | Recommend applicable checks, record explicit selection or deferral, reuse existing enforcement and configure owners/scopes. |
| A README description of the evidence location is stale. | README refers to an active execution record after the restart record was archived. | Check maintained links mechanically; review whether surviving prose still describes the current state. |

The first two findings require fixes in Stavel itself. Initialization cannot repair defects in its own diagnostic engine by scaffolding another repository. Generic findings should distinguish mechanical evidence from architectural or semantic review.

The current lifecycle already defines recon, requirements, design, slice planning, implementation, verification and closure. The skill only indirectly routes agents to these instructions; the CLI plan command concerns adoption/migration file operations, not arbitrary feature delivery. A guided feature workflow needs explicit routing and resumable phase/artifact awareness.

The MenuLogiq template comparison found a smaller Stavel packet. Product, requirements, generic design, decisions and test plans exist; interface guidance is condensed. Dedicated backend, architecture-diagram, accessibility, IAM/access-matrix, instrumentation, documentation-plan, help and public-docs templates are absent. MenuLogiq also has execution-slices collections, execution prompts, macro tracking, phase status and IAM execution planning beyond Stavel's current plan/slice/recon/verification set. Sources are the sibling repository's docs/internal/templates/design/README.md, templates/index.md and templates/execution/README.md. Generalizing the relevant coverage is a proposal; stack-specific application mandates must remain local. Existing generic frontend/backend profiles are illustrative decision aids, not full packet extensions.

Current stavel help displays CLI usage; it is not yet a task-oriented getting-started experience. The [extension policy](../../../../process/framework-extension.policy.md) already describes amendments with applicability, rationale, acceptance and enforcement, and selected configuration supports scoped choices. However, there is no implemented resolver for versioned template/workflow extensions. Changed installed files receive review notes; that alone does not reconcile an amendment's meaning with upstream changes.

The existing [STRICT MODE](../../../../process/prompts/strict.prompt.md), [REVIEW](../../../../process/prompts/review.prompt.md) and [lifecycle](../../../../process/development-lifecycle.policy.md) already require faithful implementation, relevant verification, evidence and closure. They do not yet provide an explicit guided close-execution entrypoint or tracker orchestration. MenuLogiq's macro-execution template combines progress/dependency tracking with a copied executor prompt; its execution-slices, phase-status and execution-prompt templates also carry overlapping status. Preserve useful coordination while deciding which facts need one authoritative owner.

## Proposed experience

The following behavior is proposed beyond the confirmed choices above. Command examples describe the intended future interface, not commands available in the current release.

For stavel init: resolve and display scope; inspect existing conventions, instructions and tools; ask only applicable unresolved questions; recap the complete selected configuration; preview setup and authorized repairs; apply through the existing preservation/recovery machinery; verify; report remaining work. Existing accepted decisions count as answers.

For stavel doctor: resolve scope; load accepted configuration; run applicable diagnostics; distinguish pass, failure, skipped, unavailable and review-required findings; offer a concrete repair preview; apply within established authorization; verify the affected properties. A read-only diagnosis should remain useful even when the user declines repairs.

Terminal prompts and agent Q&A should present the same stable question IDs, options, applicability and resolution evidence. The engine should return structured state suitable for human rendering, agent consumption and later automation. No embedded model/provider is proposed merely to conduct terminal Q&A. UX-05 settles the presence of agent review through the skill; its exact scope, evidence and repair workflow still need design.

Each finding should identify its check/version, source location, evidence, severity, owner and next action. Separate deterministic repair candidates, decision-dependent proposals and manual investigation. Mechanical repairs may be available to either interface; prose, acceptance, canonical ownership and application behavior must not be invented to obtain a green result.

Keep plan previews, stale-input checks, conflict refusal and journal recovery. Repeated setup should preserve local amendments and avoid repeating settled questions. Passing mechanical checks does not establish universal philosophy adherence.

## Proposed help and customization model

This section is a design proposal under UX-06 through UX-08. No new CLI flags, extension schema, template pack or resolver has been implemented or accepted by this document.

Help should explain what Stavel does, how to begin, and how to ask it to explore, design, plan, implement, review or customize a task. Include short examples, the distinction between CLI capabilities and agent judgment, and the next useful action for an uninitialized or adopted project when context is available. General help must also work outside a repository without generating files. Skill invocation syntax is host-specific; illustrate the supported skill invocation rather than promising that @stavel is universal. Both help presentations should derive workflow names, available capabilities and applicable customization information from shared definitions. Help must distinguish available behavior from proposed or unavailable capabilities.

Natural-language instructions are the user-facing customization interface. The agent resolves intent and scope, translates it into a reviewable amendment, reuses explicit authorization and asks only about material ambiguity. Amendments should be repository-owned when standing policy and task-owned when temporary. Installing or updating the skill should not require editing a machine-global SKILL.md for each project's preferences. Task exceptions must not accidentally become repository defaults, and repository policy must not leak into other projects.

An amendment should identify a stable ID/version, owner, scope, target capability/artifact/section/question/rule, intended operation, rationale, source instruction or decision, applicability, compatibility and verification. Candidate operations are select/omit an artifact, augment a section, explicitly replace a specified template contribution, add an artifact, and adjust selected questions/review steps/check configuration. Exact operations and schema remain open. Selecting an executable extension does not itself authorize downloading or running new code.

Keep one source for each base definition and each amendment. Resolve an effective profile for the current repository/task, then use it consistently for help, agent instructions, packet selection, generation, questions and checks. Expose why each artifact or rule is included, omitted or changed, with its originating instruction. Generated views are derived artifacts, not competing handwritten policy owners. Changes to a design packet must preserve traceability from requirements to design, execution slices and evidence.

Use stable semantic targets and explicit composition rules so upgrades can detect removed targets, incompatible versions, overlapping replacements, missing dependencies and newly relevant requirements. Report unresolved conflicts with the affected scope and a proposed resolution; do not use silent last-writer-wins behavior. Track the selected base and extension versions so an upstream change can produce a meaningful diff and migration proposal while preserving accepted local amendments. A task instruction can authorize a scoped exception or amendment; record the affected policy and reason rather than pretending a persisted profile overrides the user.

Omission is a recorded selection with scope and rationale, not a missing file indistinguishable from forgotten work. Examples: omit backend design for a frontend-only task; add a threat-model section to applicable backend packets; use an existing requirements owner instead of generating a duplicate. The agent should flag when a requested omission leaves a required behavior or mechanism without an owner, and resolve that specific conflict instead of silently dropping the requirement.

Doctor can mechanically validate references, versions, targets, applicability records, expected artifacts and consistent resolved configuration. Agent review assesses whether omissions and additions are appropriate and whether design intent was preserved. Neither path may claim that structural validation proves semantic correctness or permanently eliminates drift.

## Proposed planning, execution and closure behavior

The agent should recognize readiness to draft execution documents when a useful scope has understood outcomes, requirements and required mechanisms, sufficiently settled design decisions, concrete acceptance and relevant verification. It should identify unresolved decisions and the slices they affect; the entire initiative need not finish design before an independent ready slice can be planned. During an authorized exploration/design task, drafting a plan remains planning, and does not silently begin implementation. Describe the transition and reuse settled choices instead of asking ceremonial permission at every phase.

Proposed execution artifacts have distinct responsibilities:

| Artifact | Responsibility |
| --- | --- |
| Execution plan | Delivery scope, requirement coverage, decomposition, dependencies and strategy. |
| Execution slice | The specific outcome, requirements, non-goals, defining mechanisms, acceptance and verification for a reviewable change. Built-in STRICT MODE supplies the common execution protocol. |
| Macro-execution tracker | Current coordination across slices: phase, dependencies, ready/blocked work, next actions and links to actual evidence. |

A separate copied macro prompt or per-slice wrapper prompt is not proposed as a default requirement. Custom profiles may require additional artifacts when they add value. A small task can use one slice with a concise status section; the macro tracker is most useful across multiple slices. Exact artifact selection and filenames remain to be finalized.

Keep each execution fact authoritative in one place. A tracker should derive slice status from its source or be validated against it; a checkbox must not establish completion independently of verification. Where separate plan, slice and tracker documents exist, cross-link instead of repeating requirements, design or the entire STRICT MODE protocol. Decide whether phase/status can live in the macro tracker instead of requiring another phase-status file.

A request such as enter STRICT MODE should resolve the current task and intended scope, read its accepted owners and the actual diff, identify ready work, implement within existing authorization, verify, and update its execution record. Execute the scope requested by the user: a named slice, ready subset, or entire agreed plan as applicable. If that scope is genuinely ambiguous, resolve that question; do not treat a mode name as blanket permission for unrelated work or external actions. An existing user stop, pending design decision or partial failure remains visible when resuming.

Proposed close-execution is a named entry into REVIEW and lifecycle closure, not a replacement constitution or an automatic declaration of completion. Its scope may be a slice, a PR-sized subset or the whole initiative. Review original requirements, accepted decisions, required mechanisms, the actual changes and applicable philosophies; account for task/repository amendments; run the selected relevant checks; fix in-scope defects when already authorized; reverify affected behavior; reconcile docs and record residual gaps. Report complete, partial or blocked with requirement-level evidence and a bounded readiness assessment. Checks marked skipped or unavailable must remain visible. Existing read-only review requests do not become authorization to edit merely because repair is technically possible.

Verification remains part of implementation. The proposed default is to perform appropriate verification/closure automatically at the end of the requested implementation scope, with an explicit close execution request available to resume or rerun closure after later changes. Work needing semantic review or a relevant test cannot be marked complete solely because structure or lint passes. Review independence should match the risk and the repository's accepted workflow.

PR readiness is separate from completing the whole initiative. A verified slice can be ready for a PR while other slices remain planned. Resolve the intended PR scope, check preservation of unrelated work and selected repo checks, prepare an accurate summary and evidence, and state outstanding blockers. Opening/pushing/merging a PR, publication and deployment remain governed by the actual user task. After full initiative completion, archive delivery records and preserve current canonical owners and useful handoff links.

## Open design questions

### Capability home naming

The owner accepted product and then explicitly selected product > capabilities | contracts > subdirectories. The [documentation-home decision](../../../../decisions/product-documentation-home.decision.md) records source migration authority. The default product home remains configurable; current local capability docs are under product/capabilities/skill and shared contract topics under product/contracts. Existing repositories retain their accepted homes unless migration is explicitly aligned.

The internal root remains docs/internal. MenuLogiq deliberately distinguishes shared platform primitives from application modules. Stavel's shipped runtime still inherits literal platform/modules/edge role keys in its default profile and planning remapper, despite allowing configured paths. GW-24/D-10 now track generalizing those responsibilities and setup questions while preserving accepted existing mappings; this runtime work is not claimed by the documentation move. Keep stable concept owners separate from work-item labels and execution locations.

### Repository-owned configuration and early resolution

The owner proposed a committed .stavel-config directory, including taxonomy.config.json, that stores selected defaults, overrides and decision information and is referenced from the beginning. The [repository-configuration design](../../../contracts/configuration/repository-configuration.design.md) now owns the draft contract. The repository chooses its actual roots, owners, naming, lifecycle and checks; bundled new-project defaults must not force MenuLogiq or another existing repository into a competing structure.

Use one early resolver after actual task/root instructions and scope discovery, before assuming owner paths or generating questions/files. Share the effective settings across relevant CLI and skill workflows, including inspection/questions, plan/init, check/doctor, help and execution/closure. Commit durable policy/decision sources; keep partial sessions, journals and generated runtime noise separate. Detailed design/ADR rationale remains in canonical owners and is referenced by configuration decisions instead of duplicated.

Record baseline/default versions and origins so upstream upgrades produce an explicit diff instead of changing local expectations silently. Exact directory/topic schema, offline baseline availability, merge rules and old root stavel.config.json migration remain D-03/D-11 choices. No unsupported live .stavel-config directory has been created during drafting. GW-27/T-21 track implementation and consumer parity.

### Product overview at the root

The owner explicitly requested a root product overview explaining what the product is and made it a default bootstrap expectation. The local [product.overview.md](../../../product.overview.md) now owns that explanation, separate from navigation index.md. The default template should render product identity, audience/problem/outcomes, current capabilities and scope, non-goals, owner and shared-contract links from actual aligned answers. Existing accepted overviews are mapped/reused, and local amendments survive repeat setup. Filled Stavel product prose is not a portable template. GW-26/T-20 and the affected slices track executable generation and preservation; creating this source overview does not claim that the generator already creates it.

### Ownership hierarchy clarification

The [hierarchy design](../../../../process/documentation-hierarchy.design.md) now owns the draft semantic definitions and selected two-branch structure. Product identity is already established by this repository. Capabilities own behavior/features; contracts own shared obligations grouped by topic. Optional outer platforms/products and deeper groups express real scope without fixing physical depth or requiring Stavel-specific names. The current source tree has been reorganized accordingly.

The owner subsequently corrected the skill-only inventory in UX-25: the implemented CLI and skill are sibling capabilities. Guided workflows is a real feature at product/capabilities/skill/guided-workflows with its execution packet below it; individual CLI features and shared service contracts now have their own owners. The [hierarchy design](../../../../process/documentation-hierarchy.design.md) owns semantics; the [CLI index](../../cli/index.md) routes observed/planned tool behavior. No future website scaffolding is needed.

The desired archive retains the original ownership path so historical work is findable by capability. Candidate mapping: docs/internal/product/capabilities/skill/workflows/explore/execution/<delivery-id> -> docs/internal/_archive/product/capabilities/skill/workflows/explore/execution/<delivery-id>, or the same mirror beneath a configured archive bucket. Exact archive prefix/bucket remains a design choice under D-06. This archives the closed delivery packet, not the living capability's requirements/design. Preserve distinct delivery IDs, actual results, incoming/outgoing links and current-document historical sections.

MenuLogiq evidence: docs/internal/dev/docs-governance.policy.md places active delivery beside its platform/module/edge owner; docs/internal/platform/index.md distinguishes shared capabilities from product modules. Its governance explicitly says archive is flat by default, with a one-level initiative folder when needed. It does not currently mandate a full ownership-path mirror. Retain its ownership/lifecycle principle and explicitly design Stavel's proposed mirror instead of claiming that convention was already extracted unchanged.

This clarification is reflected in the current local source layout. Executable hierarchy/profile/template behavior remains planned under GW-25 and D-10; current shipped role keys are not claimed to support the full new model. The model must represent conceptual owners and lifecycle paths instead of imposing a particular product identity, platform architecture or team vocabulary.

### Active packet and closure

UX-14 establishes a directory-based active execution packet: plan, individual slice files, macro tracker and eventual delivery evidence share a delivery directory, with an index for navigation/shared instructions. Durable requirements/design/decision owners and the canonical test plan remain outside that temporary delivery packet. The current draft now follows this layout under execution/guided-workflows at its existing capability owner; the former combined slice collection is replaced by ten individual files, and maintained links were rebased.

At full initiative closure, archive that directory together only after actual scoped verification, documentation reconciliation and accurate result recording. Preserve existing planned/failed/partial evidence; never manufacture completion to permit archival. Move with an explicit map that rebases links to external current owners and updates incoming references under appropriate historical headings. A partial PR closure does not archive the entire still-active initiative. Archive destinations need stable delivery identity and collision checks so later work on the same feature cannot overwrite prior evidence. Current packet is active and remains unarchived.

### Design review, stories and coherent increments

The owner selected an accepted design PR as the default review boundary for substantial features, with explicit exceptions. Draft story ideas or a provisional execution packet may inform review, but committed implementation stories/slices reference the accepted design baseline and its actual review evidence. A generated accepted label, a PR being opened or the mere presence of a design file does not satisfy the gate. Material behavioral changes return to the affected design/decision review under the selected policy; routine implementation details remain autonomous.

Proposed mapping: feature/initiative outcome -> reviewed design -> outcome-based stories -> one or more delivery slices -> implementation PRs. Story owns the tracked outcome and links to canonical requirement/acceptance IDs. Slice owns an executable merge increment and its evidence. A story may equal one slice/PR or contain several coherent slices. Technical enabling work can be a story with a stated consumer/outcome and acceptance; not every task needs an artificial end-user persona. Repository terminology and tracker integration are configurable. MenuLogiq's current project-management philosophy intentionally replaces stories/sprints with its slice taxonomy; that specific choice is not imposed on Stavel adopters.

Each completed code-delivery slice should leave a coherent, verifiable stopping point on its declared baseline plus already-merged dependencies. Existing supported behavior/contracts remain functional; build and required checks pass or a pre-existing exception is explicitly handled; rollout exposure, compatibility, migration and recovery are addressed where relevant. The slice must not depend on a later unmerged PR to repair basic behavior. Internal implementation steps can be coupled and locally incomplete while the slice is in progress; they are not automatically separate delivery slices.

Prefer a complete vertical outcome, or a deliberate compatible enabling increment such as an additive resolver with existing consumers unchanged and independently tested. An unfinished new feature can remain intentionally inactive behind an appropriate accepted rollout boundary; that is distinct from exposing broken behavior. Dependencies are allowed and explicit: an executor chooses a dependency-ready slice, not an arbitrary later slice in isolation. A story may require multiple slices, but each merge endpoint is checked on its own.

Plan review and closure should state the story/outcome, design baseline, prerequisites, observable post-merge state, compatibility/exposure and verification for each slice. If a proposed split cannot leave that state coherent, combine its coupled steps or redesign the boundary. The current eleven slices are provisional work packages; before treating them as final PR-sized delivery slices, S-00 and S-07 must reconcile story mapping and this stopping-point rule. No design PR or external story has been created by this discussion.

### Remaining mechanism questions

- Scope discovery: precedence among an existing Stavel configuration/manifest, workspace/package boundaries and Git root; behavior for nested projects, monorepos, non-Git directories and explicit nonexistent targets. Never silently promote a nested package to a broader write scope.
- Agent review details: the bounded philosophy review checklist, source/evidence requirements, findings format and integration with repair proposals. The standalone CLI should surface review-required work under UX-05; its exact output still needs design.
- Repair policy: the initial supported repairs, how to preview changes and explain their basis, how existing authorization is represented, and which actions need a new decision.
- Uninitialized targets: what doctor can diagnose before adoption and how it offers init without forcing adoption to obtain a useful report.
- Automation: explicit JSON/noninteractive controls, behavior with missing required answers or no terminal, exit codes, cancellation and output streams. Do not hang waiting for input in CI or infer consent from missing input.
- Resumption: how terminal and agent sessions retain partial answers and draft findings, which artifacts are local versus maintained documentation, and how to resume without target generation before alignment. A source-repository exploration record authorized by its owner is distinct from generating adoption files in an unaligned target.
- Existing tools: detection versus execution of repository scripts, how to avoid duplicate enforcement, and separate authorization for application execution, installing dependencies or adding CI/hooks.
- Contract ownership: where resolved decisions, selected checks, exceptions, evidence and known limitations live; what changes when rerunning init after an upstream version update.
- Packet coverage and workflow routing: which MenuLogiq design/execution artifacts to generalize, how to select relevant artifacts proportionally, and how the agent resumes the actual lifecycle phase without treating an adoption plan as a feature execution plan.
- Extension representation: declarative schema and stable targets, section augmentation/replacement semantics, scoped precedence/conflict handling, compatibility/version selection, provenance and upgrade reconciliation.
- Extension distribution: repository-local customization first, reusable team/community packs, package/catalog boundaries and how maintainers validate contributed packs. Sharing remains separate from authoring a local amendment.
- Help detail: the shared command/workflow catalog, getting-started examples, context-sensitive guidance, discoverability of active amendments and honest reporting of capabilities that need an agent.
- Execution orchestration: concrete readiness indicators, where the authoritative plan/slice/tracker facts live, generated versus validated tracker views, resumption after source changes and the smallest artifact set that preserves coordination.
- Closure: selected command/review registry, automatic versus explicitly repeated closure entrypoints, current-scope completion versus whole-initiative completion, review independence, and evidence needed for the requested PR scope.
- Design review/story mapping: review evidence and material-change handling, canonical story/requirement links, optional tracker integration, declared merged dependencies, and concrete coherent stopping-point evidence for each delivery slice.
- Capability-home implementation: product is selected by UX-15; settle neutral configuration roles, setup path questions and compatibility with current platform/modules/edge keys. The source-repository path move is complete; adopter runtime migration remains planned.

## Plan handoff, execution readiness and iterative delivery

The owner asked whether accumulated plans could be handed to a Stavel executor in one instruction, with automatic STRICT MODE and missing preparation, and whether an iterative VIBE workflow could preserve decisions/design/plans during real product development. The initial discussion distinguished these future workflows from the five currently shipped mode prompts. The owner then explicitly endorsed that explanation and requested capture using DESIGN; UX-21 through UX-24 record the accepted direction.

The [delivery workflow design](./delivery-workflows.design.md) now owns the detailed mode contracts, incremental plan handoff, readiness/dependency/conflict checks, VIBE iteration checkpoints and EXPLORE/EXPERIMENT distinction. GW-30 through GW-33 provide observable acceptance; D-13/D-14 retain unresolved machinery choices. This capture does not implement portable prompts/commands or waive the selected substantial-feature design-review gate.

For this initiative, S-00 performs contract/slice preparation; D-01 through D-16 contain unresolved details, and twelve work packages remain provisional. One future instruction can authorize preparation plus ready implementation without a separate planning ceremony. It must still respect actual review/acceptance, scoped authorization and material decisions. No runtime work starts from the present design-capture request.

## Capability discovery and CLI service consistency

The owner observed that the source already implements distinct CLI functions while the documentation represented only skill. UX-25 through UX-27 select the correction and proactive framework behavior. The local feature move used a reviewed hash-bound plan: 22 documents moved, ten referring/owner records updated, a zero-write dry-run preserved 166 inputs, apply/verify passed and 44 non-Markdown inputs outside the explicitly rebased status record stayed unchanged.

CLI feature designs now distinguish user-visible responsibilities from shared filesystem/naming/distribution/rule services. The [CLI architecture](../../cli/cli.design.md) explains local .service.ts functional-module naming and maps every service; the [test plan](../../cli/service-verification.test-plan.md) records current integration evidence and focused gaps across eleven services. S-11 plans actual gap closure. New portable ownership/CLI philosophies and source skill discovery guidance are updated now; structured discovery/enforcement and comprehensive service tests remain planned under GW-34/GW-35/D-15.

## Test ownership and configured placement

UX-28/29 supersede the earlier tests/services suggestion for Stavel's own implementation. Existing public API, rule and package suites now sit beside their actual owners; discovery supports colocation and production declarations exclude tests. The [local philosophy](../../../../philosophies/stavel-testing.philosophy.md) is source-local and not exported.

The portable [placement guide](../../../../dev/test-placement.guide.md), default profile and optional question define aligned adopter choices. The new testing service reports heuristic layout evidence and validates/persists policy through current answers-driven init, without moving adopter tests. Colocated service/process tests cover those boundaries. Language recommendations require applicable evidence and real alignment; richer interactive setup and enforcement remain planned. This is a bounded implementation of the explicit local convention/configuration task, not completion of the broader guided-workflow initiative.

## Corrected mode and story boundaries

UX-30 through UX-32 supersede the earlier suggestion that execution slice preparation could be DESIGN output. DESIGN now owns design docs, PLAN owns setup of execution, and EXECUTE owns implementation with STRICT MODE. An overall authorized task can transition between them, but EXECUTE does not silently do planning as its own activity. Standalone EXPERIMENT includes bounded learning/POCs; VIBE combines the relevant activities with durable intent and philosophy fidelity.

Story flow is configurable: input stories can precede exploration/design and optional output stories can accompany PLAN. The substantial-feature review gate concerns final implementation commitment, not whether a backlog/input story may exist first. Current source prompts and CLI/skill help now reflect this correction. Automated packet generation/orchestration, stored workflow configuration and the shared effective-help catalog remain planned. No existing provisional slice is promoted to ready by this correction.



## Next useful discussion

The owner subsequently requested a draft execution packet. The [requirements](./guided-workflows.requirements.md), [design](./guided-workflows.design.md), [decision register](./guided-workflows.decision.md), execution plan (archived; see historical context), execution packet (archived; see historical context), macro tracker (archived; see historical context) and [test plan](./guided-workflows.test-plan.md) now organize that work. Confirmed UX decisions retain their sources here; proposed mechanisms remain draft in the packet until actually resolved. S-00 handles those design decisions, and S-01 can independently fix the demonstrated default/inspection defects once implementation is authorized. This recon remains active because material design discussion is still open.

Walk through a greenfield terminal session, adoption of a repository with existing conventions, doctor finding an issue after adoption, and a user customizing a design packet. Show how a task-only omission differs from a standing addition and how each survives a new session or an upstream update. Resolve repair policy, agent review details and extension composition before selecting flags, persistence formats or implementation slices. Then update the existing canonical requirements/design/CLI owners with the aligned behavior and define acceptance scenarios, including noninteractive refusal, interrupted Q&A, conflicting amendments and preservation of local work.


The subsequent bounded mode/story implementation fixed the default-kind divergence by consuming the canonical profile and verifying all declared kinds, including story. The baseline findings above remain historical evidence; the malformed-package diagnostic is still unresolved. Current source guidance has eight prompts and CLI/skill help; actual agent conformance and broad orchestration remain separate from this component's process tests.

## Historical context (archived)

- [execution plan](../../../../_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.execution-plan.md)
- [execution packet](../../../../_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/index.md)
- [macro tracker](../../../../_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.macro-execution.md)
