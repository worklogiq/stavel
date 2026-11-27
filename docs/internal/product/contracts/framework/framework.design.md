# Framework package design

<!-- mdcomposer:meta
title: "Framework package design"
kind: "design"
state: "accepted"
audience: "internal"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Status: accepted for initial implementation. See [requirements](./framework.requirements.md).

## Package and authority

Canonical source documents live under docs/internal and docs/public; the asset catalog identifies the portable set. Root docs explain distribution and tools. Adoption copies the asset set into a local documentation home and creates a draft project profile with explicit routing. This avoids dependencies on upstream paths or a separate checkout.

The optional skill exports the same assets and CLI into its own folder. It must not maintain a divergent handwritten copy. The AGENTS template is resolved only at installation; existing instructions remain in place with a pending-integration companion when necessary.

## CLI boundaries

`init` creates an aligned plan and applies it through hash-checked preflight and a recovery journal. It does not blindly overwrite differing bytes, execute target code, use network, or operate Git. `--dry-run` performs the same planning without creating the target. OS failures can leave partial state; resume or rollback verifies the journal and intervening work before continuing.

`check` validates local document targets and fragments, mandatory package files, manifest shape and containment, and entrypoint routing. It reports local modifications without claiming they are unauthorized. Document acceptance and semantic fidelity remain review responsibilities.

`export-skill` preflights the complete self-contained export with the same no-overwrite protections. It packages framework assets, the CLI, a short skill entrypoint, UI metadata, license, and origins. It does not install or activate the skill.

## Verification

Use focused Node unit/integration tests for real filesystem behavior in temporary directories. Cover preservation, whole-plan conflict refusal, repeated adoption, relative-path containment, symlinks where available, malformed manifests, broken links/fragments, and an exported skill functioning after relocation.


## Stavel 0.1 architecture

The Node CLI/library separates inspection/questions, aligned plans, preflighted application, migration journals/recovery, checks and export. The agent interprets evidence and handles Q&A; no model provider is embedded. Read-only preparation returns structured output before target generation.

Generic mdcomposer is independently maintained, used for builds and bundled when runtime checks/generation need it. Optional policy/language rules consume selected project configuration without imposing this toolkit's implementation language on applications.

The asset catalog maps canonical sources to portable targets and declares index, constitution, profile-template and agent-template routing. Local profiles, package contracts and history stay excluded. Explicit reviewed path mappings and hashes support generic migration; journals distinguish refusal from partial OS failure and guard intervening work during recovery.

The predecessor Python runtime and its import adapters are outside Stavel's interface. Its preservation, refusal, link and routing properties remain useful behavior requirements, with original evidence retained historically. Stavel manifests and plans require product: stavel, while schema numbering stays independent from the new package's 0.1.0 version. Journal recovery validates its embedded plan's identity. The active runtime does not load the historical rename map.
