# Plan: Pokédex listing module (load whole Pokédex, filter client-side)

**Status**: Done
**Supersedes**: [scale-limit-pagination.md](scale-limit-pagination.md)
**Decision**: [ADR-0002](../docs/adr/0002-load-whole-pokedex-filter-client-side.md)

## Problem

Pagination is split across the seam between the backend and the home route:

- `pokemon.list` reads `take(1000)`, so Pokémon #1001–1025 never appear. It filters in memory and fakes a cursor with `findIndex`.
- The home route (`apps/web/src/routes/index.tsx`) re-implements page accumulation, reset-on-filter, and scroll restore with 4 `useState`s and 3 `useEffect`s.
- The admin route calls `list` with `limit: 10000` to count Pokémon per Generation.
- The Generation table is copied five times (twice in `convex/pokemon.ts`, admin's `GENERATIONS`, hard-coded `<option>`s on home, and Prev/Next capped at 151 on the detail route).

## Design

Terms follow [GLOSSARY.md](../GLOSSARY.md): Pokémon, Pokédex number, Pokédex entry, Generation.

### Generation module: `packages/backend/convex/generations.ts`

- `GENERATIONS`: one row per Generation with number (1–9), label (`Gen I`), region (`Kanto`), and first and last Pokédex number.
- `generationOf(pokedexNumber)`: returns the Generation number, or `undefined` outside 1–1025.
- `MAX_POKEDEX_NUMBER` (1025), derived from `GENERATIONS`.
- Pure module with no Convex functions, imported by both the backend and the web app (`@simpledex/backend/convex/generations`).

### Server: `api.pokemon.pokedex`

- A query with no args that returns `PokedexEntry[]`, sorted by Pokédex number.
- `PokedexEntry = { id, name, types, image, generation }`.
  - `image` is `artwork ?? sprite`, chosen on the server.
  - `generation` is `generationOf(id)`; the stored `generationId` is no longer read.
- Reads the whole `pokemon` table (`collect()`); no limit, no cursor.
- Replaces `pokemon.list`, which is deleted.

### Client: `apps/web/src/lib/pokedex.ts`

- `PokedexFilters = { q?: string; type?: string; gen?: number }`.
- `filterPokedex(entries, filters): PokedexEntry[]` is pure.
  - **Search** matches a case-insensitive name substring, or the Pokédex number (`25`, `025`, `#25` all find Pikachu).
  - **Type** keeps entries whose `types` include the selected Type (single select).
  - **Generation** keeps entries whose `generation` equals the selected one.
  - All filters combine with AND.
- No `usePokedex` hook: routes call `useQuery(api.pokemon.pokedex)` directly and pass the result through `filterPokedex`.

### Home route (`routes/index.tsx`)

- Filters live in URL search params `?q=&type=&gen=` via `validateSearch`. Typing updates the URL with `navigate({ search, replace: true })`.
- Render every filtered entry. No Load More, no virtualization; images stay `loading="lazy"`.
- Generation dropdown options come from `GENERATIONS`.
- Delete: the cursor and accumulated-list state, all three effects, `loadMore`, the debounce and its spinner.

### Admin route (`routes/admin.tsx`)

- Uses `useQuery(api.pokemon.pokedex)` and groups entries by `generation` for its counts.
- Replaces the local `GENERATIONS` with the shared module; the expected count per Generation is `last - first + 1`.

### Detail route (`routes/pokemon.$id.tsx`)

- Prev/Next bound uses `MAX_POKEDEX_NUMBER` instead of `151`.

## Implementation steps

1. Add `convex/generations.ts` and tests for `generationOf`: 1, 151, 152, 1025, and 0/1026 returning `undefined`.
2. Add the `pokedex` query; run `bun run codegen`.
3. Add `lib/pokedex.ts` with `filterPokedex`, plus tests for search by name and by number, Type, Generation, combined filters, empty filters, and #1001–1025 included.
4. Rewrite the home route on URL search params and `filterPokedex`.
5. Move admin to `pokedex` plus `GENERATIONS`.
6. Fix detail Prev/Next with `MAX_POKEDEX_NUMBER`.
7. Delete `pokemon.list`, the inline `GEN_ID_RANGES` in `list`, and `hooks/use-debounce.ts`. Run `bun run check` (knip should be clean).
8. Update `apps/web-e2e/tests/home.spec.ts`: cards render; searching `pikachu` shows #025; `?gen=9` shows #1025.
9. If public-facing behaviour changed (search by number), update `apps/marketing/src/llms.txt`.

## Out of scope (follow-ups)

- Dropping `pokemon.generationId` and the `backfillGenerationIds` mutation: do this when ingestion is rebuilt (architecture review candidate 4).
- Unused indexes (`by_type` on an array field, `by_generationId`): clean up with the schema pass.
- Type badge and Pokémon artwork presentation modules (candidate 5).
- Virtualizing the grid: only if measurably slow.

## Verification

- `bun run check-types`, `bun run test`, `bun run test:e2e`.
- Manually: all 1025 Pokémon appear with no filter; `?gen=9` includes #1001–1025; Back from a detail page restores the filters.
