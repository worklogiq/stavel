# Framework CLI contract

<!-- mdcomposer:meta
title: "Framework CLI contract"
kind: "contract"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

The executable is stavel. From a built checkout use node dist/stavel.cli.cjs; an exported skill uses node scripts/stavel.cli.cjs. The package identity is @worklogiq/stavel, initially version 0.1.0; registry publication is deferred. The Markdown framework needs no runtime. Use a supported Node LTS for the tools and each command's --help for the current options.

Stavel uses stavel.config.json, .stavel.json and .stavel/journals. Installation manifests and plans identify product: stavel; journal recovery validates its embedded plan. Old branded installations and predecessor plans without Stavel's product identity are refused without writing. There are no predecessor command aliases or automatic legacy migration route.

## Inspection, questions and alignment

inspect --target PATH [--track existing] reads repository evidence. questions --target PATH [--track existing] [--answers FILE] returns applicable unresolved questions. These operations do not create target files. The agent uses host Q&A or grouped conversation, gathers all applicable answers and aligns the complete selection before generation.

Answers contain an answers object and alignment with confirmed true and an actual instruction reference. Explicit useDefaults selects the presented defaults, while mappings, configuration and history record scoped decisions. Do not fabricate alignment or infer it from elapsed time.

## Planning and application

plan --target PATH --name NAME --track greenfield|existing|research --mode bootstrap|adopt|migrate --answers FILE [--framework-path REL] emits a complete JSON plan to stdout. Keep planning/answer files outside the target until application. apply --plan FILE [--target PATH] [--dry-run] preflights containment, source hashes and conflicts; it never blindly overwrites differing content. verify --plan FILE verifies the planned result.

Bootstrap creates a selected default setup. Adoption preserves accepted local conventions and owners. Migration transforms selected conventions through concrete mappings. Existing root instructions are preserved, with typed companion routing pending real root links.

## Migration recovery

migrate plan and migrate apply expose the corresponding migration operations. migrate resume|rollback --target PATH --journal FILE use recorded operations and hashes. Preflight refusal occurs before writes; filesystem failures during application may leave partial state. Resume and rollback verify journal state and refuse to overwrite intervening user changes. Metadata conversion preserves approval/completion evidence and separate execution status.

## Checking and export

check --target PATH [--framework-path REL] checks documents, actual routing, selected naming/metadata/audience/archive policies and applicable configured rules. Report notes, skipped or unavailable checks and known failures separately. Structural success does not accept a document, prove behavior or certify an agent's reasoning.

export-skill --output PATH [--dry-run] creates SKILL.md, host UI metadata, the runnable script, canonical portable assets, version/license/provenance and recorded hashes. Export scope comes from the asset catalog; this package's filled profile, requirements, design and implementation history are excluded. The artifact must work after relocation without this checkout or an implicit npm download.

## Exit and side-effect boundaries

Success is exit 0. Expected refusals/check errors return nonzero with actionable diagnostics. Dry-runs use the same preflight and create no target directories or journals. Generation does not install target packages, execute application code, invoke Git, contact AI services or deploy infrastructure. Package distribution can involve downloads; installed exported tools remain self-contained.
