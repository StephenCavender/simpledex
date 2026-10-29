# Load the whole Pokédex and filter on the client

Status: accepted

The Pokédex list is served by one Convex query that returns every Pokédex entry, and search, Type, and Generation filtering happen in the browser through a pure `filterPokedex(entries, filters)` function. The dataset is small (~1025 entries), static between syncs, and capped by the National Pokédex, so one cached, reactive query beats server pagination: filtering is instant, there's no cursor to manage, and the filter logic is testable without Convex.

## Considered Options

- **Convex `paginate()` with `usePaginatedQuery`** (the earlier draft plan). Rejected: filters applied per page yield uneven or empty pages, and fixing that needs search indexes plus denormalized Type fields; the client still carries page state.
- **Server-side filtering that returns all matches.** Rejected: the query re-runs on every keystroke for no gain over filtering an already-loaded list.

## Consequences

- Revisit if the number of Pokédex entries grows by an order of magnitude (e.g. alternate forms or regional variants become separate entries) or the payload becomes noticeably slow on mobile.
- Loading everything doesn't mean rendering everything: drawing all ~1025 cards took about 10 seconds in Firefox, so the home grid is virtualised (only rows near the viewport are in the DOM). That fixed the slowness without touching this decision. The trade-off is that the browser's find-in-page only sees the rendered rows; the search box covers that.
- Pokédex entries are a projection; the full Pokémon record (stats, abilities) is only fetched on the detail route.
