import { ConvexHttpClient } from "convex";
import { api } from "../convex/_generated/api";

// Use hardcoded dev URL from .env.local
const convexUrl = "https://adamant-coyote-255.convex.cloud";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchJson = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
};

const fetchAllPokemonList = async () => {
  const data = await fetchJson(`${POKEAPI_BASE}/pokemon?limit=10000`);
  return data.results; // Array of { name, url }
};

async function syncPokemon(id: number) {
  const data = await fetchJson(`${POKEAPI_BASE}/pokemon/${id}`);
  const speciesData = await fetchJson(`${POKEAPI_BASE}/pokemon-species/${id}`);

  const pokemon = {
    id: data.id,
    name: data.name,
    types: data.types.map((t: any) => t.type.name),
    sprite: data.sprites.front_default,
    artwork: data.sprites.other?.["official-artwork"]?.front_default,
    height: data.height / 10,
    weight: data.weight / 10,
    stats: data.stats.map((s: any) => ({
      name: s.stat.name,
      value: s.base_stat,
    })),
    abilities: data.abilities.map((a: any) => ({
      name: a.ability.name,
      isHidden: a.is_hidden,
    })),
    speciesId: speciesData.id,
    generationId: speciesData.generation?.url
      ? parseInt(speciesData.generation.url.split("/").filter(Boolean).pop())
      : undefined,
  };

  const chainUrl = speciesData.evolution_chain?.url;
  const chainId = chainUrl
    ? parseInt(chainUrl.split("/").filter(Boolean).pop())
    : null;

  const species = {
    id: speciesData.id,
    name: speciesData.name,
    evolutionChainId: chainId,
    generation: speciesData.generation?.name,
    habitat: speciesData.habitat?.name,
    color: speciesData.color?.name,
    evolvesFrom: speciesData.evolves_from_species?.url
      ? parseInt(
          speciesData.evolves_from_species.url
            .split("/")
            .filter(Boolean)
            .pop(),
        )
      : undefined,
  };

  return { pokemon, species };
}

async function syncTypes() {
  const data = await fetchJson(`${POKEAPI_BASE}/type`);
  const types = [];

  for (const type of data.results) {
    const typeData = await fetchJson(type.url);
    types.push({
      id: typeData.id,
      name: typeData.name,
      damageRelations: typeData.damage_relations,
    });
  }

  return types;
}

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : undefined;
  const force = args.includes('--force');
  const delayMs = 30_000; // 30 seconds between requests

  console.log(`Syncing Pokemon from PokeAPI to Convex...`);
  console.log(`URL: ${convexUrl}`);
  console.log(`Delay between requests: ${delayMs / 1000}s`);
  console.log(`Force re-sync: ${force}`);
  if (limit) console.log(`Limit: ${limit} Pokemon`);

  // Test connection first
  const client = new ConvexHttpClient(convexUrl);
  try {
    await client.query(api => api.pokemon.list({ limit: 1 }));
    console.log("✓ Convex connection OK");
  } catch (e) {
    console.error("✗ Convex connection failed:", e);
    console.error("Make sure you're running from packages/backend with convex dev running");
    process.exit(1);
  }

  // Fetch existing Pokemon to skip
  let existingIds = new Set<number>();
  if (!force) {
    console.log("\nFetching existing Pokemon from Convex...");
    try {
      const existing = await client.query(api => api.pokemon.list({ limit: 10000 }));
      existing.pokemon.forEach((p: any) => existingIds.add(p.id));
      console.log(`✓ Found ${existingIds.size} existing Pokemon in Convex`);
    } catch (e) {
      console.error("✗ Failed to fetch existing data:", e);
    }
  }

  // Fetch full Pokemon list
  console.log("\nFetching Pokemon list from PokeAPI...");
  let pokemonList;
  try {
    pokemonList = await fetchAllPokemonList();
    console.log(`✓ Found ${pokemonList.length} Pokemon`);
  } catch (e) {
    console.error("✗ Failed to fetch Pokemon list:", e);
    process.exit(1);
  }

  const toSync = limit ? pokemonList.slice(0, limit) : pokemonList;
  const toActuallySync = force ? toSync : toSync.filter((entry: any) => {
    const id = parseInt(entry.url.split("/").filter(Boolean).pop());
    return !existingIds.has(id);
  });

  console.log(`\nTotal in range: ${toSync.length}`);
  console.log(`To sync (new): ${toActuallySync.length}`);
  console.log(`Skipping (existing): ${toSync.length - toActuallySync.length}\n`);

  let synced = 0;
  let failed = 0;

  for (let i = 0; i < toActuallySync.length; i++) {
    const pokemonEntry = toActuallySync[i];
    // Extract ID from URL like "https://pokeapi.co/api/v2/pokemon/1/"
    const id = parseInt(pokemonEntry.url.split("/").filter(Boolean).pop());

    try {
      const { pokemon, species } = await syncPokemon(id);
      await client.mutation(api => api.pokemon.ingestPokemon, { pokemon, species });
      synced++;
      console.log(`✓ ${synced}/${toActuallySync.length}: ${pokemon.name} (ID: ${id})`);
    } catch (e: any) {
      failed++;
      console.error(`✗ ${i + 1}/${toActuallySync.length}: Failed to sync ID ${id}:`, e.message);
    }

    // Delay before next request (skip delay after last item)
    if (i < toActuallySync.length - 1) {
      const remaining = toActuallySync.length - synced - failed;
      console.log(`  Waiting ${delayMs / 1000}s... (${remaining} remaining)\n`);
      await sleep(delayMs);
    }
  }

  // Sync types
  console.log("\nSyncing types...");
  try {
    const types = await syncTypes();
    await client.mutation(api => api.pokemon.ingestTypes, { types });
    console.log(`✓ Synced ${types.length} types`);
  } catch (e: any) {
    console.error("✗ Types:", e.message);
  }

  console.log(`\nDone! Synced: ${synced}, Failed: ${failed}, Skipped: ${toSync.length - toActuallySync.length}`);
  process.exit(0);
}

main();
