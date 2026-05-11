# Plan: Remove `.take(1000)` Limit — Proper Pagination for `pokemon.list`

**Status**: Draft
**Priority**: High
**Owner**: TBD

## Problem

The `list` query in `packages/backend/convex/pokemon.ts` fetches all Pokemon via `db.query("pokemon").take(1000)`. The dataset has 1025 Pokemon across 9 generations, so any Pokemon with `id > 1000` (#1010–1025) is **invisible to the frontend** — they never appear in search results, type filters, or generation browsing.

```ts
// Current — misses Pokemon #1001–1025
let results = await db.query("pokemon").take(1000);
```

## Goal

All 1025 Pokemon are queryable and filterable from the frontend.

## Options

### Option A: Bump limit (quick fix)

Replace `.take(1000)` with `.collect()` or `.take(2000)`. Simple but loads all 1025 Pokemon into memory on every query, including ones filtered out.

**Effort**: ~5 minutes
**Trade-off**: Solves the bug but doesn't improve architecture. Fine as an immediate patch.

### Option B: Convex `paginate()` — cursor-based pagination

Use Convex's built-in `.paginate()` which uses index-based cursors and only fetches the page needed from DB. The `list` query already has a `cursor` parameter, so the frontend likely expects paginated responses.

```ts
const paginationOpts = { numItems: limit, cursor: cursor ?? null };
const page = await db.query("pokemon")
  .order("asc")
  .paginate(paginationOpts);
```

This requires:
1. Adding the correct Convex pagination import and args
2. Adjusting the return shape to match Convex's `paginate` response (has `page`, `isDone`, `continueCursor`)
3. Updating the frontend `useQuery` call to pass pagination opts

**Effort**: ~1-2 hours
**Trade-off**: Proper architecture, no hard limit. Requires frontend changes to wire up infinite scroll / "load more".

### Option C: Use existing indexes + filter-first approach

Since the schema already has indexes on `by_generationId`, `by_type`, and `by_name`, push filters into the DB query instead of filtering in memory:

```ts
let query = db.query("pokemon");
if (generation) query = query.filter(q => q.eq(q.field("generationId"), generation));
// ...etc
```

Combined with pagination, this only fetches the page of filtered results.

**Effort**: ~2-3 hours
**Trade-off**: Best performance, more invasive refactor to the query logic.

## Recommendation

**Option B** — Convex `paginate()` is the right tool. The query already has pagination args (`limit`, `cursor`), and Convex's `paginate` handles the cursor lifecycle automatically. The `list` query's current implementation loads **all** matching Pokemon into memory on every call (to support `startIndex` slicing), which is wasteful. `paginate()` eliminates this entirely.

## Implementation Steps

1. **Change query**: Replace `.take(1000)` with `.order("asc").paginate({ numItems: limit, cursor: cursor ?? null })`
2. **Adjust return value**: Convex paginate returns `{ page, isDone, continueCursor }` — keep `pokemon: page`, rename `continueCursor` to `nextCursor`, drop `isDone` (or pass it through)
3. **Update frontend**: The route/component using `useQuery(api.pokemon.list, ...)` needs to pass `cursor` from previous response to fetch next pages
4. **Verify**: Load all 9 generations and confirm Pokemon #1001–1025 appear

## Open Questions

- Does the frontend currently use the `cursor` from responses? (Need to check web routes)
- What is the desired UX for pagination? (Infinite scroll vs "Load More" button vs both)
