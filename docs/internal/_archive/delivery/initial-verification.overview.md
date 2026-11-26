# Initial verification record

<!-- mdcomposer:meta
title: "Initial verification record"
kind: "overview"
state: "complete"
audience: "internal"
owner: "repository-maintainer"
updated: "2026-11-25"
-->

Date: 2026-11-24. Local environment: Windows, Python 3.13. Application runtime was not exercised.

## Automated evidence

`python -m unittest discover -s tests -v` passed 21 tests. Coverage includes all three adoption routes, dry-run with no target creation, preserving existing instructions, actual routing requirements (excluding code/comment examples), idempotent installation, whole-plan conflict refusal, file/directory collisions, path traversal, symlink destination refusal, license retention, custom homes, local profile edits, malformed manifests, local links and fragments, canonical path containment, and an exported skill working after relocation.

`python tools/framework.py check --target .` passed with zero structural errors. The downstream WARP documentation also passed the same structural checker. The skill-creator frontmatter validator passed for the source skill and initial standalone export; final export validation is recorded with the distribution check before publication.

These checks do not establish semantic conformance, mathematical claims, application performance, or that an agent always follows the framework. Cross-platform CI is configured separately; local success is not a claim that those hosted jobs have already passed.

The first hosted matrix run passed both Linux jobs and exposed an unnormalized-path comparison in the Windows relocation check. A syntactic-path-alias regression reproduced the same false escape locally before the fix. Link checks now canonicalize both root and document paths before comparing containment; outside-repository links remain errors.

## Independent skill forward check

A separate agent used only the exported skill and its packaged assets against a fresh fictional existing Python project. The fixture contained pre-existing AGENTS instructions, an accepted two-stage transform, and conflicting source. No application code or external services were run.

Adoption preserved the original design/source hashes and existing instructions, generated a companion, and correctly failed structural routing until explicit index/constitution links were added. The final check passed while retaining a draft profile. The proposed next task distinguished required-stage fidelity, intermediate reference values, and unrun behavioral checks.

The trial exposed command-path differences between source and skill packages, ambiguous installation-state bookkeeping, noisy notes for expected profile customization, and overlap between existing/research tracks. The source was refined to address those findings. This is one realistic forward check, not a general effectiveness benchmark.

## Contribution boundary

The WARP adoption changes its README and adds development documentation, entrypoint, license, and manifest. Source archive, launcher, knowledge feeds, and original license are outside that change. Final Git comparison verifies that boundary. Main is not an implementation branch, and no merge is authorized by this record.
