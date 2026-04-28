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

## AI Crawlers

Marketing site includes `llms.txt` for AI indexing. Update with:
- `/apps/marketing/src/llms.txt`
- Rebuild with `cd apps/marketing && bun run build`