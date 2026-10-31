# Build the mobile app on plain Expo, not Ignite

Status: accepted

The mobile app lives in `apps/mobile` as a plain `create-expo-app` project with Expo Router, built and shipped with EAS. Ignite was the obvious starting point (the earlier `simpledex-mobile` was an Ignite app), but its boilerplate is a standalone stack: apisauce for the API layer, MMKV for persistence, its own theming system, i18n, and its own folder conventions. Convex already does the API and caching work, and the design tokens are shared with the web app (ADR-0004), so most of Ignite would be deleted on arrival. We borrow individual Ignite ideas (component patterns, Reactotron, Maestro) only when they earn their place.

## Consequences

- Styling uses Uniwind (Tailwind v4 for React Native), not Ignite's theme objects. NativeWind was ruled out because its stable line still targets Tailwind v3.
- The offline cache is our own small layer on `expo-sqlite`'s key-value store, because Convex's client does not persist query results.
