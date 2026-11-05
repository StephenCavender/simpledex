# Coding Standards

## TypeScript

- No `any`; no casts to silence errors.
- Explicit return types on exported functions.
- No try/catch unless you handle the error meaningfully.
- Prefer pure functions and immutable updates.

## React (apps/web)

- React Compiler is enabled: don't add `useMemo`/`useCallback`.
- Routes are TanStack Router file-based routes; `routeTree.gen.ts` is generated, don't edit it.
- Tailwind v4; colours come from `@simpledex/tokens`. Use theme tokens, not raw colors. See [../design.md](../design.md).

## Convex (packages/backend)

- All server state goes through Convex queries/mutations; components use `useQuery` directly. No REST, manual caching, or polling.
- The one exception is mobile offline: `apps/mobile` screens use `useCachedQuery` (`src/lib/use-cached-query.ts`), which wraps `useQuery` with the `expo-sqlite` key-value store, because Convex's client doesn't persist query results (ADR-0003).
- Validate args and keep `schema.ts` in sync. `convex/_generated` is generated; run `bun run codegen` instead of editing.

## Marketing (apps/marketing)

- If you change public-facing features, update `src/llms.txt` and rebuild with `bun run build` in that app.
