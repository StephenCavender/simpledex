# Plan: Sync module (PokeAPI → SimpleDex)

**Status**: Ready
**Origin**: Architecture review candidate 4; also does the client-side half of candidate 2.

Terms follow [GLOSSARY.md](../GLOSSARY.md): Pokémon, Pokédex number, Pokédex entry, Generation, Sync.

## Problem

- **No working Sync.** `scripts/sync.ts` was deleted in `75897e8`, and `scripts/sync.sh` is a stub. The admin page still documents the deleted script. Nothing fills the Types table, so a fresh deployment shows no Type filter chips.
- **Public writes.** `clearAll`, `ingestPokemon`, `ingestTypes`, `ingestEvolutionChain`, and `backfillGenerationIds` are public mutations. Anyone with the deployment URL can wipe or corrupt production.
- **Shallow saving code.** Four copy-pasted save-or-update functions, each doing a full table scan (`.filter(q.eq(q.field("id")))`) with `as any` casts.
- **The detail route drives Sync.** Every detail view calls the public `fetchEvolutionChain` action, with client-side retry and timeouts.
- **Untyped Evolution Chains.** They are stored as a recursive tree in `v.any()`.
- **No tests** in `packages/backend`.
- **E2E in CI has no data.** It uses a dummy Convex URL.

## Design

### Sync module: `packages/backend/convex/sync.ts`

Interface (all internal; run with `bunx convex run`):

- `internal.sync.run({ gens?: number[], numbers?: number[], force?: boolean })`
  - With no arguments it syncs Generations I–IX. `gens` picks Generations from the Generation module; `numbers` picks individual Pokédex numbers. If both are given, their union is synced.
  - By default it skips Pokémon and Evolution Chains that are already stored; `force: true` re-syncs them.
- `internal.sync.clear()` wipes the `pokemon`, `species`, `evolutionChain`, and `types` tables. For local use.

Behind the interface:

- **PokeAPI access.** An internal seam `getJson(path): Promise<unknown>` (HTTP adapter over `fetch`). Requests run one at a time, about 100 ms apart.
- **Mapping.** PokeAPI JSON → Pokémon, Species, Evolution Chain, and Type documents.
- **Batching.** Each action syncs 50 Pokédex numbers, then `ctx.scheduler.runAfter(0, …)` starts the next batch. This stays well under the 10-minute action limit.
- **Order.** Types sync once at the start of a run. Evolution Chains are synced once per chain, deduplicated within a run and skipped if already stored (unless `force`).
- **Saving.** One internal save mutation per table that inserts or calls `db.replace` (never `db.patch`), looking documents up through a `by_id` index. Using `replace` means a forced Sync removes stale fields.
- **Failures.** A failing Pokémon is logged as `sync: #N failed: <reason>` and skipped. Each batch logs `sync: batch A–B synced X, skipped Y, failed Z`. There are no automatic retries; re-running `sync:run` only re-attempts the missing Pokémon.

### Schema (`convex/schema.ts`)

- Add a `by_id` index to `pokemon`, `species`, `evolutionChain`, and `types`. Replace every `.filter(q.eq(q.field("id"), …))` with `.withIndex("by_id", …)`.
- Remove the `by_type` index (it is on an array, so useless) and `by_generationId`.
- `evolutionChain`: `{ id, stages: Array<{ id, name, sprite, from?: number, method?: string }> }`.
  - `id` in each stage is the Pokédex number; `from` is the Pokédex number of the previous stage.
  - This replaces `chain: v.any()`, because Convex validators cannot be recursive.
- `types.damageRelations`: replace `v.any()` with a typed validator holding six arrays of Type names (`doubleDamageFrom`, `doubleDamageTo`, `halfDamageFrom`, `halfDamageTo`, `noDamageFrom`, `noDamageTo`).
- Drop `pokemon.generationId`, `species.generation`, and `species.evolvesFrom`. Nothing reads them, and the Generation comes from the Generation module. Dropping them takes two deploys; see the rollout steps.

### Public surface after this change

- **Keep**: `pokedex`, `getById`, `getSpecies`, `getEvolutionChain` (returns the stage list), `listTypes`.
- **Delete**: `list` (already gone), `getByName`, `getBySpeciesId`, `listSpecies`, `ingestPokemon`, `ingestTypes`, `ingestEvolutionChain`, `backfillGenerationIds`, `clearAll`, `fetchEvolutionChain`, `syncAllEvolutionChains`. Their behaviour moves into the Sync module where it is still needed.
- Delete `packages/backend/scripts/sync.sh`.

### Detail route (`routes/pokemon.$id.tsx`): candidate 2, client side only

- Delete `useAction(fetchEvolutionChain)`, `retryFetch`, the two refs, and the error state.
- Render the stage list: start from the stage without `from` and lay its children out with their `method`. Keep the current layout.
- If the Evolution Chain isn't synced, hide the Evolutions section.
- Deferred to candidate 2: fetching a missing chain on demand through the scheduler, and a single query keyed by Pokédex number.

### Admin route

- Replace "How to Sync" with the `bunx convex run sync:run …` commands: one Generation, several Generations, specific numbers, `force`, and `--prod`.
- Remove the "30s delay / 8.5 hours" note.

### Tests: `packages/backend`

- Add `vitest`, `convex-test`, and `@edge-runtime/vm`, plus `test` and `record-fixtures` scripts. Add the test files and scripts to `knip.json` entries.
- **Fixtures.** Real PokeAPI responses in `packages/backend/test/fixtures/pokeapi/<path>.json`, outside `convex/` so they aren't deployed. `bun run record-fixtures` re-records them. Set:
  - #1–3 (linear chain, level-up methods);
  - #25 (chain with the baby Pichu, item method), with #172 and #26 so the chain resolves;
  - #133–136 (branching chain);
  - #1025 (no evolutions, Generation IX, above 1000);
  - the Type list and the Types these Pokémon use.
- **Fixture adapter.** `vi.stubGlobal("fetch", …)` answers PokeAPI URLs from the fixtures and returns 404 for anything not recorded.
- **Interface under test.** Run `internal.sync.run` through convex-test and finish the scheduled batches. Then assert only on the public queries.
  - `pokedex` returns entries with the right Generation and image.
  - `getById` returns stats, abilities, height and weight in metres and kilograms.
  - `getSpecies` returns `evolutionChainId`, habitat and colour.
  - `getEvolutionChain` returns the stages and methods for the linear, baby, and branching chains.
  - `listTypes` returns the Types with their damage relations.
  - Skip-existing vs `force`.
  - A forced Sync removes a stale field from a document seeded the old way.
  - A 404 for one Pokémon fails only that Pokémon.
  - `numbers` and `gens` select the right Pokémon.

## Implementation steps

1. Backend test setup: vitest + convex-test, the fixture recorder, and recorded fixtures.
2. Schema, deploy 1 (both shapes accepted): add the `by_id` indexes, `evolutionChain.stages` (optional while `chain` is still allowed), and the typed `damageRelations`. Keep the old fields optional.
3. Sync module: write the tests from the "Tests" section first, then implement until they pass.
4. Delete the old functions and `sync.sh`; switch the remaining queries to `withIndex`; run codegen.
5. Detail route: render stages and drop the on-view fetch. Admin: new "How to Sync" text.
6. Verify locally: `bunx convex run sync:run '{"gens":[1]}'`, then check the home page, the detail page (Evolutions), and the admin counts.
7. **You, production:** run `npx convex deploy`, then `bunx convex run --prod sync:run '{"force":true}'`. Wait until the admin page shows 1025/1025.
8. Schema, deploy 2: drop `generationId`, `species.generation`, `species.evolvesFrom`, and `evolutionChain.chain`; make `stages` required. **You:** deploy to production.
9. CI e2e: start a local, account-free Convex backend in the job, push the functions, run `sync:run '{"numbers":[1,4,25,1025]}'` against live PokeAPI, and point `VITE_CONVEX_URL` at it. The job stays non-gating.
10. Docs: update `docs/deployment.md` (Data Sync section) and `packages/backend/README.md`.

## Out of scope

- Fetching a missing Evolution Chain on demand, and a single detail query (candidate 2, remainder).
- Scheduled or cron re-syncs.
- Alternate forms and regional variants (Pokédex numbers above 1025).
- UI for type matchups. This plan only stores the damage relations, typed.

## Verification

- `bun run check-types`, `bun run test` (web + backend), `bun run check`, `bun run test:e2e`.
- After the production Sync: the admin page shows every Generation complete, the Type chips appear, and Evolutions render for #1, #25, and #133.
