import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";

const fetchJson = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
};

export const list = query({
  args: {
    type: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async ({ db }, { type, search, limit = 20 }) => {
    let results = await db.query("pokemon").take(1000);

    if (type) {
      results = results.filter((p) => p.types.includes(type.toLowerCase()));
    }

    if (search) {
      const s = search.toLowerCase();
      results = results.filter((p) => p.name.includes(s));
    }

    return results.slice(0, limit);
  },
});

export const getById = query({
  args: { id: v.number() },
  handler: async ({ db }, { id }) => {
    return db.query("pokemon").filter((q) => q.eq(q.field("id"), id)).first();
  },
});

export const getByName = query({
  args: { name: v.string() },
  handler: async ({ db }, { name }) => {
    return db
      .query("pokemon")
      .filter((q) => q.eq(q.field("name"), name.toLowerCase()))
      .first();
  },
});

export const getSpecies = query({
  args: { id: v.number() },
  handler: async ({ db }, { id }) => {
    return db.query("species").filter((q) => q.eq(q.field("id"), id)).first();
  },
});

export const getEvolutionChain = query({
  args: { id: v.number() },
  handler: async ({ db }, { id }) => {
    return db
      .query("evolutionChain")
      .filter((q) => q.eq(q.field("id"), id))
      .first();
  },
});

export const listTypes = query({
  handler: async ({ db }) => {
    return db.query("types").order("asc").collect();
  },
});

export const ingestPokemon = mutation({
  args: {
    pokemon: v.object({
      id: v.number(),
      name: v.string(),
      types: v.array(v.string()),
      sprite: v.string(),
      artwork: v.optional(v.string()),
      height: v.number(),
      weight: v.number(),
      stats: v.array(v.object({ name: v.string(), value: v.number() })),
      abilities: v.array(v.object({ name: v.string(), isHidden: v.boolean() })),
      speciesId: v.number(),
    }),
    species: v.object({
      id: v.number(),
      name: v.string(),
      evolutionChainId: v.optional(v.number()),
      generation: v.optional(v.string()),
      habitat: v.optional(v.string()),
      color: v.optional(v.string()),
      evolvesFrom: v.optional(v.number()),
    }),
  },
  handler: async ({ db }, { pokemon, species }) => {
    const existing = await db
      .query("pokemon")
      .filter((q) => q.eq(q.field("id"), pokemon.id))
      .first();

    if (existing) {
      await db.patch(existing._id, pokemon);
    } else {
      await db.insert("pokemon", pokemon);
    }

    const existingSpecies = await db
      .query("species")
      .filter((q) => q.eq(q.field("id"), species.id))
      .first();

    if (existingSpecies) {
      await db.patch(existingSpecies._id, species);
    } else {
      await db.insert("species", species);
    }

    return { success: true };
  },
});

export const ingestTypes = mutation({
  args: {
    types: v.array(
      v.object({
        id: v.number(),
        name: v.string(),
        damageRelations: v.any(),
      }),
    ),
  },
  handler: async ({ db }, { types }) => {
    for (const type of types) {
      const existing = await db
        .query("types")
        .filter((q) => q.eq(q.field("id"), type.id))
        .first();

      if (existing) {
        await db.patch(existing._id, type);
      } else {
        await db.insert("types", type);
      }
    }

    return { synced: types.length };
  },
});

export const bulkSyncFromPokeAPI = action({
  args: { limit: v.optional(v.number()) },
  handler: async ({ runMutation }, { limit = 20 }) => {
    const results = [];
    const toSync = Math.min(limit, 151);

    for (let i = 1; i <= toSync; i++) {
      try {
        const data = await fetchJson(`${POKEAPI_BASE}/pokemon/${i}`);
        const speciesData = await fetchJson(`${POKEAPI_BASE}/pokemon-species/${i}`);

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

        await runMutation("pokemon:ingestPokemon", { pokemon, species });
        results.push(pokemon.name);
      } catch (e) {
        console.error(`Failed to sync ${i}:`, e);
      }
    }

    return { synced: results.length, names: results };
  },
});