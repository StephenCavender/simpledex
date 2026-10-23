# SimpleDex

A Pokémon reference app: React web app, Eleventy marketing site, and Convex backend in a Bun + Turborepo monorepo.

- Package manager: **Bun** (`bun install`, `bun run <script>`). `bun test` is not the test command; use `bun run test`.
- Verify work with `bun run check-types`, `bun run test`, and `bun run check` (oxlint + oxfmt + knip).
- Never push without explicit instruction. Use Conventional Commits.

Read when relevant:

- Coding conventions (React, TypeScript, Convex): [docs/agents/coding-standards.md](docs/agents/coding-standards.md)
- UI/visual design: [docs/design.md](docs/design.md)
- Product and architecture rationale: [docs/philosophy.md](docs/philosophy.md)
- Domain terms: [GLOSSARY.md](GLOSSARY.md); decisions: [docs/adr/](docs/adr/) (see [docs/agents/domain.md](docs/agents/domain.md))
- Issues (GitHub via `gh`): [docs/agents/issue-tracker.md](docs/agents/issue-tracker.md)
