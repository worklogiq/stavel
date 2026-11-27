# Repository-owned Stavel configuration

<!-- mdcomposer:meta
title: "Repository-owned Stavel configuration"
kind: design
state: accepted
audience: internal
owner: repository-maintainer
updated: 2026-11-26
acceptance: "user:2026-11-26:eight-execution-contract-answers"
-->

## Intent and current boundary

The owner requested a repository-committed configuration home that stores selected defaults, taxonomy overrides and decision information, and that Stavel references from the beginning of every relevant workflow. The proposed directory is .stavel-config with topic files such as taxonomy.config.json. This document defines a draft integration contract, not an implemented file format or a namespace already read by the CLI.

Current [configuration](../../../dev/configuration.contract.md) supports selected conventions and ownership mappings. However, [checking](../../../../../src/checking.service.ts) reads a root stavel.config.json while [planning](../../../../../src/planning.service.ts) starts from distribution defaults and supplied answers. The skill routes through root instructions and the local profile. A shared early resolver is needed so those entrypoints consistently use the repository's actual accepted conventions.

The [guided-workflow packet](../../capabilities/skill/guided-workflows/index.md#guided-workflows-draft-packet) owns implementation requirements and slices. D-03 owns composition; D-11 owns startup/layout/migration. The [hierarchy design](../../../process/documentation-hierarchy.design.md) owns semantic taxonomy. This contract does not copy that model or replace existing project owner documents.

## Proposed committed layout

~~~text
.stavel-config/
  stavel.config.json       # selected baseline/version and topic references
  taxonomy.config.json    # actual roots, scope hierarchy, document roles/naming/archive mapping
  workflow.config.json    # packet selection, review/closure conventions and standing amendments
  tooling.config.json     # selected checks, existing tool references and explicit execution effects
  decisions.config.json   # stable configuration decisions, resolution sources and owner references
~~~

Exact filenames and schema are proposed. Topic files are created only when meaningful. The directory is version-controlled repository source and participates in normal review. It is not a cache or an automatic transcript log. Partial interactive sessions, diagnostics output, before/after mutation snapshots, journals and other temporary runtime state remain outside this committed policy home.

The main file provides one discovery entrypoint and explicit references; it does not create a second independently edited copy of every topic. A resolved view can be generated for explanation or validation, but its source/provenance remains the selected baseline and declared repository records.

## Defaults, overrides and ownership

Record the selected baseline/profile version and the explicit repository choices. Bootstrap can seed defaults after alignment, then the repository owns its accepted settings. A newer installed Stavel version must not silently change them. Define how the selected baseline remains reproducible/offline: a compatible bundled version, explicit committed snapshot or complete resolved configuration are alternatives for D-11 to settle. Missing/incompatible pinned inputs must be reported instead of silently using another default.

Resolve schema-defined repository overrides over that selected baseline, then apply explicit capability/task-scoped amendments within their scope. Explain each effective choice's source. Avoid an arbitrary deep merge: arrays, stable-ID additions, replacements, removals, multiple roots and conflicting overrides need deterministic documented rules under D-03. Unknown fields, invalid records and ambiguous overlapping replacements produce actionable diagnostics.

Configuration determines paths and selected methodology; it does not outrank current user instructions or grant permissions. A one-task exception stays task-local unless the user makes it a standing rule. Changing policy is distinct from passing runtime controls such as a target/output-format option. Existing authorization can support an amendment; repeated ceremonial confirmation is not required.

Store configuration decisions with stable IDs, values, applicability, resolution status and actual source instruction/accepted-policy references. Detailed rationale or feature design remains in its existing canonical document and is linked, not copied as a parallel authority. Configuration changes and decision records must reconcile, so an obsolete choice cannot silently reappear through a later session.

## Startup sequence and shared consumers

1. Read the actual user task and root/ancestor repository instructions within the selected scope.
2. Resolve the applicable repository boundary and locate its committed configuration entrypoint, before assuming documentation roots, filenames or owner paths. Surface ambiguous nested-workspace scope.
3. Validate the main/topic records and selected baseline, resolve applicable overrides/amendments and report conflicts with source locations. Corrupt or unreadable configuration must not fall back to a success-shaped default setup.
4. Use resolved routing to read the actual local profile, product overview, capabilities/contracts and relevant accepted owners. Ask only applicable unresolved decisions, citing existing accepted choices.
5. Share the same effective result with inspection/questions, planning/init, check/doctor, generation, help and execution/closure. Apply writes only within the aligned plan and existing authorization.

A fresh unconfigured target still uses read-only discovery and question-led alignment before configuration/adoption generation. An existing repository's files are evidence to propose mappings, not acceptance by themselves. The resolved profile supplies defaults for later sessions so the agent does not rediscover or fight settled conventions every time.

Source-package export is a separate boundary: it uses the explicit portable catalog and must not leak the publishing repository's local configuration or filled product prose into another project. The tool's own repository can use .stavel-config once the resolver exists, with its own clear local settings.

## Work status is separate from policy

The workflow topic points to the repository's work registry; it does not copy work status into configuration. The [work-status design](./work-status.design.md) assigns the registry only references and capability-owned records the actual lifecycle state. Query summaries are transient output. Committed configuration owns accepted policy/defaults; committed work records own actual declared work. Version each format explicitly and use supported CLI operations/migrations while preserving both sources.
## Example: respecting MenuLogiq

MenuLogiq has actual homes under platform/capabilities, platform/concepts, modules and edge, with its own lifecycle/governance. A mapped repository taxonomy can reference those existing owners and public/internal boundaries. Stavel must not create a competing product tree, duplicate its canonical requirements, rename its accepted paths or enable framework-specific source rules simply because Stavel's new-project defaults differ.

Support multiple scope/owner homes; do not force all of MenuLogiq's areas through one literal capabilitiesRoot. The same semantic contract works for a single skill, library, website, backend or a larger platform. Generate or migrate only the aligned scope, preserving existing acceptance and history.

## Compatibility and upgrades

Define one transition from current root stavel.config.json to the proposed directory. If both are present with conflicting authority, report a conflict and offer an explicit reviewed migration; do not silently let one shadow the other or keep two active copies. Distinguish the existing .stavel.json installation manifest and recovery journals from accepted policy/configuration. Retain current Stavel identity and legacy-installation refusals.

Support a reviewable effective-configuration diff for baseline upgrades, changed scope paths, removed template targets and new required choices. Preserve local decisions and amendments; changed conventions do not automatically authorize a repository migration. Define validation/version checks for explicit imported profiles and local references without implicitly fetching or executing external code.

## Test conventions as repository configuration

The current [placement guide](../../../dev/test-placement.guide.md) owns implemented testing policy validation/persistence through aligned answers and inspection evidence. The future committed tooling topic should reference that accepted testing policy, including scoped placement/patterns and decision sources, rather than resetting it to the upstream repository-following default. Keep language/toolchain recommendations as sourced proposals until aligned. Preserve existing test layout on setup unless a separate migration is authorized; bare interactive prompts, automatic recommendation catalogs and placement diagnostics remain planned.

## Acceptance and remaining decisions

GW-27/T-21 exercise early discovery and parity across every relevant consumer, mapped MenuLogiq-like homes, nested scope ambiguity, task-versus-standing changes, invalid configuration, baseline upgrades, offline availability and root-file/directory conflicts. Verify no target writes on discovery/decline and no source-local configuration in generic exports.

D-11 must settle the exact manifest/topic schema, how baseline choices remain reproducible, session-versus-source boundaries, nested-project discovery/inheritance, migration behavior and explanation output. The desired committed home and early common resolution are requirements; unsupported live configuration files have not been generated in this planning slice.

## Accepted execution resolution

The owner accepted the eight consolidated execution choices, including a scoped chat-reviewed design baseline, and required warnings for AI-assisted nondeterministic migrations/repairs. The acceptance record (archived; see historical context) resolves the earlier proposed representation and review questions. Conventional commits are the overridable default. Earlier planning/recon statements retain historical context; current implementation evidence is recorded in the execution owners, not inferred from this acceptance.

## Historical context (archived)

- [acceptance record](../../../_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/execution-acceptance.decision.md)
