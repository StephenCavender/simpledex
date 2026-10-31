# Lock the monorepo's React version to the Expo SDK's

Status: accepted

The catalog pins `react`, `react-dom`, and their `@types` to exactly the version the current Expo SDK ships, and the web app uses the same version. React Native's renderer refuses to run unless `React.version` matches exactly. A second, newer React for the web would also be hoisted by Bun, so hoisted shared dependencies like `convex/react` would load a different React instance than the mobile app does, which breaks hooks and context. That could be patched with Metro and Jest resolver overrides, but they're fragile and fail without warning.

To keep both apps current, we upgrade the Expo SDK soon after each release (each SDK ships the latest React) instead of bumping React on its own. This refines ADR-0001's rule that React must agree across workspaces.
