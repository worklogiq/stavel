# Documentation taxonomy

<!-- mdcomposer:meta
title: "Documentation taxonomy"
kind: "policy"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-26"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

## Default document homes

The default profile uses docs/internal for engineering documents and docs/public for curated user documentation. Architecture contains the overview and roadmap; philosophies contain engineering policy; process contains constitution, lifecycle and prompts; dev contains contributor guides and runbooks; decisions contains local decisions. Templates are split into design and execution. The default product home is docs/internal/product, with capabilities and contracts branches containing meaningful owners/features and shared contract topics. A product-root overview explains purpose, audience, scope and outcomes; index.md owns navigation. Platform/modules/edge and deeper groupings are optional mapped repository vocabulary, not mandatory scaffold. Create only actual owners.

Each concept has one canonical product, requirements, design and contract owner. Execution plans, slices and recon live beside their owner while active. A closed execution packet moves as a unit into the configured archive mirror, normally docs/internal/_archive/<owner-relative path>/execution/<packet-id>. Preserve existing historical buckets and mapped archive conventions when adopted. Current docs route to current authority; history links appear under an explicit Historical context (archived) heading.

## Naming and roles

Use [typed filenames](naming-conventions.policy.md) by default: identifier.file-type.md. The identifier defaults to kebab-case; the document type is always kebab-case. Common roles are product, requirements, design, contract, philosophy, policy, guide, runbook, overview, decision, prompt, template, test-plan, recon, execution-plan, execution-slice, experiment, verification and profiles. The versioned default profile is the machine-readable kind registry.

Design templates describe intended behavior and verification boundaries. Execution templates describe delivery work. Each template states its output filename and contains draft placeholders; generating a template never accepts it.

## Metadata and lifecycle

Canonical Markdown documents use a mdcomposer:meta HTML comment containing title, kind, state, audience, owner and updated. Accepted documents also identify an acceptance record. Required host files retain their prescribed format. Generated blocks may be updated by tools; hand-authored policy and document content remain canonical source.

States are draft, accepted, active, complete and deprecated. An accepted design may be unimplemented. Execution status uses a separate field such as planned, in-progress, blocked, partial or complete; it does not replace document state. Supersession is a relationship recorded with the replacement and rationale. Archived records retain complete or deprecated state and their historical evidence; archive location does not manufacture completion.

Audience is public or internal; missing audience defaults to internal. Public documents may link only to public documents and appropriate host-required public entrypoints. This OSS framework's reusable engineering documents are curated public assets even when authored under docs/internal. An adopter's local profile and private operational details default to internal.

## Adoption and enforcement

Existing repositories can map accepted conventions instead of replacing them. Gather applicable [decisions and alignment](../dev/agent-questions.guide.md) before generating files. Framework adoption never reclassifies an old approval or current observation as accepted policy. Required documents, valid links and headings, naming, metadata, audiences and archive relationships are mechanical checks; correctness and acceptance still require evidence and review.
