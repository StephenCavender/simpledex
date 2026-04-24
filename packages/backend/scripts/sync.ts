import { ConvexHttpClient } from "convex/http";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";

const fetchJson = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
};

const convexUrl = process.env.CONVEX_URL || "https://" + process.env.CONVEX_DEPLOYMENT + ".convex.cloud";
const convexKey = process.env.CONVEX_ADMIN_KEY || process.env.CONVEX_DEPLOY_KEY;

if (!convexKey) {
  console.error("Missing CONVEX_ADMIN_KEY or CONVEX_DEPLOY_KEY");
  process.exit(1);
}

const convex = new ConvexHttpClient(convexUrl, convexKey);

async function syncPokemon(id: number) {
  console.log(`Syncing Pokemon #${id}...`);

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
  console.log("Syncing types...");

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
  const limit = parseInt(process.argv[2] || "151");

  console.log(`Syncing ${limit} Pokemon from PokeAPI...`);

  for (let i = 1; i <= limit; i++) {
    try {
      const { pokemon, species } = await syncPokemon(i);

      await convex.mutation(api => api.pokemon.ingestPokemon, { pokemon, species });
      console.log(`Synced ${pokemon.name}`);
    } catch (e) {
      console.error(`Failed to sync ${i}:`, e);
    }
  }

  const types = await syncTypes();
  await convex.mutation(api => api.pokemon.ingestTypes, { types });
  console.log(`Synced ${types.length} types`);

  console.log("Done!");
}

main();