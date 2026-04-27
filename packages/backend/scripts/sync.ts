import { ConvexHttpClient } from "convex";

// Use hardcoded dev URL from .env.local
const convexUrl = "https://adamant-coyote-255.convex.cloud";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";

const fetchJson = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
};

// Create client without auth - convex run has auth baked in
const createClient = () => new ConvexHttpClient(convexUrl);

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
  const limit = parseInt(process.argv[2] || "20");

  console.log(`Syncing ${limit} Pokemon from PokeAPI to Convex...`);
  console.log(`URL: ${convexUrl}`);

  // Test connection first
  const test = createClient();
  try {
    await test.query(api => api.pokemon.list({ limit: 1 }));
    console.log("✓ Convex connection OK");
  } catch (e) {
    console.error("✗ Convex connection failed:", e);
    console.error("Make sure you're running from packages/backend with convex dev running");
    process.exit(1);
  }

  for (let i = 1; i <= limit; i++) {
    try {
      const { pokemon, species } = await syncPokemon(i);
      const convex = createClient();
      await convex.mutation(api => api.pokemon.ingestPokemon, { pokemon, species });
      console.log(`✓ ${i}: ${pokemon.name}`);
    } catch (e) {
      console.error(`✗ ${i}:`, e.message);
    }
  }

  // Sync types
  try {
    const types = await syncTypes();
    const convex = createClient();
    await convex.mutation(api => api.pokemon.ingestTypes, { types });
    console.log(`✓ Synced ${types.length} types`);
  } catch (e) {
    console.error("✗ Types:", e.message);
  }

  console.log("Done!");
}

main();