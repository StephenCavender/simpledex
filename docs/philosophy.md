# Philosophy

## Design

SimpleDex is a Pokemon reference app. The design philosophy is:

**Reference-first** — The app's primary job is to surface Pokemon data quickly. Every UI decision should make information more accessible, not more decorative. Pokemon artwork and data are the hero.

**Minimal chrome** — Navigation, controls, and UI chrome recede into the background. Sticky header with backdrop blur keeps context available without taking visual priority. Cards use subtle borders rather than heavy containers.

**Dark by default** — The app defaults to dark mode (a Pokedex should feel like a screen in a dim room). Light mode is supported for accessibility.

**Responsive** — The grid adapts: 2 columns on mobile, 3 on tablet, 4 on desktop. Images are lazy-loaded. Touch targets are appropriately sized.

## Code

**Monorepo** — Turborepo manages the workspace. Shared packages for UI components, backend functions, and environment config. Each app and package has a single responsibility.

**Convex for state** — All server state flows through Convex queries and mutations. No REST endpoints, no manual caching, no polling. React components use `useQuery` directly.

**TypeScript everywhere** — End-to-end type safety from Convex backend to React frontend. The `convex/_generated` API provides fully typed function references.

**React 19 + Compiler** — The React Compiler handles memoization; manual `useMemo`/`useCallback` is unnecessary. Functional components only.

**TanStack Router** — File-based routing with type-safe params and search params. Auto code-splitting per route.

## Data Model

- **Pokemon**: Core entity with id, name, types, stats, abilities, sprites, artwork
- **Species**: Evolution chain, habitat, color, generation metadata
- **Evolution Chains**: Linked tree structure of evolutionary relationships
- **Types**: Type names and damage relations
