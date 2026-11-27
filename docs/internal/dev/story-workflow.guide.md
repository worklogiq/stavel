# Stories during discovery and planning

<!-- mdcomposer:meta
title: "Stories during discovery and planning"
kind: guide
state: accepted
audience: public
owner: repository-maintainer
updated: 2026-11-26
acceptance: "user:2026-11-26:ask-for-stories-and-bootstrap-template"
-->

## Inputs and optional outputs

A story supplied by the user or tracker can guide EXPLORE and DESIGN before a technical design exists. Preserve its intent and link the eventual canonical requirements/design. A story is not proof that the design was accepted or implementation completed.

PLAN sets up execution from the selected design and can also produce story records, including enterprise workflows. By default ask whether the current planning scope should generate stories. Reuse an explicit answer already supplied for that scope instead of asking twice. The user can choose on the fly; keep it task-scoped unless made a standing rule. Input stories remain usable regardless of the output-generation policy.

## Repository policy

The default profile records:

```json
{
  "workflow": {
    "stories": {
      "generation": "ask",
      "template": "docs/internal/templates/design/story.template.md"
    }
  }
}
```

Generation is ask, always or never. Explicit always/never configuration suppresses the PLAN question and selects the intended output behavior. Direct scoped user instructions remain controlling. Init's optional workflow.stories.generation question selects that standing policy; it is not the per-feature PLAN question. Profile-default preserves accepted profile settings. Current aligned answers can also provide configuration.workflow.stories or an optional workflow.stories.template answer.

The current CLI validates/persists these settings during answers-driven init. The agent prompt performs the PLAN question and uses the selected template. No CLI command automatically creates feature stories or external tracker issues. Richer interactive PLAN orchestration and configuration inheritance remain separate work.

## Repository-owned template

Init seeds the [default story template](../templates/design/story.template.md) even when generation is never. Its destination follows aligned framework-home and document-naming mappings, and configuration records that actual path. Edit the generated template directly or select an existing repository-relative Markdown template through workflow.stories.template. A custom template should declare kind: template so structural checks can identify intentional placeholders outside the standard template folder.

The portable catalog marks the seeded file repository-template: copy once, then preserve existing repository bytes. It is not an immutable upstream-hash asset. Repeated init preserves edits, while plan input hashes still protect against edits after preview. Other differing framework assets continue to refuse; this is not a general overwrite exemption. Missing/unsafe template references refuse before target generation. Changing an existing immutable config record may still require an explicit migration rather than silently overwriting it.

## Rendering and evidence

PLAN reads the selected repository template and renders proportionate story files using the chosen naming and audience. The default typed role is identifier.story.md. Replace placeholders, change kind from template to story and retain actual draft/acceptance state. Link requirements, design and slice owners rather than copying their specifications or inventing another slice-status authority. Input stories may legitimately leave design/slices pending.

Template overrides can change structure and team language while preserving applicable requirements, philosophies and evidence. Story generation does not create external tracker records without authorization, accept a design, complete a slice or waive the selected substantial-feature review policy.
