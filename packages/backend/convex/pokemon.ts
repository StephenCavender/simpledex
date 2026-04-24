import { query, mutation } from "./_generated/server";
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
    cursor: v.optional(v.number()),
  },
  handler: async ({ db }, { type, search, limit = 20, cursor }) => {
    let q = db.query("pokemon").orderBy("id");

    if (type) {
      q = q.filter((q) => q.field("types").mem(type.toLowerCase()));
    }

    if (search) {
      q = q.filter((q) => q.field("name").contains(search.toLowerCase()));
    }

    const results = await q.take(limit);
    return results;
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
    return db.query("types").orderBy("id").collect();
  },
});

export const syncPokemon = mutation({
  args: { id: v.number() },
  handler: async ({ db }, { id }) => {
    const data = await fetchJson(`${POKEAPI_BASE}/pokemon/${id}`);
    const speciesData = await fetchJson(`${POKEAPI_BASE}/pokemon-species/${id}`);

    const existing = await db
      .query("pokemon")
      .filter((q) => q.eq(q.field("id"), id))
      .first();

    const pokemon = {
      id: data.id,
      name: data.name,
      types: data.types.map((t: any) => t.type.name),
      sprite: data.sprites.front_default,
      artwork: data.sprites.other["official-artwork"].front_default,
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

    if (existing) {
      await db.patch(existing._id, pokemon);
    } else {
      await db.insert("pokemon", pokemon);
    }

    const existingSpecies = await db
      .query("species")
      .filter((q) => q.eq(q.field("id"), speciesData.id))
      .first();

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
      evolvesFrom: speciesData.evolves_from_species?.name
        ? parseInt(
            speciesData.evolves_from_species.url
              .split("/")
              .filter(Boolean)
              .pop(),
          )
        : undefined,
    };

    if (existingSpecies) {
      await db.patch(existingSpecies._id, species);
    } else {
      await db.insert("species", species);
    }

    return pokemon;
  },
});

export const bulkSync = mutation({
  args: { limit: v.optional(v.number()) },
  handler: async ({ db }, { limit = 151 }) => {
    const countData = await fetchJson(`${POKEAPI_BASE}/pokemon?limit=1`);
    const total = countData.count;
    const toSync = limit > total ? total : limit;

    const results = [];
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

        const existing = await db
          .query("pokemon")
          .filter((q) => q.eq(q.field("id"), i))
          .first();

        if (existing) {
          await db.patch(existing._id, pokemon);
        } else {
          await db.insert("pokemon", pokemon);
        }

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

        const existingSpecies = await db
          .query("species")
          .filter((q) => q.eq(q.field("id"), speciesData.id))
          .first();

        if (existingSpecies) {
          await db.patch(existingSpecies._id, species);
        } else {
          await db.insert("species", species);
        }

        results.push(pokemon);
      } catch (e) {
        console.error(`Failed to sync pokemon ${i}:`, e);
      }
    }

    return { synced: results.length };
  },
});

export const syncTypes = mutation({
  handler: async ({ db }) => {
    const data = await fetchJson(`${POKEAPI_BASE}/type`);

    for (const type of data.results) {
      const typeData = await fetchJson(type.url);

      const existing = await db
        .query("types")
        .filter((q) => q.eq(q.field("name"), typeData.name))
        .first();

      const typeRecord = {
        id: typeData.id,
        name: typeData.name,
        damageRelations: typeData.damage_relations,
      };

      if (existing) {
        await db.patch(existing._id, typeRecord);
      } else {
        await db.insert("types", typeRecord);
      }
    }

    return { synced: data.results.length };
  },
});