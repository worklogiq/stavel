# Guided workflows design

<!-- mdcomposer:meta
title: "Guided workflows design"
kind: design
state: accepted
audience: internal
owner: repository-maintainer
updated: 2026-11-26
acceptance: "user:2026-11-26:eight-execution-contract-answers"
-->

## Contract and status

Draft architecture for the [requirements](./guided-workflows.requirements.md). The [decision register](./guided-workflows.decision.md) identifies unresolved mechanisms; UX choices in the [recon](./guided-setup-and-repair.recon.md) remain settled. Existing [package design](../../../contracts/framework/framework.design.md), [CLI contract](../../../../../public/framework-cli.contract.md) and [configuration contract](../../../../dev/configuration.contract.md) continue to describe shipped behavior until amended.

## Shared engine and responsibilities

~~~mermaid
flowchart TD
  CLI[Terminal prompts and explicit arguments] --> SESSION[Scope discovery and decision session]
  AGENT[Skill and host Q&A] --> SESSION
  SESSION --> PROFILE[Resolve effective profile and provenance]
  PROFILE --> WORKFLOW[Workflow and artifact catalog]
  PROFILE --> DIAG[Diagnostics and review tasks]
  WORKFLOW --> PLAN[Concrete scoped plan]
  DIAG --> PLAN
  PLAN --> APPLY[Preflight and journaled application]
  APPLY --> VERIFY[Verification and closure evidence]
  WORKFLOW --> HELP[Help and generated instructions]
~~~

Keep existing inspection/questions, planning, application/recovery, checking and export boundaries. Proposed services add responsibilities where needed; filenames and class names are not contractual. The terminal adapter renders prompts and collects explicit responses. The agent adapter uses the same question IDs and results while interpreting natural language and semantic evidence. Neither adapter maintains a separate configuration or mutation engine.

The effective-profile resolver consumes the base catalog, selected local conventions, repository amendments and task amendments. It returns resolved definitions plus their origin, version, applicability and unresolved conflicts. Help, questions, packet selection, generation and diagnosis consume this result. It cannot grant permission or override current user instructions.

A shared workflow/artifact catalog describes stable capabilities, compatible templates, relevant questions, supported checks and agent review obligations. Help distinguishes installed capabilities from proposals. mdcomposer continues to own generic Markdown mechanics; Stavel owns methodology and selected policy.

## Representative flows

| Entry | Flow and observable result |
| --- | --- |
| Bare init | Resolve/display scope, inspect facts, reuse accepted decisions, ask unresolved questions, recap alignment, preview, apply and verify. A second run explains amendments or no-op state instead of replacing them. |
| Bare doctor | Resolve scope, run applicable diagnostics even before adoption where possible, mark agent-only review honestly, show findings, offer a repair preview and apply only within authorization. |
| Skill design request | Locate canonical owners and current phase, identify the relevant packet, discuss requirements/alternatives, record decisions and design docs, then explicitly hand the selected design to PLAN for execution setup. |
| Skill execute request | Resolve the requested accepted slice/subset/plan, inspect changes and task amendments, follow built-in STRICT MODE, verify and update evidence/status. Do not silently start implementation during exploration. |
| Skill close-execution request | Review original requirements/mechanisms and actual changes, apply selected verification, reconcile owner docs and report scope completion and PR readiness separately. It also supports repeating closure after later edits. |
| Customization request | Interpret scope and target, ask only about ambiguity, create a reviewable amendment with real source instruction, resolve it consistently and expose its consequences. |
| Help | Show practical current capabilities and examples without requiring adoption or creating project files; explain active conventions when context is available. |

Arguments remain optional overrides for interactive use. Preserve explicit answers-file and lower-level automation paths. Resolve conflicts between a supplied answer, current accepted policy and current task deliberately; do not silently discard one. Noninteractive mode returns actionable unresolved state rather than prompting indefinitely. Exact option/exit/session formats depend on D-01/02/07.

## Planning, execution and iterative delivery

The [delivery workflow design](./delivery-workflows.design.md) owns the mode contracts and detailed flows for GW-30 through GW-33. The owner corrected the boundaries: DESIGN produces design docs, PLAN sets up execution from design, EXECUTE implements using STRICT MODE, EXPERIMENT includes standalone POCs/learning and VIBE combines the activities with philosophy fidelity. Eight source prompts and current static CLI/skill help now express this. Deterministic orchestration still uses the future shared configuration/catalog/management design.

A broad authorized task can transition explicitly through DESIGN, PLAN and EXECUTE without a separate user invocation for each; their responsibilities remain distinct. Accepted review evidence, coherent slice endpoints and actual scope still govern execution. Detailed multi-plan selection/readiness and VIBE checkpoint representation remain D-13/D-14 decisions.

## Authoritative state and boundaries

### Human review, stories and delivery endpoints

The owner's latest clarification recommends design PRs for substantial work while permitting direct DESIGN-to-PLAN and smaller-story workflows. Enforce a required review gate only when configured. Store its baseline/reference and actual acceptance evidence, or a scoped explicit exception. A draft execution packet can support review and remains provisional. Design acceptance and implementation execution/merge authorization are separate facts. Material deviations amend the affected design with review evidence; routine choices within the contract remain autonomous.

Map an initiative/feature to the reviewed design, outcome-based stories, delivery slices and PR evidence. Stories link canonical requirement/acceptance IDs and selected tracker records instead of becoming competing specifications. A story can be one slice/PR or several coherent increments; enabling/refactoring work can have technical consumers and acceptance. Configurable team terminology preserves this relationship without imposing MenuLogiq's decision to replace stories/sprints.

For every delivery slice, record the declared baseline and already-merged prerequisites, story/outcome, scope, observable post-merge state, compatibility/rollout/migration consequences and checks. Reuse of a dependent earlier merged API is acceptable; requiring a future unmerged PR to fix a broken consumer is not a completed delivery slice. Prefer vertical outcomes or compatible additive enabling changes. Keep a new incomplete feature inactive through an appropriate selected exposure boundary when needed. Combine coupled steps when their split cannot leave a coherent endpoint.

Closure verifies the requested slice against that endpoint on its declared prerequisites, and the final integrated scope against its broader acceptance. Preserve and report pre-existing failures separately rather than claiming an unrun or failed check passed. The initial twelve work packages must be reviewed/refined against this rule before they are treated as final PR-sized slices. D-09 owns the remaining story/review representation; this packet does not create external PRs or issues.

### State owners

The [hierarchy design](../../../../process/documentation-hierarchy.design.md) owns product/capability/feature semantics and the explicit capabilities/contracts branches. The current Stavel tree uses product/capabilities/skill for its shared skill design/delivery, with shared framework/distribution contract topics under product/contracts. No repeated stavel directory or empty website/workflow homes are needed. Optional outer platform/product levels and deeper capability/feature groups remain configurable; source folder depth does not determine semantic role. GW-25/D-10 track runtime adoption of this model.

For archival, preserve the closed packet's owner-relative path under the selected archive root or bucket; keep current design authority at the original capability. D-06 still needs the exact archive prefix/mapping and upgrade consequences. MenuLogiq supports local active ownership and later archival, but its current archive policy is flat-by-default; mirroring is a deliberate Stavel proposal. The local capabilities/contracts hierarchy is selected and applied; its runtime representation and exact archive prefix remain planned.

UX-14 selects a directory per active delivery packet, with the execution plan, separate typed slice files, macro tracker and eventual delivery evidence inside it. An index routes shared instructions and slice links; it does not duplicate requirements or own independent slice status. Current draft layout is execution/guided-workflows (archived; see historical context). Stable requirements, design, decisions and canonical test expectations stay at the capability owner. UX-15 selects docs/internal/product as the configurable capability-home default, and the current source documents have moved there. The neutral runtime role/compatibility mechanism remains D-10 work; do not hardcode the word product into conceptual ownership.

At full initiative closure, archive this delivery directory as one unit using an explicit path map, destination collision checks and rebased outgoing/incoming links. Update current docs' historical references according to taxonomy and preserve actual states/evidence. A slice/PR completion does not archive an unfinished initiative. Repeated delivery for one capability needs a unique packet identity so earlier evidence remains intact.

| State | Owner | Derived consumers |
| --- | --- | --- |
| Portable workflow/artifact definitions | Versioned canonical catalog and template sources | Export, help, questions, generation |
| Standing project choices/amendments | Repository profile/configuration and linked decisions | Effective profile and scoped checks |
| Task choices/amendments | Canonical owning task record | Current packet and execution |
| Work state, lifecycle phase, mode and next action | Capability-owned status file | Read-only transient work report and skill resume |
| Registered capability/status references | Pointer-only work registry | Validated collector |
| Partial Q&A session | Versioned session record, location pending D-02 | Terminal/agent resume |
| Mutation plan and before/after state | Existing typed plan and recovery journal, versioned if extended | Apply, resume, rollback, verification |
| Requirements/design | Canonical capability documents | Slices and review |
| Sequencing/dependencies | Execution plan | Tracker readiness |
| Slice result/evidence | Canonical slice record | Tracker projection and closure |
| Macro progress | Derived or validated tracker view | Human/agent navigation |

Concurrency, retention, atomicity and durability are not established by choosing JSON. S-00 must specify session writers, stale-state detection, interruption, partial-write recovery and cleanup. Preserve existing journal behavior; test additional interactions instead of asserting transactionality. Keep pre-alignment session state out of the adopting target. A human-authorized draft packet in this source repository is a different activity from adopting a new target.

## Work registry and CLI-managed lifecycle

The [work-status design](../../../contracts/configuration/work-status.design.md) owns the draft record/query/management/migration contract for GW-28/GW-29. The global index stores references only; each capability owns its work state, phase, mode, next action and blockers. Query output is transient with provenance. Slice files retain implementation evidence; macro trackers project those slice records and link the capability status instead of duplicating work-level lifecycle authority.

The skill uses shared CLI/library operations for creation, registration and lifecycle changes. S-10 delivers those operations before guided init and skill lifecycle integration. Versioned schema migrations use preflight, preview and recovery with explicit compatibility paths, preserving IDs, decisions and actual work history. Changing a data format does not adopt a new policy or rename an existing repository's accepted homes. Current source records are draft examples, not working commands.

## Proactive ownership and CLI contracts

GW-34/35 and the [ownership philosophy](../../../../philosophies/capability-ownership.philosophy.md) require inspecting actual product surfaces and their feature/service responsibilities before selecting document owners. The local source now has sibling [CLI](../../cli/index.md) and [skill](../index.md) capabilities. This guided-workflows feature coordinates one cross-capability packet; each CLI feature owns its scoped design/decisions while shared service contracts remain singular.

The [CLI architecture](../../cli/cli.design.md) records functional-module .service.ts naming, adapter effects and every current service owner. The [service test plan](../../cli/service-verification.test-plan.md) inventories existing evidence and explicit gaps. Portable prose/source skill routing are updated; D-15 covers structured discovery/diagnosis, S-11 covers actual focused service tests. Do not equate a complete tree, a test file or 67 baseline tests with faithful ownership or service behavior.

## Configurable test placement

GW-36 records the local colocation correction and portable placement choice. Current [testing service design](../../cli/services/testing/testing.design.md) and the [placement guide](../../../../dev/test-placement.guide.md) own implemented evidence/validation/persistence. The agent inspects accepted conventions and actual runner/source evidence, then aligns repository/profile/language or explicit layouts without silently moving adopter files. Source Stavel colocation does not become a global forced default.

D-16 retains the future recommendation-catalog, interactive recap, scoped-generation and diagnostic details. The committed configuration resolver must preserve existing testing policy/provenance through upgrades. The broader packet is still provisional; the bounded local/configuration correction does not claim new modes or guided doctor/init orchestration.

## Diagnostics and repair

Findings need stable check/version and source location, evidence, severity, applicability, owner, status and next action. Separate failed, skipped, unavailable, review-required and passed states. Missing/invalid/unreadable inputs must remain distinguishable. Repair candidates identify exact changed bytes or structured operations, source hashes, rationale, authorization scope and verification.

Use existing preflight and journals for suitable file mutations. A semantic source refactor is an agent-led implementation task, not a guessed deterministic repair. An omission record must explain where required concerns are addressed; it cannot silently delete an accepted requirement. Review selected commands and their side effects before invocation. Packaging a checker is distinct from executing arbitrary repository code.

## Packet coverage and proportional selection

The artifact catalog should cover product, requirements, technical design, backend, UI/interface, decisions, test plans, architecture/ERD, accessibility, authorization/access matrix, observability, documentation/help/public-docs planning and relevant execution artifacts. Generalize from MenuLogiq; remove application-only routes, tenancy assumptions, framework names and mandatory providers. New kinds must be registered consistently rather than merely added as filenames.

Select artifacts based on scope and explicit profile/task amendments. Existing owners can satisfy roles. An omission is represented with rationale; low-impact work can use one slice. Keep macro coordination for multi-slice initiatives and avoid default copied macro/per-slice executor prompts. Propose separate artifacts only when they add a distinct source of truth.

For this initiative the design covers CLI interaction and backend/local-storage boundaries in one document. No separate browser frontend, tenant IAM or cloud deployment artifact is needed. The test plan covers the human terminal and agent workflows.

## Story policy and repository template

The [story workflow guide](../../../../dev/story-workflow.guide.md) owns current ask/always/never configuration and editable init-seeded template behavior. PLAN asks by default unless already answered or explicitly suppressed, while input stories remain valid for EXPLORE/DESIGN. The catalog marks the default story template repository-owned; it follows mapped paths/naming, retains repo edits and supports existing custom templates. Init does not generate feature stories or external issues.

Default document-kind validation now uses the declared profile registry, including story, rather than its divergent hardcoded copy. Current component/process evidence does not prove future agent asking/rendering or enterprise tracker integration.

## Compatibility, upgrades and operation

Maintain current Stavel-only product/state identity, separate version axes and existing legacy refusals. Additive command/API behavior should preserve current answers-driven usage; changes to manifest/profile/session/plan shape need explicit versions, validation and a migration/refusal story. Do not introduce an unreviewed schema bump while implementing an interaction adapter.

Amendment upgrades compare pinned source/targets and accepted local intent. Unknown/removed targets and overlapping replacements produce scoped conflicts and a proposed resolution. No blind deep merge or whole-template overwrite establishes compatibility. D-03 selects exact composition rules and target identifiers.

CLI help, README, portable mode guides, configuration/CLI contracts, asset membership and origins must move with their owning changes. This filled initiative packet is local and excluded from portable exports. No package publication, host skill installation or consumer mutation is part of this drafting task.

## Repository configuration before convention-dependent work

GW-27 and the [configuration design](../../../contracts/configuration/repository-configuration.design.md) add a proposed committed .stavel-config entrypoint and topic files such as taxonomy.config.json. Read actual root instructions and resolve scope first, then validate/resolve repository defaults, overrides and decision references before assuming documentation paths or asking convention-dependent questions. All relevant repository workflows use the same effective result; source-package export remains a separate canonical-distribution boundary.

The repository records its selected baseline and accepted settings; future sessions reuse them. Existing MenuLogiq platform/modules/edge homes can remain mapped without a product-tree rewrite. Invalid config must not silently fall back to defaults. Keep task exceptions scoped, durable decisions referenced, runtime sessions/journals separate, and compatibility with current root stavel.config.json explicit. D-03/D-11 settle the format and deterministic composition rather than creating two competing config sources.

## Bootstrap product overview

GW-26 requires a meaningful product-level overview at the selected product root, distinct from the navigation index. The local example is [Stavel's product overview](../../../product.overview.md). S-03 defines a generic portable template/role and S-04 obtains required missing product facts through the shared Q&A engine; S-05 renders and verifies it through the same aligned plan/apply path as other bootstrap artifacts. Source naming and template/default version decisions remain independent.

Populate identity, audience/problem/outcomes, current scope/capabilities, non-goals, maintainer and real contract/owner links from aligned information. Do not copy Stavel prose, invent missing facts or generate an accepted label. Map/reuse an existing canonical overview during adoption and preserve its bytes on repeated setup. Use the configured product root and selected document naming; include the overview in root navigation and owner routing. Source-local filled overviews stay out of portable catalog membership.

## Verification and residual decisions

Use the [test plan](./guided-workflows.test-plan.md), ordered execution plan (archived; see historical context), execution packet (archived; see historical context) and tracker (archived; see historical context). D-01 through D-16 retain unresolved implementation details alongside the recorded owner-selected behavior; S-01 can independently address the demonstrated defects after implementation authorization under the selected review policy or an explicit small-fix exception. A prototype may clarify uncertain terminal/session behavior without silently accepting an architecture.


## Execution planning handoff

The owner requested PLAN on 2026-11-26. The coordination plan (archived; see historical context) now links eight owner-local packets plus integration, with 22 delivery slices. The readiness register (archived; see historical context) retains scoped unresolved design contracts and review gates. These supersede the old broad S-ID assignments; planning did not accept those interfaces or generate stories.

## Accepted execution resolution

The owner accepted the eight consolidated execution choices, including a scoped chat-reviewed design baseline, and required warnings for AI-assisted nondeterministic migrations/repairs. The acceptance record (archived; see historical context) resolves the earlier proposed representation and review questions. Conventional commits are the overridable default. Earlier planning/recon statements retain historical context; current implementation evidence is recorded in the execution owners, not inferred from this acceptance.

## Historical context (archived)

- [execution/guided-workflows](../../../../_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/index.md)
- [execution plan](../../../../_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.execution-plan.md)
- [execution packet](../../../../_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/index.md)
- [tracker](../../../../_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.macro-execution.md)
- [coordination plan](../../../../_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.execution-plan.md)
- [readiness register](../../../../_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/design-readiness.guide.md)
- [acceptance record](../../../../_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/execution-acceptance.decision.md)
