# Research example: an experimental codec

<!-- mdcomposer:meta
title: "Research example: an experimental codec"
kind: "example"
state: "draft"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
-->

Document status: illustrative protocol. No compression advantage or mathematical result is claimed.

## Hypothesis

A proposed reversible transform plus a shared dictionary reduces total stored size for a defined corpus. The transform's specific steps are the subject of the experiment. Replacing them with a standard compressor would answer a different question.

## Independent reference

The designer provides fixed inputs, intermediate transformations, and expected reconstruction from a spreadsheet. Resolve ambiguous steps before implementing dependent portions. A reference example supports conformance for that case; it does not prove correctness for every input.

## Accepted experimental slice

| ID | Requirement | Evidence to collect |
| --- | --- | --- |
| C-01 | Follow the proposed transformation | Match independently supplied intermediate values |
| C-02 | Reconstruct inputs in the stated domain | Exact round trips including stated boundaries |
| C-03 | Report total cost honestly | Include encoded output, dictionary, metadata, and required decoder state |
| C-04 | Compare against a named baseline | Same corpus and complete cost accounting |

Run within a stated budget, preserve all results, and distinguish tuning data from held-out comparisons where relevant. The protocol needs a defined corpus and a named baseline before execution; those cannot be invented from a successful candidate run afterward.

## Review

Conformance may pass while size reduction fails. Record both. Recommend accepting, revising, or rejecting the design based on the actual evidence. Do not silently substitute the baseline implementation or weaken the cost model to rescue the claim.
