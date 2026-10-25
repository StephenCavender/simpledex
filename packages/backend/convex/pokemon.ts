import { v } from "convex/values";
import { query } from "./_generated/server";
import { generationOf } from "./generations";

/**
 * The whole Pokédex as Pokédex entries, sorted by Pokédex number.
 * Filtering happens on the client; see ADR-0002.
 */
export const pokedex = query({
  args: {},
  handler: async ({ db }) => {
    const all = await db.query("pokemon").withIndex("by_pokeapi_id").collect();
    return all.map((p) => ({
      id: p.id,
      name: p.name,
      types: p.types,
      image: p.artwork ?? p.sprite,
      generation: generationOf(p.id),
    }));
  },
});

export const getById = query({
  args: { id: v.number() },
  handler: async ({ db }, { id }) => {
    return db
      .query("pokemon")
      .withIndex("by_pokeapi_id", (q) => q.eq("id", id))
      .unique();
  },
});

export const getSpecies = query({
  args: { id: v.number() },
  handler: async ({ db }, { id }) => {
    return db
      .query("species")
      .withIndex("by_pokeapi_id", (q) => q.eq("id", id))
      .unique();
  },
});

/** The stages of an Evolution Chain, or null if it hasn't been synced. */
export const getEvolutionChain = query({
  args: { id: v.number() },
  handler: async ({ db }, { id }) => {
    const chain = await db
      .query("evolutionChain")
      .withIndex("by_pokeapi_id", (q) => q.eq("id", id))
      .unique();
    return chain?.stages ?? null;
  },
});

export const listTypes = query({
  args: {},
  handler: async ({ db }) => {
    return db.query("types").withIndex("by_pokeapi_id").collect();
  },
});
