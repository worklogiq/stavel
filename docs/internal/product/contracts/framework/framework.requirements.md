# Framework package requirements

<!-- mdcomposer:meta
title: "Framework package requirements"
kind: "requirements"
state: "accepted"
audience: "internal"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Status: accepted for the initial framework implementation under the repository owner's task.

| ID | Required behavior | Acceptance |
| --- | --- | --- |
| CF-01 | Stack-agnostic, reusable principles with a discoverable hierarchy | No mandatory app/provider/package-manager choices; index routes to real owners |
| CF-02 | Routes for new projects, existing systems, and experimental algorithms | Worked examples and corresponding guides |
| CF-03 | Faithful implementation in STRICT MODE | Required mechanisms protected; material ambiguity distinguished from routine choices |
| CF-04 | Durable extension and handoff | Amendment, acceptance, supersession, and evidence process documented |
| CF-05 | Safe optional adoption tooling | Dry-run; no application execution/network; no differing-file overwrite; existing root instructions preserved |
| CF-06 | Honest structural validation | Broken local links, unsafe targets, missing structure, and pending entrypoint integration detected; semantic limits stated |
| CF-07 | Self-contained optional skill | Export includes entrypoint, scaffolder, framework assets, provenance, and no external checkout dependency |
| CF-08 | Adoption respects source/distribution boundaries | Application artifacts remain unchanged unless rebuilding them is explicitly in scope; source-tree adoption remains distinct |
| CF-09 | Preserve task authorization and branch boundaries | Tools may inspect Git and apply explicitly aligned, owned local hook/configuration effects with preserving recovery; they do not automatically initialize Git, commit, push, merge or change global/system configuration. Contributions use the project's authorized branch and review process. See the [execution amendment](../../capabilities/skill/guided-workflows/ideas-execution.decision.md). |

Non-goals: enforce model behavior, validate scientific claims, modify application runtime, choose an application architecture, or install an agent skill automatically.


## Stavel 0.1 requirements

| ID | Required behavior | Acceptance |
| --- | --- | --- |
| CF-10 | MenuLogiq-derived taxonomy and typed filenames | Repository, templates and assets follow selected naming/metadata/lifecycle; host exceptions explicit |
| CF-11 | Separate documentation/source naming | Questions and scoped config cover case choices, typed names and any identifier case with kebab kinds |
| CF-12 | Complete agent-led alignment before generation | Native Q&A/grouped fallback gathers answers and real alignment; preparation writes no target files |
| CF-13 | Historical context with provenance | Accepted decisions, observations, rejected approaches and unknowns remain distinguishable and bounded |
| CF-14 | Bootstrap, adopt and versioned migration | Distinct route behavior; stale plans, partial failures and recovery conflicts checked |
| CF-15 | Reusable tools with preserved behavior | Generic Markdown package and selected policy/JS rules have fixtures and configurable assumptions |
| CF-16 | Portable export excludes local contracts | Relocated artifact works without source checkout and excludes own profile/requirements/history |
| CF-17 | Contribution-ready decision/profile catalog | All22 source families mapped; Java/Python/frontend/backend examples honestly labeled |
| CF-18 | Node runtime and commands | Help/tests/build/bundled tools agree; historical Python evidence preserved as history |

Accepted scope is distinct from implementation completion. Record actual evidence in the active execution owner.

## Clean restart contract

The owner's 2026-11-26 restart retains the behaviors above while selecting Stavel 0.1.0, a fresh public repository on main, and Stavel-only package, CLI, skill and state-file names. No compatibility command aliases or automatic predecessor imports are required. Generic documentation migration, refusal protections and recovery remain required. A predecessor installation or plan must be rejected actionably rather than silently coinstalled or accepted as Stavel.

Npm publication and release automation remain deferred. The old repository may be deleted only after a restored backup, new source/CI verification, consumer cutover and installed-skill verification. WARP's experimental adoption is excluded.
