#!/usr/bin/env bash
# Vercel build for simpledex-web, wired up by apps/web/vercel.json (Root
# Directory: apps/web). Production deploys Convex first, then builds the
# web app against the production Convex URL; a failed Convex push fails the
# build and leaves the current production deployment in place. Previews only
# build, so preview branches never push to the production backend.
#
# Production needs CONVEX_DEPLOY_KEY (Production scope) in Vercel.
set -euo pipefail

PRODUCTION_DEPLOYMENT="adept-labrador-868"

if [ "${VERCEL_ENV:-}" = "production" ]; then
  # Refuse to deploy anywhere but production: convex deploy targets whatever
  # deployment the key belongs to and points the site at it.
  case "${CONVEX_DEPLOY_KEY:-}" in
    "prod:${PRODUCTION_DEPLOYMENT}|"*) ;;
    *)
      echo "CONVEX_DEPLOY_KEY must be a production deploy key for ${PRODUCTION_DEPLOYMENT} (got '${CONVEX_DEPLOY_KEY%%|*}')." >&2
      exit 1
      ;;
  esac
  cd ../../packages/backend
  npx convex deploy \
    --cmd 'cd ../../apps/web && turbo run build' \
    --cmd-url-env-var-name VITE_CONVEX_URL
else
  turbo run build
fi
