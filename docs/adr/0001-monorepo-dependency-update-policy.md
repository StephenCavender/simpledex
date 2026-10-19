# Monorepo dependency update policy

Status: accepted

Dependencies are updated in risk-staged passes rather than one sweep, with shared versions centralized in the Bun catalog so each version lives in exactly one place. A routine pass takes patch/minor updates plus majors that are confined to build-and-test tooling (`vitest`, `happy-dom`, the `shadcn` CLI, `vite-plugin-pwa` and its assets generator, `oxlint`, `oxfmt`, `knip`, `turbo`), while holding TypeScript 6 → 7 and runtime-type changes for a separate pass. `lucide-react` is unified on v1, and `@types/node` follows the Node floor declared in `engines.node`.

## Context

The monorepo had drifted: the same packages were declared at different versions across workspaces (`lucide-react` 0.546 vs 1.8, `react` 19.2.3 vs 19.2.5, `@types/node` 22 vs 25), the lockfile was stale, and there was no CI — so nothing mechanically verified a bump. Bun's catalog already existed but covered only five packages, and no Node runtime was declared anywhere in the repo, leaving `@types/node` without ground truth.

## Considered Options

- **One mega-update commit.** Rejected: a single red build makes finding the culprit manual, and it violates the repo's atomic-commit convention.
- **Patch/minor only, defer every major indefinitely.** Rejected: it leaves the toolchain permanently behind and keeps `packages/ui` on the dead `lucide-react` 0.x line.
- **Everything to `latest`, including TypeScript 7.** Rejected: TypeScript 7 changes the compiler implementation and can surface unrelated type errors; bundling it with routine bumps destroys attribution.

## Consequences

- A dependency joins the root catalog when two or more workspaces declare it, or when its version must agree across workspaces for correctness (e.g. React and its type packages). Workspace-only tools stay local.
- `engines.node` becomes the ground truth for `@types/node`, so future type bumps follow the declared runtime instead of drifting.
- Dependency pull requests are only meaningful once CI exists. The workflow runs `install → check-types → build → test` and supplies a dummy `VITE_CONVEX_URL` so the Vite build can run without Convex secrets.
- `test:e2e` runs as a separate, initially non-gating job until it has proven stable in CI.
- The TypeScript 7 pass is queued as its own change; if it stalls, it is deferred or tracked separately rather than blocking the refresh.
