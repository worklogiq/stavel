# Repeat initialization product direction

<!-- mdcomposer:meta
title: "Repeat initialization product direction"
kind: decision
state: accepted
audience: internal
owner: repository-maintainer
updated: 2026-11-27
acceptance: "user:2026-11-27:repeat-init-explore-qa-answers"
-->

## Context and authority

During the requested EXPLORE pass, the owner answered the two bundled questions about recognizing existing manual/source adoption and handling partial/damaged setup. The [recon](repeat-initialization.recon.md) owns observed behavior, failed scratch trials, source pointers and remaining technical design questions. This record accepts product direction; it does not claim the current CLI implements it or authorize a later execution packet, commit or publication.

## Selected behavior

1. Recognize a validated existing setup as initialized, including a repository with valid selected configuration, instructions and owner documents but no installer manifest. Require no one-time registration merely to recognize that setup. Do not silently copy a second framework distribution into a manually adopted/source repository.
2. When setup is partial or damaged, explain the concrete gaps and offer a preserving completion/repair preview. Reuse known accepted decisions. Actual changes require explicit application of the reviewed scope; detection and preview must not silently mutate the target.

The owner's original problem establishes that healthy existing setup should not restart onboarding. The recommended observable outcome is a brief successful already-initialized response with no questions or writes when nothing is requested or missing. Explicit reconfiguration/upgrade still needs its own accurate delta and alignment; prior acceptance is not permission to overwrite changed inputs.

## Preserved constraints

Configuration presence alone does not establish complete setup or semantic philosophy adherence. Define which selected components validate readiness in DESIGN, using actual policy and mappings rather than repository-name special cases. An installer inventory, manual adoption, completed setup and interrupted session are distinct facts. A user cache is not the sole authority for prior acceptance or completion.

Preserve legitimate malformed/conflicting-input refusals, read-only headless behavior, original install identity, pinned defaults, unknown user files, editable templates, locks, stale-plan protection and journaled recovery. Offering a repair preview for a supported gap does not permit an arbitrary semantic repair or bypassing safety checks. AI-authored nondeterministic repair/migration proposals retain the already accepted warning/source requirements.

## Consequences and next step

DESIGN should specify shared initialization readiness/delta assessment, manual versus installed evidence, completed versus interrupted session handling, original track/alignment reuse, explicit change requests and terminal/API/JSON behavior. Coordinate doctor and init around reusable inspection/repair mechanisms. New formats, schema migrations, flag spelling and technical interfaces remain undecided; do not invent those choices as accepted product requirements.

No additional product decision blocks the bounded next design pass. Production source and installed skills remain unchanged by this exploration.
