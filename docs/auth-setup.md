# SimpleDex Auth Setup Guide

## Testing

This project uses **Vitest** (not Playwright). Smoke tests for auth routes live in:
`apps/web/src/test/auth-smoke.test.ts`

Run tests:
```bash
cd apps/web && bun test
# or from project root:
bun test
```

The smoke tests verify that auth route files compile and export valid TanStack Router route definitions.

## Prerequisites

- Convex project created and linked (`npx convex dev` has been run)
- A Google Cloud project with OAuth credentials
- A Discord application with OAuth credentials
- Vercel account for deployment

## 1. Convex Auth Packages

Already installed in Wave 1:

```
packages/backend: @convex-dev/auth, @auth/core
apps/web: @convex-dev/auth
```

## 2. Environment Variables

### Convex Dashboard (Production + Preview)

Set these in your Convex deployment dashboard under Settings → Environment Variables:

```
SITE_URL=https://your-app.vercel.app
# Or for preview: https://your-project-git-branch.vercel.app

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
```

### Vercel (Frontend)

Set these in Vercel project settings → Environment Variables:

```
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CONVEX_SITE_URL=https://your-deployment.convex.site
```

## 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Navigate to APIs & Services → Credentials
4. Create OAuth 2.0 Client ID (Application type: Web application)
5. Add authorized redirect URIs:
   - `https://your-deployment.convex.site/api/auth/callback/google` (production)
   - `http://localhost:5173/api/auth/callback/google` (local dev)
6. Copy Client ID and Client Secret to Convex env vars

## 4. Discord OAuth Setup

1. Go to [Discord Developer Portal](https://discord.com/developers)
2. Create a new application
3. Navigate to OAuth2 → General
4. Add redirect URIs:
   - `https://your-deployment.convex.site/api/auth/callback/discord` (production)
   - `http://localhost:5173/api/auth/callback/discord` (local dev)
5. Copy Client ID and Client Secret to Convex env vars

## 5. Local Development

```bash
# Start Convex dev server (keeps types in sync)
npx convex dev

# In another terminal, start the web app
cd apps/web && bun run dev
```

Visit `http://localhost:5173/login` to test the login flow.

## 6. Vercel Deployment

1. Connect your Git repo to Vercel
2. Set framework preset to "Vite"
3. Set build command: `npx convex deploy --cmd 'bun run build'`
4. Set root directory: `apps/web` (or adjust accordingly)
5. Add the Vercel environment variables listed above
6. Deploy — Convex functions and frontend deploy together

## 7. Verifying the Setup

After deployment:
1. Visit your production URL
2. Navigate to `/login`
3. Click "Sign in with Google" or "Sign in with Discord"
4. Complete OAuth flow
5. Should redirect back to the home page, authenticated
6. Visit `/_authenticated/favorites` — should be accessible only when signed in

## 8. User Data Models

With Convex Auth + extended schema, each user gets:
- `users` table: profile info (name, email, image)
- `favorites` table: favorite Pokemon by userId + pokemonId
- `pokedexRecords` table: per-game caught/seen/shiny progress

## 9. Useful Commands

```bash
# Regenerate Convex types after schema changes
npx convex codegen

# Deploy to production
npx convex deploy --cmd 'bun run build'

# Check Convex logs
npx convex logs

# View deployed site
npx convex dashboard
```
