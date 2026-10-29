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

/** The stages of a Pokémon's Evolution Chain, or null if it has none synced. */
export const getEvolutions = query({
  args: { pokemon: v.number() },
  handler: async ({ db }, { pokemon: pokedexNumber }) => {
    const pokemon = await db
      .query("pokemon")
      .withIndex("by_pokeapi_id", (q) => q.eq("id", pokedexNumber))
      .unique();
    if (!pokemon) return null;
    const species = await db
      .query("species")
      .withIndex("by_pokeapi_id", (q) => q.eq("id", pokemon.speciesId))
      .unique();
    if (species?.evolutionChainId === undefined) return null;
    const chainId = species.evolutionChainId;
    const chain = await db
      .query("evolutionChain")
      .withIndex("by_pokeapi_id", (q) => q.eq("id", chainId))
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
