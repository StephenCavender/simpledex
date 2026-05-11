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

This runs Turboreto which builds all packages and apps. Output:
- `apps/web/dist/` — React app (Vite build)
- `apps/marketing/_site/` — Eleventy static site

### Deploy to Vercel

The project is configured for Vercel deployment. Required environment variables:

| Variable | Source |
|---|---|
| `VITE_CONVEX_URL` | Convex production deployment URL |
| `CONVEX_DEPLOY_KEY` | Create in Convex dashboard (Settings > Deploy Keys) |

## Deploying Backend

Push Convex functions and schema to production:

```bash
npx convex deploy --prod
```

This typechecks, bundles, and pushes functions + schema to the production deployment.

## Data Sync

### Backfill generation IDs

```bash
npx convex run --prod api.pokemon.backfillGenerationIds
```

### Sync evolution chains

```bash
npx convex run --prod api.pokemon.syncAllEvolutionChains
```

## Environment

The project uses two Convex deployments:
- **Dev**: `apps/web/.env` — local development
- **Production**: `apps/web/.env.production` — production build
