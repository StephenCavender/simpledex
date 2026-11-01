# Install with Bun's hoisted linker

Status: accepted

The monorepo sets `linker = "hoisted"` in `bunfig.toml` instead of using Bun's default isolated linker. With isolated installs, Bun put the Expo app's `expo-constants` and `expo-linking` in the store twice: the same version and contents, under two different peer-dependency hashes. Metro would bundle both copies, and `expo-doctor` fails its duplicate-dependency check. Hoisting gives one copy, and the rest of the repo passed the same checks (types, tests, knip, web build, e2e) under it in spike #5.

## Consequences

- A workspace can import a package it doesn't declare and still resolve it. knip's unlisted-dependency check is what catches that now.
- This is safe only because every workspace uses the same React version (ADR-0005). If two Reacts were installed, hoisting would choose which one shared dependencies such as `convex/react` load.

## Considered Options

- **Keep isolated installs and accept the duplicates.** Rejected: two copies of Expo modules in the bundle, and a permanently red `expo-doctor`.
