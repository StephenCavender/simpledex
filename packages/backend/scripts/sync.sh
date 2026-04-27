#!/bin/bash
# Run sync from PokeAPI to Convex
# Usage: bun run scripts/sync-cli.ts <count>

LIMIT=${1:-20}

echo "Syncing $LIMIT Pokemon..."

for i in $(seq 1 $LIMIT); do
  # Skip odds to be nice to PokeAPI
  if [ $((i % 2)) -eq 0 ]; then
    continue
  fi
  
  echo "Syncing #$i..."
  
  # This would call convex run - but it's too slow
  echo "Use: bunx convex run api.pokemon.ingestPokemon '{\"pokemon\": {...}, \"species\": {...}}'"
done

echo ""
echo "The convex run command works but is slow for many Pokemon."
echo "Better approach: edit packages/backend/convex/pokemon.ts to add a bulk endpoint"
echo "that fetches directly from PokeAPI server-side."