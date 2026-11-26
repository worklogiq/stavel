# Security and privacy

<!-- mdcomposer:meta
title: "Security and privacy"
kind: "philosophy"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Applies to trust boundaries, sensitive state, external systems, and publication.

- Identify what is trusted, who authorizes an operation, and what data crosses a boundary. Validate at the authoritative entrypoint.
- A checksum detects mismatch; a signature binds bytes to a key; trusted provenance requires a trusted key. Verify untrusted artifacts using a trusted verifier before executing their code.
- Keep credentials and private state out of examples, logs, exports, and public artifacts. Classification rules and token scans are controls with limits, not proof that publication is safe.
- New external integrations need a documented purpose, data exchanged, failure behavior, and authorization consistent with the task. Existing authorization persists; do not manufacture repeated approval requirements.
- Use least privilege and explicit execution boundaries appropriate to the system. Distinguish process separation, directory copies, containers, and OS-enforced isolation.
- Do not expand the user's authorization. Reading, changing files, committing, opening a PR, publishing, merging, and deploying are distinct actions whose authorization comes from the task context.

Verification: inspect changed trust boundaries, negative authorization cases, export contents, and recovery behavior. Threat modeling and deeper security review should match the change's actual risk.
