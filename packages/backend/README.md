# @simpledex/backend

Convex functions and schema for SimpleDex.

- `convex/pokemon.ts`: public queries the web app reads (`pokedex`, `getById`, `getSpecies`, `getEvolutionChain`, `listTypes`).
- `convex/sync.ts`: the Sync from PokeAPI. Internal only, so it can't be called from the browser.
- `convex/generations.ts`: the Generation table, shared with the web app.

## Sync

Run from this directory. Already-synced Pokémon and Evolution Chains are skipped unless `force` is set.

```bash
bun run sync                         # all Generations (~5–10 minutes)
bun run sync '{"gens":[1,2]}'        # Gen I and II
bun run sync '{"numbers":[25,133]}'  # specific Pokédex numbers
bun run sync '{"force":true}'        # re-sync everything
bun run sync:status                  # live progress: counts, missing, running
bunx convex run sync:clear           # wipe synced data (local use)
```

`bun run sync` targets the deployment in `.env.local` (your dev or local deployment). `sync:run` returns as soon as the first batch is scheduled; the Sync then runs in scheduled batches of 50 Pokémon inside Convex. `sync:status` shows `running` until the last batch finishes, how many Pokédex numbers are still `missing`, and how many documents per table are still in the pre-Sync (`legacy`) shape. Progress is logged as `sync: batch A–B synced X, skipped Y, failed Z`; failures are logged per Pokémon. Re-running without `force` retries Pokémon that were never stored; to retry ones already stored, pass them explicitly: `'{"numbers":[24],"force":true}'`. Each run ends by removing Types no Pokémon has and Evolution Chains no Species references.

## Production

Production commands use a personal deploy key kept in `.env.prod.local` (gitignored), never in `.env.local`, which the Convex CLI reads for every command.

1. In the Convex dashboard, open `adept-labrador-868` → Settings → Deploy Keys and create a key with `deployment:functions:runInternalActions` and `deployment:functions:runInternalQueries` (add `deployment:logs:view` for logs).
2. `cp .env.prod.local.example .env.prod.local` and paste the key.

```bash
bun run sync:prod '{"force":true}'  # Sync production
bun run sync:status:prod            # watch production Sync progress (Ctrl-C to stop)
bun run prod run pokemon:pokedex    # any Convex CLI command against production
bun run prod logs                   # tail production logs
```

`scripts/prod.sh` refuses any key that isn't a production key for `adept-labrador-868`.

## Tests

```bash
bun run test             # Sync tests via convex-test, against recorded PokeAPI fixtures
bun run record-fixtures  # re-record test/fixtures/pokeapi from live PokeAPI
```
