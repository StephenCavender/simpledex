# SimpleDex

A Pokémon reference app: React web app, Eleventy marketing site, and Convex backend in a Bun + Turborepo monorepo.

- Package manager: **Bun** (`bun install`, `bun run <script>`). `bun test` is not the test command; use `bun run test`.
- A Husky pre-commit hook (`.husky/pre-commit`) lints/formats staged files and runs `check-types`, `test`, and `knip`. Run `bun run check` to auto-fix lint/format issues before committing.
- Never commit with `--no-verify`. If the hook fails, fix the cause.
- Never push without explicit instruction. Use Conventional Commits.

Read when relevant:

- Coding conventions (React, TypeScript, Convex): [docs/agents/coding-standards.md](docs/agents/coding-standards.md)
- UI/visual design: [docs/design.md](docs/design.md)
- Product and architecture rationale: [docs/philosophy.md](docs/philosophy.md)
- Domain terms: [GLOSSARY.md](GLOSSARY.md); decisions: [docs/adr/](docs/adr/) (see [docs/agents/domain.md](docs/agents/domain.md))
- Issues (GitHub via `gh`): [docs/agents/issue-tracker.md](docs/agents/issue-tracker.md)
