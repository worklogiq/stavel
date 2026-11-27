# Choose and preserve test placement

<!-- mdcomposer:meta
title: "Choose and preserve test placement"
kind: guide
state: accepted
audience: public
owner: repository-maintainer
updated: 2026-11-26
acceptance: "user:2026-11-26:configurable-test-placement"
-->

## Inspect, propose and align

Test location is a project decision separate from documentation naming and source identifier case. Read actual instructions, accepted settings, test-runner configuration, existing test/source pairs and relevant language/toolchain evidence. Reuse settled choices; ask only unresolved or materially conflicting questions through the host Q&A or grouped conversation before generating adopting-target files.

The default profile records testing.placement=follow-repository with fallback=language-convention. Prefer accepted repository conventions. Existing consistent patterns support a proposal; mixed or uncertain evidence is not acceptance. When a target lacks a settled convention, propose an applicable language/toolchain convention with its source, or explain the selected profile default. If neither is clear, ask. Never manufacture a community consensus or infer alignment from the default option.

Community guidance is specific to the actual toolchain. Go's official tutorial places a _test.go file beside its package code ([Go testing tutorial](https://go.dev/doc/tutorial/add-a-test)). Maven documents src/test/java for test sources ([Maven layout](https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout)). These are evidence-backed examples for recommendations, not a rule that every Java project uses Maven or every language has one placement consensus. Verify current primary guidance before adding language recommendations; these examples do not install language tooling or enable new checkers.

## Current supported configuration

The optional verification.testPlacement question supports follow-repository, profile-default, language-convention, colocated, separate and custom. Selecting presented defaults uses profile-default, preserving that profile's configured policy. Existing aligned answer records remain valid when this optional decision is absent. Custom selection additionally requires verification.testLayout with roots and patterns.

The current answers-driven init/planning path validates and persists testing in stavel.config.json. Inspection reports heuristic test-layout evidence with colocated, separate and unclassified file lists. Heuristics do not establish coverage, policy acceptance or language consensus. The agent uses them in the normal alignment workflow; bare interactive init and an automatic language recommendation catalog remain separate planned work.

```json
{
  "testing": {
    "placement": "follow-repository",
    "fallback": "language-convention",
    "scopes": {
      "apps/web": { "placement": "colocated", "patterns": ["**/*.test.ts"] },
      "services/importer": { "placement": "separate", "roots": ["checks"] }
    }
  }
}
```

This example shows the testing section of configuration. Supply it under configuration.testing in an aligned answers document when overriding the profile. Root placement accepts follow-repository, language-convention, colocated, separate or custom; profile-default is a question selection that preserves the configured policy, not a persisted layout. Fallback is ask or language-convention; if language guidance is unclear the agent still asks.

Optional roots and filename patterns are nonempty arrays of contained relative paths/globs. Separate placement defaults to the presented tests directory when no root is supplied. Custom placement requires both roots and patterns. Optional scopes map repository-relative source roots to layouts; their roots/patterns are relative to that source scope. The effective-layout helper selects the most specific containing source scope for generation/review. The current CLI validates/persists this map; it does not generate test code or mechanically enforce placement.

## Changes and limitations

A placement choice records intent. It does not rename/move existing source or tests, rewrite runner configuration, infer missing acceptance or execute a detected script. An authorized migration must preserve test names/behavior, update imports/discovery/build exclusions and verify the old coverage still runs. Repeated adoption must preserve local policy or refuse a differing-file plan for review.

Keep accepted policy/provenance committed while recommendations and inspection remain evidence. As repository configuration evolves, preserve these settings through explicit supported migrations rather than resetting them to an upstream preference. Colocation in Stavel's own implementation is a local decision, not a portable forced default.

The recommendation helper prioritizes explicit configuration, then consistent repository evidence and declared source-backed language/toolchain guidance. Mixed, unknown, conflicting or unsupported guidance produces an alignment question; no community consensus or installed language pack is inferred. Doctor reports that evidence distinctly from configured policy.
