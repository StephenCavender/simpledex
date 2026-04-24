import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    type: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async ({ db }, { type, search, limit = 20 }) => {
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