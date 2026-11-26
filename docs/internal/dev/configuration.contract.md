# Configuration and asset contracts

<!-- mdcomposer:meta
title: "Configuration and asset contracts"
kind: "contract"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

The versioned default profile records documentation roots, naming shape and identifier case, kebab-case document types, metadata, lifecycle states, archive rules, source conventions and selected rule modules. Documentation and source naming are separate. Mixed identifier cases use any plus an explicit generated-identifier case.

The decision catalog contains thirteen applicable question groups and stable question IDs. Each question declares prompt, type, meaningful options/default, required status and applicability. The agent supplies evidence and actual user alignment; the CLI validates complete decisions and plan preconditions.

## Answer and alignment format

Inspection and questions print JSON without writing target files. The agent gathers applicable answers through the host's Q&A tool or grouped questions in conversation, then supplies a complete record. Choosing presented defaults requires an actual user instruction; a boolean alone does not establish human acceptance.

```json
{
  "answers": {
    "project.name": "Transform Demo",
    "project.intent": "Normalize values and apply weights as distinct required stages.",
    "project.owner": "Demo Maintainer",
    "workflow.mode": "adopt",
    "documentation.naming.style": "typed",
    "documentation.naming.identifierCase": "camel",
    "source.languages": ["python"],
    "source.naming.identifierCase": "snake"
  },
  "useDefaults": true,
  "alignment": {
    "confirmed": true,
    "instruction": "Reference to the actual user instruction accepting this configuration."
  },
  "ownership": {
    "requirements": "docs/transform.requirements.md"
  },
  "history": [
    {
      "topic": "Required mechanism",
      "observation": "Normalization and weighting are separate required stages.",
      "sources": ["docs/transform.requirements.md"],
      "status": "accepted policy identified by the user"
    }
  ]
}
```

Use `ownership` for role-to-existing-document links in adoption. Migration-only `mappings` maps existing filenames to destination filenames; it is not an ownership map. `lifecycleMappings` maps legacy lifecycle labels to reviewed states, and `acceptanceRecords` maps affected document paths to actual acceptance evidence. Never fill approval evidence from a label alone. `configuration` supplies explicit scoped configuration overrides when a project needs more detail than the general questions.

Generated local context and newly synthesized document metadata use the resolved project owner. Existing declared owners remain intact. When migration renames an owning document, generated profile links follow its destination while retaining the canonical role.

`source.languages` is a list of language identifiers; `source.naming.identifierCase` affects source policy independently of documentation naming. Existing-language decisions do not rename application source files or install a language toolchain. The questions command identifies additional applicable required answers; the example shows the record shape rather than an exhaustive answer list for every repository.

## Scoped source conventions

Optional `source.scopes` answers record different conventions for repository-relative source roots. The resolved profile stores the same map at `configuration.source.scopes`; the longest matching root overrides the general source defaults. Each scope may declare `language`, `naming` (`shape`, `identifierCase`, `allowedNames`), `roles` and `rules`. Language-required filenames remain explicit exceptions. These decisions configure policy; they do not rename existing source or add an unimplemented language checker.

```json
{
  "answers": {
    "source.scopes": {
      "apps/web": {
        "language": "typescript",
        "naming": { "shape": "typed", "identifierCase": "kebab", "allowedNames": ["App.tsx"] }
      },
      "services/importer": {
        "language": "python",
        "naming": { "identifierCase": "snake", "allowedNames": ["__init__.py"] }
      }
    }
  }
}
```

When supplying explicit configuration rather than question answers, put this root map under `configuration.source.scopes`. Include all scoped choices in the same user alignment record before generating target files.

The portable asset catalog requires product: stavel and explicitly lists source, install target and role for every reusable asset. It records index, constitution, generated-profile and agent-template entrypoints. Own filled profiles, package requirements/design, implementation history, local decisions and credentials are excluded. Catalog identity and membership, not directory copying, establish export scope; a source-root override cannot import a predecessor catalog as Stavel.

Generated installation manifests and plans require product: stavel. Journals validate their embedded Stavel plan. Existing schema numbers are independent from package version 0.1.0. Generic migration uses explicit reviewed mappings and preserves hashes, operations and actual state; there is no built-in predecessor import map or compatibility alias. Acceptance remains tied to the real user instruction or accepted owner record.

Optional Java, Python, frontend and backend examples describe decisions to make. They do not enable unimplemented language checks. The [contribution guide](contribution-profiles.guide.md) defines the extension contract. Generic Markdown mechanics remain separate from project policy, and executable dependencies used after export must be included in the self-contained runtime.
