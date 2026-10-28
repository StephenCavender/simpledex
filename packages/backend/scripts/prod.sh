#!/usr/bin/env bash
# Runs a Convex CLI command against production with the personal deploy key in
# packages/backend/.env.prod.local (gitignored). Kept out of .env.local, which
# the Convex CLI reads for every command, including `convex dev`.
#
#   bun run prod run pokemon:pokedex
#   bun run sync:prod '{"force":true}'
set -euo pipefail
cd "$(dirname "$0")/.."

PRODUCTION_DEPLOYMENT="adept-labrador-868"
ENV_FILE=".env.prod.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing packages/backend/$ENV_FILE. Copy $ENV_FILE.example and add a production deploy key." >&2
  exit 1
fi

set -a
# shellcheck source=/dev/null
. "./$ENV_FILE"
set +a

case "${CONVEX_DEPLOY_KEY:-}" in
  "prod:${PRODUCTION_DEPLOYMENT}|"*) ;;
  *)
    echo "CONVEX_DEPLOY_KEY in $ENV_FILE must be a production deploy key for ${PRODUCTION_DEPLOYMENT} (got '${CONVEX_DEPLOY_KEY%%|*}')." >&2
    exit 1
    ;;
esac

exec bunx convex "$@"
