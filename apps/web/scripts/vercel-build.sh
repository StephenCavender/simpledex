#!/usr/bin/env bash
# Vercel build for simpledex-web, wired up by apps/web/vercel.json (Root
# Directory: apps/web). Production deploys Convex first, then builds the
# web app against the production Convex URL; a failed Convex push fails the
# build and leaves the current production deployment in place. Previews only
# build, so preview branches never push to the production backend.
#
# Production needs CONVEX_DEPLOY_KEY (Production scope) in Vercel.
set -euo pipefail

if [ "${VERCEL_ENV:-}" = "production" ]; then
  cd ../../packages/backend
  npx convex deploy \
    --cmd 'cd ../../apps/web && turbo run build' \
    --cmd-url-env-var-name VITE_CONVEX_URL
else
  turbo run build
fi
