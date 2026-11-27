# Documentation ownership hierarchy

<!-- mdcomposer:meta
title: "Documentation ownership hierarchy"
kind: design
state: accepted
audience: internal
owner: repository-maintainer
updated: 2026-11-26
acceptance: "user:2026-11-26:eight-execution-contract-answers"
-->

## Intent and authority

The owner asked to define an agnostic hierarchy and then explicitly corrected its default structure to product > capabilities | contracts > subdirectories. Product -> capability -> feature describes behavior ownership; shared contracts form the sibling branch. Optional deeper structures such as platform -> product -> capability -> feature can be used when needed. Stavel is already the product; skill and the implemented CLI are current capabilities, and website/docs is a future example. The owner explicitly corrected the earlier skill-only model after inspecting CLI source responsibilities. This document owns the semantic model. The shared configuration resolver validates explicit owner identities/roles/parents/paths; artifact and init planners consume those mappings and preserve existing canonical documents.

The [taxonomy policy](./documentation-taxonomy.policy.md) describes shipped portable defaults. The [local documentation-home decision](../decisions/product-documentation-home.decision.md) records source migration authority. GW-24/GW-25 and D-10 in the [draft skill packet](../product/capabilities/skill/guided-workflows/index.md#guided-workflows-draft-packet) track runtime/configuration and template adoption of this design.

## Core ownership roles

| Role | Meaning | Owns | Example |
| --- | --- | --- | --- |
| Product | An identifiable solution with audience, outcomes and shared constraints. | Product intent, common requirements/contracts and links to capability owners. | Stavel; MenuLogiq in the owner's larger-platform example. |
| Capability | A cohesive responsibility or product area with an accountable owner and durable contracts. It can contain subordinate capabilities when their responsibility warrants it. | Its requirements/design/contracts and shared decisions, with links to dependent features. | Stavel's skill and CLI; a future website. |
| Feature | A concrete observable behavior within an owning capability. Workflow is a useful feature label when the behavior is a process. | Feature acceptance and scoped design; links to inherited/shared contracts. | Explore, design or delivery workflow; a future documentation experience. |
| Contract topic | A shared obligation or stable interface referenced by product capabilities. Its defining requirements/design can accompany the contract. | One canonical definition and its compatibility/acceptance, linked by consumers. | Framework behavior; package distribution; API or data contracts when applicable. |
| Optional container | A meaningful platform/suite, domain, surface, module or grouping needed by this project. | Navigation, scope and shared constraints where real; it does not require copied contracts. | A platform containing multiple products; a workflows grouping within skill. |

The selected default has two explicit branches under product: capabilities and contracts, each with meaningful topic/owner subdirectories. Capabilities describe owned behavior and its features; contracts describe shared obligations consumed by those owners. Paths can be mapped to accepted repository vocabulary through explicit customization, while this distinction stays clear. Folder depth does not determine node role: an organizing workflows directory can sit between a capability and its features, and optional outer platform/product scopes or nested capabilities can express real boundaries. Avoid empty placeholder levels.

Platform is an optional containing boundary, not a universal required parent or a synonym for every product. A product can also be a platform in its domain; the profile records the actual scope. Do not manufacture a second product directory when the root already identifies that product. In a multi-product repository, explicit named product homes may be necessary.

## Examples, not mandatory folder scaffolds

~~~text
Stavel (product; docs/internal/product)
  capabilities
    skill
      guided-workflows (current feature and cross-capability delivery owner)
        execution/<delivery-id>
    cli
      inspection, planning, initialization, migration (feature homes)
      checking, markdown, skill-export, help (feature homes)
      doctor, work-management (implemented features with owning designs)
      services (shared operational contracts, not separate commands)
        filesystem, naming, distribution, policy-support
    website (future example only; no directory generated)
  contracts
    framework
    configuration
    distribution
~~~

The owner's larger example can be expressed as a platform containing MenuLogiq as a product, then capabilities and features. This is an illustrative shape, not a claim that MenuLogiq's current source directories already implement exactly that tree. Existing MenuLogiq governance uses shared platform owners, module owners and local active delivery; its archive is currently flat by default.

Skill and CLI exist as Stavel capabilities today. Guided workflows has its own skill feature directory and one cross-capability initiative packet; CLI features have their own durable designs and shared services have single contract owners. A feature folder is justified by observable responsibility or real design work, not automatically by a source filename. No website or empty future hierarchy is generated.

During discovery/design, inspect actual product surfaces, command entrypoints and modules, then propose missing capability/feature owners or apply already-settled choices. Ask only when competing boundaries materially affect the task. The [ownership philosophy](../philosophies/capability-ownership.philosophy.md) owns this portable behavior; GW-34/D-15 track structured tooling support. Preserve accepted mappings in other repositories.

## Durable documents and delivery lifecycle

Every product home has a typed product.overview.md (or the selected naming convention's equivalent) at its root, separate from index.md navigation. It explains the product, intended users, problem/outcomes, actual capabilities, scope/non-goals and shared-contract/owner links. Stavel's [current overview](../product/product.overview.md) is the local example. Bootstrap must render a draft overview from actual aligned project answers and map an existing canonical overview during adoption; it must not copy Stavel's filled description into another product, invent missing facts or overwrite local amendments. GW-26 tracks executable generation and preservation, exercised by artifact/initialization suites and the independent setup trial.

The capability that owns behavior keeps its intent, requirements, design, test expectations and decision references. Shared obligations and stable interfaces have one canonical contract-topic owner under contracts; capability/feature docs link them and add scoped detail. Product-wide navigation links both branches. Existing canonical contracts can remain at their accepted mapped public/internal homes without duplicate definitions. Physical co-location does not replace identifying the authoritative role or actual acceptance.

Execution is a lifecycle axis, not another functional level in the product hierarchy. An active owner creates execution/<delivery-id> when needed. That directory contains its plan, separate slice files, macro tracker and actual verification evidence. Stories are work-tracking records linked to requirement/design acceptance; they do not create a second feature hierarchy or competing specifications.

A cross-capability initiative has one explicit accountable owning scope and links affected capability documents. Use the appropriate common owner when the change truly belongs there. Do not scatter independent copies of the full execution packet or create a product-root execution dumping ground by convenience.

After full scoped closure, archive the delivery directory as a unit while retaining current durable docs. Preserve the original owner-relative path under the configured archive root or bucket. Example mapping:

~~~text
docs/internal/product/capabilities/skill/workflows/explore/execution/<delivery-id>/
docs/internal/_archive/product/capabilities/skill/workflows/explore/execution/<delivery-id>/
~~~

The exact archive prefix/bucket is still D-06's contract choice. Preserve delivery identity, real results and failed evidence; rewrite incoming/outgoing links and enforce current-doc historical placement. A partial PR completion does not archive an unfinished initiative. Renaming an active owner later requires explicit historical mapping, not overwriting old identity.

## Questions and validation

Setup/design should establish product scope, the capabilities and shared-contract topic branches, actual owners, feature/workflow homes, meaningful optional parent/group levels and the archive mapping. Reuse accepted answers and ask only where ownership is materially ambiguous. Explain what belongs at each scope and show the resolved tree before generation.

The future representation should identify scopes with stable identity, role, owner, parent/path and canonical document links. Exact schema belongs to D-10/S-00. A scope role is distinct from a document's existing kind metadata; do not repurpose kind: overview to mean capability. Validate parent/path containment, unique ownership, cycles, collisions, unresolved references, orphaned delivery packets and mirror mapping. Agent/human review decides whether the boundary makes sense; a valid tree alone does not prove appropriate architecture.

The hierarchy routes discovery and applicable constraints. It does not grant permissions, supersede current user instructions or silently repeal accepted policy. Any conflicting amendment still needs its real scope and authorization recorded.
