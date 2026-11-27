# IDEA capture CLI design

<!-- mdcomposer:meta
title: "IDEA capture CLI design"
kind: design
state: draft
audience: internal
owner: repository-maintainer
updated: 2026-11-27
-->

Proposed, not shipped: stavel idea "short idea", with optional --target, --capability, --title, --request-id, --preview, --dry-run and --json. An optional --input JSON file supports longer original text/source records; reject contradictory text/input rather than guessing. Bare invocation asks only for missing capture text or unresolved scope/owner in a terminal; automation returns input-required without waiting.

The [IDEA workflow design](../../skill/guided-workflows/idea-capture.design.md) owns the record, transaction, lifecycle and retry contract. This CLI feature owns argument/output/exit mapping and delegates capture to the same reusable operation used by the skill. It does not maintain its own backlog or assemble records separately.

Successful capture exits 0 with ID, record path and owning capability. Preview identifies the exact planned changes without writing; missing input exits 2 and refusal/failure exits 1. Help must label the interface available only once implementation and its assets are present. Existing work commands remain compatible.

Acceptance: actual subprocess tests cover simple capture, structured input, inferred/explicit target, ambiguous owner, repeated request ID, unsafe paths, dry-run preservation and truthful partial-failure output. New service behavior has colocated tests; this document does not certify runtime behavior.
