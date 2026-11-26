# Default framework conventions

<!-- mdcomposer:meta
title: "Default framework conventions"
kind: "decision"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

## Accepted direction and provenance

The repository owner requested these conventions for the predecessor on 2026-11-25 and retained them for Stavel 0.1.0 on 2026-11-26: use MenuLogiq's language-agnostic documentation conventions as defaults, separate documentation from source naming, ask applicable questions through the host Q&A capability or grouped conversation, gather answers and alignment before generation, package useful Markdown and optional JavaScript/TypeScript tools, and support greenfield bootstrap, existing-project adoption and convention migration.

This acceptance establishes framework policy and implementation scope. It does not assert that implementation or verification has completed, accept downstream project policy, authorize extra external actions, or prove agent compliance.

## Decisions

Use the [documentation taxonomy](documentation-taxonomy.policy.md) and [naming conventions](naming-conventions.policy.md). Keep draft, accepted, active, complete and deprecated document states, archive by location, and separate execution status. Default documentation names are identifier.file-type.md with kebab identifiers and kebab document types. Source naming is independently selected and scoped.

Separate generic Markdown mechanics into mdcomposer; keep project-specific conventions in configuration and optional rules. Build a self-contained skill from explicit portable assets. A generated project profile is a local adoption result, never this package's filled profile.

Maintain a language-neutral decision catalog and illustrative Java, Python, frontend and backend profiles. Examples do not claim implemented language rule packs. New contributions declare applicability, dependencies, evidence, owner, version, migration effects and enforcement limits.

## Supersession and preservation

These explicit conventions replace the 0.1.0 informal filename and document-state defaults. Preserve accepted requirement fidelity, user authorization, proportionality, structural-check limitations, failure paths and meaningful historical evidence. Existing projects retain their accepted conventions through mappings unless they align a migration.
