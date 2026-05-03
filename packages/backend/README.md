# Sync Script

Run this locally to ingest Pokemon data from PokeAPI into Convex.

## Usage

```bash
# Set your Convex admin key
export CONVEX_ADMIN_KEY=your_admin_key_from_convex_dashboard

# Run the sync (default: first 151 Pokemon)
bunx tsx scripts/sync.ts

# Sync more Pokemon
bunx tsx scripts/sync.ts 500
```

## Setup

1. Get your admin key from the Convex dashboard (Settings > API Keys)
2. Set it as an environment variable
3. Run the script

The script calls `ingestPokemon` and `ingestTypes` mutations in Convex to store PokeAPI data.
