# SimpleDex Development Guide

**Stack**: TypeScript · React 19 · TanStack Router · TailwindCSS v4 · Convex · Bun

## Overview

SimpleDex is a Pokemon reference app with a React web frontend, Eleventy marketing site, and Convex backend. Browse, search, and explore Pokemon details across all generations.

## Philosophy

**Reference-first** — Every UI decision makes Pokemon data more accessible. The UI gets out of the way; artwork and stats are the hero.

**Convex for state** — All server state flows through Convex queries and mutations. No REST endpoints, no manual caching, no polling. Components use `useQuery` directly.

**Functional & typed** — Pure functions, immutability, and TypeScript end-to-end. No `any` casts. React Compiler handles memoization; manual `useMemo`/`useCallback` is unnecessary.

**Dark by default** — The app defaults to dark mode (like a Pokedex in a dim room), with light mode for accessibility.

## Structure

```
<project-root>/
├── apps/
│   ├── web/          # React app (TanStack Router)
│   └── marketing/    # Eleventy static site
├── packages/
│   ├── backend/     # Convex functions
│   ├── ui/          # Shared UI components
│   ├── env/         # Environment config
│   └── config/      # Shared config
└── turbo.json       # Turborepo config
```

## Where to Look

| Task                | Location                                 |
| ------------------- | ---------------------------------------- |
| Add a page/route    | `apps/web/src/routes/` (TanStack Router) |
| Add a component     | `apps/web/src/components/`               |
| Add Convex function | `packages/backend/convex/`               |
| Add Convex schema   | `packages/backend/convex/schema.ts`      |
| Add types           | inline or `packages/backend/`            |
| Add env vars        | `.env.local` (never commit)              |

## Development

```bash
bun run dev          # Start all dev servers (web:3001, marketing:8080, convex)
bun run build        # Production build
bun test             # Run Vitest tests
bun run lint         # Check linting (if configured)
```

## Coding Standards

**React**

- React Compiler enabled - avoid manual `useMemo`/`useCallback`
- Functional components only
- Colocate code that changes together
- Compose smaller components rather than massive JSX blocks
- Prefer TanStack Router file-based routing
- Use v4 Tailwind format with global CSS variables

**TypeScript**

- No `any` casts
- No unnecessary try/catch
- Explicit return types on exported functions

**Functional Programming**

- Prefer pure functions with no side effects
- Use immutability — avoid mutating objects/arrays directly
- Favor composition over inheritance
- Leverage array methods (map, filter, reduce) over loops

**Code Clarity**

- Write code that is easily understood and maintained by human engineers
- Prioritize clarity over cleverness — avoid terse or obscure patterns
- Use descriptive variable and function names
- Keep functions small and focused on a single responsibility
- Prefer explicit logic over implicit behavior

**General**

- Indentation: 2 spaces, no tabs
- Use descriptive names for variables and functions
- Single responsibility per function

## Git Workflow

**Commit Standards** (Conventional Commits)

```
feat(auth): add login with Convex
fix(api): handle null user in profile query
chore(deps): upgrade bun to 1.x
```

Types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`

**Rules**

- Make **atomic commits** - one logical change per commit
- **Never push without explicit instruction** from the user
- Stage and commit related changes together
- Write clear, concise commit messages describing the "why"

**Commands**

```bash
git status                    # Check what's changed
git add <specific-files>       # Stage related changes
git commit -m "feat: add auth"  # Commit with type prefix
git push origin master         # ONLY when instructed
```

## Anti-Patterns

- No `any` type in TypeScript
- Don't commit `.env*.local` files
- Don't use class components in React
- Don't skip Convex schema validation
- Don't push without explicit instruction
- Don't add unnecessary try/catch blocks

## Notes

- Convex handles real-time data — no manual polling needed
- Bun is the package manager (not npm/yarn)
- Marketing site includes `llms.txt` for AI indexing
  - Update at `/apps/marketing/src/llms.txt`
  - Rebuild with `cd apps/marketing && bun run build`
