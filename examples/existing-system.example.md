# Existing-system example: apparently forgotten information

<!-- mdcomposer:meta
title: "Existing-system example: apparently forgotten information"
kind: "example"
state: "draft"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
-->

Document status: illustrative. The scenario and results below are hypothetical, not claims about a real repository.

## Recon

A user stores a project constraint and later receives an answer that ignores it. Trace four separate checkpoints: durable storage, retrieval candidates, final prompt, and answer use. Suppose recon finds the record on disk and in retrieval candidates, but it is removed while the prompt is packed.

This observation supports a context-assembly defect. It does not establish loss of model weights or failed persistence.

## Accepted slice

F-01: For the selected task, the required constraint reaches the final model input or context assembly explicitly refuses with a reason when it cannot fit. Other context behavior remains as specified by the existing owner docs.

Required boundary: preserve explicit required constraints when packing optional context. Non-goals: replace the retriever, train a model, rewrite storage, or promise the model always follows the constraint.

## Regression and evidence

Create a fixed retrieval result and a context budget that reproduces the omission. Assert the required content survives into the actual model-call payload, or that assembly reports the documented refusal. Verify optional content trimming and the no-fit case. Use a fake model boundary for deterministic packing checks; separately evaluate answer quality if that is in scope.

## Handoff

Record the violating contract, packing location, actual reproducer result before/after, and any unresolved generation failure. Do not revise the requirement to match the old omission. Keep existing docs as owners and link to them from the adoption profile.
