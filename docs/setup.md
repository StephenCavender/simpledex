# Setup

## Prerequisites
- [Bun](https://bun.sh) (package manager)
- [Convex](https://convex.dev) account (backend)

## Development

Install dependencies:

```bash
bun install
```

Start all dev servers:

```bash
bun run dev
```

This starts:
- Web app at `http://localhost:3001` (Vite + React)
- Marketing site at `http://localhost:8080` (Eleventy)
- Convex backend (auto-deploys on changes)

### Run individual services

```bash
bun run dev:web          # Web app only
bun run dev:marketing    # Marketing site only
```

## Build

```bash
bun run build
```

## Quality checks

```bash
bun run check            # Lint + format (oxlint + oxfmt)
bun run check-types      # TypeScript type checking
bun test                 # Vitest tests
```

## Environment variables

Copy from templates:

```bash
cp apps/web/.env.example apps/web/.env.local           # Web app
cp packages/backend/.env.example packages/backend/.env.local  # Backend
```

Required vars:

| Variable | Description |
|---|---|
| `VITE_CONVEX_URL` | Convex deployment URL |
| `CONVEX_DEPLOYMENT` | Convex deployment name (dev) |
| `CONVEX_DEPLOY_KEY` | Convex deploy key (CI/production) |

## Convex

Generate API types after schema changes:

```bash
npx convex dev
```

Run a function against the dev deployment:

```bash
npx convex run api.pokemon.getById '{"id": 1}'
```

Run against production:

```bash
npx convex run --prod api.pokemon.getById '{"id": 1}'
```
