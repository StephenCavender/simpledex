# @simpledex/backend

Convex functions and schema for SimpleDex.

- `convex/pokemon.ts`: public queries the web app reads (`pokedex`, `getById`, `getSpecies`, `getEvolutionChain`, `listTypes`).
- `convex/sync.ts`: the Sync from PokeAPI. Internal only, so it can't be called from the browser.
- `convex/generations.ts`: the Generation table, shared with the web app.

## Sync

Run from this directory. Already-synced Pokémon and Evolution Chains are skipped unless `force` is set. Add `--prod` to target production.

```bash
bunx convex run sync:run                         # all Generations (~5–10 minutes)
bunx convex run sync:run '{"gens":[1,2]}'        # Gen I and II
bunx convex run sync:run '{"numbers":[25,133]}'  # specific Pokédex numbers
bunx convex run sync:run '{"force":true}'        # re-sync everything
bunx convex run sync:clear                       # wipe synced data (local use)
```

The Sync runs in scheduled batches of 50 Pokémon. Progress is logged as `sync: batch A–B synced X, skipped Y, failed Z`; failures are logged per Pokémon and can be retried by running the same command again.

## Tests

```bash
bun run test             # Sync tests via convex-test, against recorded PokeAPI fixtures
bun run record-fixtures  # re-record test/fixtures/pokeapi from live PokeAPI
```
