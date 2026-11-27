# Stavel

A reusable development framework from MenuLogiq: preserve accepted intent, work in reviewable slices, and require evidence before calling work complete.

## What is this?

Stavel provides portable philosophies, a MenuLogiq-derived default documentation taxonomy, configurable Markdown and optional JavaScript/TypeScript checks, a Node CLI, and a self-contained agent skill. The [framework index](./docs/internal/index.md) routes daily work; the [documentation taxonomy](./docs/internal/process/documentation-taxonomy.policy.md) defines the defaults. Written instructions and structural checks do not guarantee agent compliance or application correctness.

Bootstrap starts a new project. Adoption retains an existing project's accepted conventions. Migration converts conventions through a concrete aligned plan. The agent discovers context and asks questions; deterministic tools handle inspection, planning, preservation and validation.

## How to run locally

Use a supported Node LTS release. From this checkout:

Before the first npm release, the lockfile uses a [versioned mdcomposer package snapshot](./docs/internal/product/contracts/distribution/dependency-snapshots.contract.md) included in this repository. No sibling checkout or npm authentication is needed.

~~~sh
npm ci
npm run build
npm test
npm run check
node dist/stavel.cli.cjs --help
~~~

The framework's Markdown needs no runtime. The executable skill uses Node; installing documentation does not launch the application, provision services, install target dependencies, or change application-internal workers.

Inspect before generating files:

~~~sh
node dist/stavel.cli.cjs inspect --target /path/to/project --track existing
node dist/stavel.cli.cjs questions --target /path/to/project --track existing
~~~

The agent uses native Q&A when available or grouped numbered questions otherwise. It gathers all applicable answers and aligns the complete configuration before creating target files. [Bootstrap](./docs/internal/dev/bootstrap.guide.md), [adoption](./docs/internal/dev/framework-adoption.guide.md) and [migration](./docs/internal/dev/repository-migration.guide.md) explain each route.

## Guided setup and daily use

After building, run the CLI from the project you want to adopt (or pass --target):

~~~sh
node /path/to/stavel/dist/stavel.cli.cjs init
node /path/to/stavel/dist/stavel.cli.cjs doctor
node /path/to/stavel/dist/stavel.cli.cjs help --json
node /path/to/stavel/dist/stavel.cli.cjs work list
node /path/to/stavel/dist/stavel.cli.cjs idea "Remember this improvement" --capability example
node /path/to/stavel/dist/stavel.cli.cjs hooks inspect
~~~

Init detects the project scope, reuses valid existing setup, or gathers missing decisions and offers a concrete preview. Doctor reports findings and offers bounded repairs. IDEA preserves a quick thought and registers it for later work. Selected [Git guards](./docs/internal/dev/git-guards.guide.md) install through aligned init and reject protected-branch commits/pushes while preserving existing hook setups. Explicit arguments remain available; --json/--non-interactive return unresolved questions without waiting. Use --preview or --dry-run to preserve target files. See the CLI contract for compatibility and structured inputs.

Repository-owned .stavel-config pins defaults and scoped overrides across upgrades. Conventional commits are the overridable default. AI-authored nondeterministic migrations/repairs carry a warning; fixed plan application is a separate mechanism. Java/Python-specific integration packs and npm publication remain future work.

## Agent skill

~~~sh
node dist/stavel.cli.cjs export-skill --output /path/to/skills/stavel --dry-run
node dist/stavel.cli.cjs export-skill --output /path/to/skills/stavel
~~~

The export includes the canonical portable assets and runnable tools, preserving source version and license. This package's filled profile, requirements, design and historical records are excluded. Place the exported folder in the host's supported skill location. See [installation](./docs/public/skill-installation.guide.md).

## Canonical documentation

- [Development framework](./docs/internal/index.md), [constitution](./docs/internal/process/development-constitution.policy.md), and [local profile](./docs/internal/dev/project-profile.overview.md).
- [CLI contract](./docs/public/framework-cli.contract.md), [configuration](./docs/internal/dev/configuration.contract.md), and [questions](./docs/internal/dev/agent-questions.guide.md).
- [Package requirements](./docs/internal/product/contracts/framework/framework.requirements.md) and [design](./docs/internal/product/contracts/framework/framework.design.md).
- [Origins](./docs/internal/dev/framework-origins.overview.md), [philosophy extraction](./docs/internal/dev/philosophy-extraction.overview.md), and [contribution profiles](./docs/internal/dev/contribution-profiles.guide.md).
- [Illustrative examples](./examples/README.md); they are not claims about application results.

Version [0.1.0](./VERSION) uses default profile version 1. Licensed under [MIT](./LICENSE). Publishing a repository/package, merging and deploying are separate actions governed by actual user authorization.

## Historical context (archived)

The [initial verification record](./docs/internal/_archive/delivery/initial-verification.overview.md) preserves the predecessor's Python tooling evidence and its limits. Current implementation evidence belongs in the active package execution record.
