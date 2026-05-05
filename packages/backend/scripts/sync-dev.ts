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

// Starter Pokémon IDs: 3 per gen × 9 gens = 27 total
// Format: [Grass starter, Fire starter, Water starter] for each gen
const starterIds = [
  // Gen 1 - Kanto (Red/Blue/Yellow)
  1,
  2,
  3, // Bulbasaur line
  4,
  5,
  6, // Charmander line
  7,
  8,
  9, // Squirtle line
  // Gen 2 - Johto (Gold/Silver/Crystal)
  152,
  153,
  154, // Chikorita line
  155,
  156,
  157, // Cyndaquil line
  158,
  159,
  160, // Totodile line
  // Gen 3 - Hoenn (Ruby/Sapphire/Emerald)
  252,
  253,
  254, // Treecko line
  255,
  256,
  257, // Torchic line
  258,
  259,
  260, // Mudkip line
  // Gen 4 - Sinnoh (Diamond/Pearl/Platinum)
  387,
  388,
  389, // Turtwig line
  390,
  391,
  392, // Chimchar line
  393,
  394,
  395, // Piplup line
  // Gen 5 - Unova (Black/White)
  495,
  496,
  497, // Snivy line
  498,
  499,
  500, // Tepig line
  501,
  502,
  503, // Oshawott line
  // Gen 6 - Kalos (X/Y)
  650,
  651,
  652, // Chespin line
  653,
  654,
  655, // Fennekin line
  656,
  657,
  658, // Froakie line
  // Gen 7 - Alola (Sun/Moon)
  722,
  723,
  724, // Rowlet line
  725,
  726,
  727, // Litten line
  728,
  729,
  730, // Popplio line
  // Gen 8 - Galar (Sword/Shield)
  810,
  811,
  812, // Grookey line
  813,
  814,
  815, // Scorbunny line
  816,
  817,
  818, // Sobble line
  // Gen 9 - Paldea (Scarlet/Violet)
  906,
  907,
  908, // Sprigatito line
  909,
  910,
  911, // Fuecoco line
  912,
  913,
  914, // Quaxly line
];

// Mythical Pokémon IDs: 23 total from Bulbapedia
const mythicalIds = [
  151, // Gen 1 - Mew
  251, // Gen 2 - Celebi
  385,
  386, // Gen 3 - Jirachi, Deoxys
  488,
  490,
  491,
  492,
  493, // Gen 4 - Cresselia, Manaphy, Darkrai, Shaymin, Arceus
  494,
  647,
  648,
  649, // Gen 5 - Victini, Keldeo, Meloetta, Genesect
  719,
  720,
  721, // Gen 6 - Diancie, Hoopa, Volcanion
  801,
  802,
  807,
  808,
  809, // Gen 7 - Magearna, Marshadow, Zeraora, Meltan, Melmetal
  893, // Gen 8 - Zarude
  1025, // Gen 9 - Pecharunt
];

const allDevIds = [...new Set([...starterIds, ...mythicalIds])].sort((a, b) => a - b);

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

  return { pokemon, species, chainUrl };
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
  console.log("🧪 DEV SYNC: Starters + Mythicals");
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

  // Clear all data first
  console.log("🧹 Wiping all data...\n");
  try {
    const result = await client.mutation(api.pokemon.clearAll);
    console.log(`✓ Deleted ${result.deleted} records\n`);
  } catch (e: any) {
    console.error("✗ Failed to clear data:", e.message);
    process.exit(1);
  }

  // Sync all dev Pokémon (starters + mythicals)
  console.log(`🧪 Syncing ${allDevIds.length} Pokémon (starters + mythicals)...\n`);
  let synced = 0;
  let failed = 0;

  for (const id of allDevIds) {
    try {
      const { pokemon, species, chainUrl } = await syncPokemon(id);
      await client.mutation(api.pokemon.ingestPokemon, { pokemon, species });
      console.log(`✓ ${pokemon.name} (ID: ${id})`);

      // Fetch evolution chain if available
      if (chainUrl) {
        try {
          const chainId = parseInt(chainUrl.split("/").filter(Boolean).pop()!);
          await client.action(api.pokemon.fetchEvolutionChain, { chainId });
        } catch (e: any) {
          console.log(`  ⚠ Failed to fetch evolution chain: ${e.message}`);
        }
      }

      synced++;
    } catch (e: any) {
      failed++;
      console.error(`✗ [${id}] Failed:`, e.message);
    }

    // 1s delay between requests
    if (id !== allDevIds[allDevIds.length - 1]) {
      await sleep(1000);
    }
  }

  console.log(`\n✓ Pokémon sync complete: ${synced} synced, ${failed} failed\n`);

  // Sync types
  console.log("Syncing types...");
  try {
    const types = await syncTypes();
    await client.mutation(api.pokemon.ingestTypes, { types });
    console.log(`✓ Synced ${types.length} types`);
  } catch (e: any) {
    console.error("✗ Types:", e.message);
  }

  console.log("\n✓ DEV SYNC COMPLETE!");
  process.exit(0);
}

main();
