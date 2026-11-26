# Filename conventions

<!-- mdcomposer:meta
title: "Filename conventions"
kind: "policy"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

## Independent decisions

Ask about documentation and source naming separately. For documents offer camelCase, snake_case, kebab-case, PascalCase or the default typed shape identifier.file-type.md. With typed names, ask whether identifiers use camel, snake, kebab, pascal or any case. With any case, preserve existing identifiers and choose a generator case explicitly. Document types remain kebab-case.

The default is typed names with kebab identifiers. Examples are product-intent.philosophy.md, repository-migration.guide.md and order-processing.requirements.md. Identifiers can contain letters, numbers and the selected separators; paths, traversal, empty identifiers and ambiguous type boundaries are invalid. A simple naming selection still records document kind in metadata.

Source conventions are scope-aware. A Python module, Java class, frontend component and shell script need not share one case. Preserve language- and host-required filenames and accepted scoped exceptions.

## Required exceptions

AGENTS.md, SKILL.md, README.md and index.md retain their conventional names. LICENSE, VERSION, package.json, package-lock.json, tsconfig.json, Git dotfiles, manifests, configuration formats and agents/openai.yaml retain the exact names required by their consumer. Template source agents.template.md produces the host-required AGENTS.md. This is an explicit exception, not an implicit bypass.

## Changes and verification

Use the [migration workflow](../dev/repository-migration.guide.md) for renames. Check collisions, case-insensitive Windows destinations, local links, images, anchors, navigation, root routing and configured file references before applying. Retain decision history and preserve the user-selected source naming conventions. Do not weaken expectations merely to make a filename check pass.
