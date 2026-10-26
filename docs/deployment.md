# Deployment

## Architecture

- **Frontend**: Static site deployed to Vercel (or any static host)
- **Backend**: Convex cloud (functions + database)
- **Marketing**: Eleventy static site deployed alongside web app

## Deploying Frontend

### Build

```bash
bun run build
```

This runs Turborepo, which builds all packages and apps. Output:

- `apps/web/dist/` — React app (Vite build)
- `apps/marketing/_site/` — Eleventy static site

### Deploy to Vercel

Production deploys from the `prod` branch (`git push origin master:prod`). The `simpledex-web` Vercel project uses Root Directory `apps/web` and framework Vite; its build command comes from [`apps/web/vercel.json`](../apps/web/vercel.json), which overrides the dashboard setting.

Environment variables:

| Variable            | Scope                | Source                                                            |
| ------------------- | -------------------- | ----------------------------------------------------------------- |
| `CONVEX_DEPLOY_KEY` | Production only      | Convex dashboard → production deployment → Settings → Deploy Keys |
| `VITE_CONVEX_URL`   | Preview (and others) | Convex deployment URL previews should read from                   |

## Deploying Backend

Production builds deploy Convex automatically: [`apps/web/scripts/vercel-build.sh`](../apps/web/scripts/vercel-build.sh) runs `convex deploy`, which typechecks and pushes functions and schema, then builds the web app against the production Convex URL. If the Convex push fails (for example, a schema change that existing data doesn't satisfy), the build fails and the current production deployment stays live. Preview builds never deploy Convex. The script refuses any key that isn't a production deploy key for `adept-labrador-868`, because `convex deploy` points the site at whichever deployment the key belongs to.

To deploy Convex by hand (deploys to production by default):

```bash
cd packages/backend
npx convex deploy
```

## Data Sync

Data is copied from PokeAPI by the internal Sync module. After a deploy that changes the synced data's shape, run a forced Sync:

```bash
cd packages/backend
bunx convex run --prod sync:run '{"force":true}'
```

See [packages/backend/README.md](../packages/backend/README.md) for all Sync options.

## Environment

The project uses two Convex deployments:

- **Dev**: `apps/web/.env` — local development
- **Production**: `apps/web/.env.production` — production build
