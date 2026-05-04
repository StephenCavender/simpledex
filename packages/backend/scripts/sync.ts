import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env files in the backend directory
const backendDir = resolve(import.meta.dirname, "..");

// Load base .env file
config({ path: resolve(backendDir, ".env") });
// Load .env.local (overrides .env) if it exists
config({ path: resolve(backendDir, ".env.local") });

// Use CONVEX_URL from environment, defaulting to local dev URL
const convexUrl = process.env.CONVEX_URL || "https://adamant-coyote-255.convex.cloud";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchJson = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
};

const GENERATIONS = [
  { id: 1, name: "Gen I (Kanto)", start: 1, end: 151 },
  { id: 2, name: "Gen II (Johto)", start: 152, end: 251 },
  { id: 3, name: "Gen III (Hoenn)", start: 252, end: 386 },
  { id: 4, name: "Gen IV (Sinnoh)", start: 387, end: 493 },
  { id: 5, name: "Gen V (Unova)", start: 494, end: 649 },
  { id: 6, name: "Gen VI (Kalos)", start: 650, end: 721 },
  { id: 7, name: "Gen VII (Alola)", start: 722, end: 809 },
  { id: 8, name: "Gen VIII (Galar)", start: 810, end: 905 },
  { id: 9, name: "Gen IX (Paldea)", start: 906, end: 1025 },
];

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
      ? parseInt(speciesData.generation.url.split("/").filter(Boolean).pop()!)
      : undefined,
  };

  const chainUrl = speciesData.evolution_chain?.url;
  const chainId = chainUrl ? parseInt(chainUrl.split("/").filter(Boolean).pop()!) : null;

  const species = {
    id: speciesData.id,
    name: speciesData.name,
    evolutionChainId: chainId ?? undefined,
    generation: speciesData.generation?.name,
    habitat: speciesData.habitat?.name,
    color: speciesData.color?.name,
    evolvesFrom: speciesData.evolves_from_species?.url
      ? parseInt(speciesData.evolves_from_species.url.split("/").filter(Boolean).pop()!)
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
  const force = args.includes("--force");
  const testMode = args.includes("--test");

  console.log(`Syncing Pokemon from PokeAPI to Convex...`);
  console.log(`URL: ${convexUrl}\n`);

  // Test connection first
  const client = new ConvexHttpClient(convexUrl);
  try {
    await client.query(api.pokemon.list, { limit: 1 });
    console.log("✓ Convex connection OK\n");
  } catch (e) {
    console.error("✗ Convex connection failed:", e);
    process.exit(1);
  }

  // Test mode: sync only Pokemon 1-9 (starters + evolutions)
  if (testMode) {
    console.log("🧪 TEST MODE: Syncing Pokemon 1-9 only\n");
    for (let id = 1; id <= 9; id++) {
      try {
        const { pokemon, species } = await syncPokemon(id);
        await client.mutation(api.pokemon.ingestPokemon, { pokemon, species });
        console.log(`✓ ${pokemon.name} (ID: ${id})`);
      } catch (e: any) {
        console.error(`✗ [${id}] Failed:`, e.message);
      }
      if (id < 9) await sleep(1000); // 1s delay in test mode
    }
    console.log("\n✓ Test sync complete!");
    process.exit(0);
  }

  // Parse generation flags: --gen=1 or --gen=1,2,3
  const genArg = args.find((arg) => arg.startsWith("--gen="));
  let targetGens: typeof GENERATIONS = [];

  if (genArg) {
    const genNumbers = genArg.split("=")[1]?.split(",").map(Number) ?? [];
    targetGens = GENERATIONS.filter((g) => genNumbers.includes(g.id));
  } else {
    targetGens = [...GENERATIONS]; // All generations
  }

  const delayMs = 30_000; // 30 seconds between requests

  console.log(`Delay between requests: ${delayMs / 1000}s`);
  console.log(`Force re-sync: ${force}`);
  console.log(`Target generations: ${targetGens.map((g) => g.id).join(", ")}\n`);

  // Fetch existing Pokemon to skip
  let existingIds = new Set<number>();
  if (!force) {
    console.log("Fetching existing Pokemon from Convex...");
    try {
      const existing = await client.query(api.pokemon.list, { limit: 10000 });
      existing.pokemon.forEach((p: { id: number }) => existingIds.add(p.id));
      console.log(`✓ Found ${existingIds.size} existing Pokemon in Convex\n`);
    } catch (e) {
      console.error("✗ Failed to fetch existing data:", e);
    }
  }

  // Build ID ranges from target generations
  const idRanges = targetGens.map((g) => ({
    genId: g.id,
    genName: g.name,
    start: g.start,
    end: g.end,
  }));

  // Sync Pokemon by generation
  let totalSynced = 0;
  let totalFailed = 0;

  for (const range of idRanges) {
    console.log(`\n${"=".repeat(50)}`);
    console.log(`Syncing ${range.genName} (IDs ${range.start}-${range.end})`);
    console.log(`${"=".repeat(50)}`);

    let synced = 0;
    let failed = 0;

    for (let id = range.start; id <= range.end; id++) {
      // Skip if already exists (unless force)
      if (!force && existingIds.has(id)) {
        continue;
      }

      try {
        const { pokemon, species } = await syncPokemon(id);
        await client.mutation(api.pokemon.ingestPokemon, { pokemon, species });
        synced++;
        totalSynced++;
        const progress = id - range.start + 1;
        const total = range.end - range.start + 1;
        console.log(`✓ [${progress}/${total}] ${pokemon.name} (ID: ${id})`);
      } catch (e: any) {
        failed++;
        totalFailed++;
        console.error(`✗ [${id}] Failed to sync:`, e.message);
      }

      // Delay before next request (skip delay after last item of last generation)
      const isLastId = id === range.end && range === idRanges[idRanges.length - 1];
      if (!isLastId) {
        const remaining = range.end - id + totalFailed;
        console.log(`  Waiting ${delayMs / 1000}s... (approx ${remaining} remaining)\n`);
        await sleep(delayMs);
      }
    }

    console.log(`\n${range.genName} complete: Synced: ${synced}, Failed: ${failed}`);
  }

  // Sync types (only once)
  console.log(`\n${"=".repeat(50)}`);
  console.log("Syncing types...");
  try {
    const types = await syncTypes();
    await client.mutation(api.pokemon.ingestTypes, { types });
    console.log(`✓ Synced ${types.length} types`);
  } catch (e: any) {
    console.error("✗ Types:", e.message);
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`TOTAL: Synced: ${totalSynced}, Failed: ${totalFailed}`);
  console.log(`${"=".repeat(50)}`);
  process.exit(0);
}

main();
