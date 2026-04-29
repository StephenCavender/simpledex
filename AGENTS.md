# SimpleDex Development Guide

## Project Structure

```
simpledex/
├── apps/
│   ├── web/          # React web app (TanStack Router)
│   └── marketing/    # Eleventy static site
├── packages/
│   ├── backend/     # Convex functions
│   ├── ui/          # Shared UI components
│   ├── env/         # Environment config
│   └── config/      # Shared config
└── turbo.json       # Turborepo config
```

## Development

```bash
# Start all dev servers (web on 3001, marketing on 8080, convex)
bun run dev

# Start individual
bun run dev:web
bun run dev:backend
bun run dev:marketing
```

## Stack

- **Web**: React 19 + TanStack Router + TailwindCSS v4 + shadcn/ui
- **Marketing**: Eleventy
- **Backend**: Convex
- **Build**: Vite
- **Package Manager**: Bun
- **PWA**: vite-plugin-pwa
- **Testing**: Vitest with happy-dom

## Code Standards

### React

- React Compiler is enabled - avoid manual `useMemo`/`useCallback`
- Colocate code that changes together
- Compose smaller components rather than massive JSX blocks
- Prefer TanStack Router file-based routing
- Use v4 Tailwind format with global CSS variables

### TypeScript

- Don't cast to `any`
- Don't add unnecessary try/catch

### Testing

```bash
# Run tests
bun test
```

## Build & Deploy

```bash
# Build all apps
bun run build
```

- Web app deploys to Vercel/Cloudflare
- Marketing deploys to any static host
- Convex deploys via `convex deploy`

## Git Workflow

### Commit Standards
- Make **atomic commits** - one logical change per commit
- Use **conventional commits** format: `type: description`
  - `feat:` for new features
  - `fix:` for bug fixes
  - `refactor:` for code restructuring
  - `docs:` for documentation
  - `style:` for formatting changes
  - `test:` for adding tests

### Rules
- **Never push without explicit instruction** from the user
- Stage and commit related changes together
- Write clear, concise commit messages describing the "why"

```bash
# Check status
git status

# Create atomic commit
git add <specific-files>
git commit -m "feat: add user authentication"

# Only push when instructed
git push origin master
```

## AI Crawlers

Marketing site includes `llms.txt` for AI indexing. Update with:
- `/apps/marketing/src/llms.txt`
- Rebuild with `cd apps/marketing && bun run build`