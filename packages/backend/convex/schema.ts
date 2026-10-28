import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const typeNames = v.array(v.string());

export const damageRelationsValidator = v.object({
  doubleDamageFrom: typeNames,
  doubleDamageTo: typeNames,
  halfDamageFrom: typeNames,
  halfDamageTo: typeNames,
  noDamageFrom: typeNames,
  noDamageTo: typeNames,
});

export const evolutionStageValidator = v.object({
  /** Pokédex number of this stage. */
  id: v.number(),
  name: v.string(),
  sprite: v.string(),
  /** Pokédex number of the stage this one evolves from. */
  from: v.optional(v.number()),
  method: v.optional(v.string()),
});

export const pokemonFields = {
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
};

export const speciesFields = {
  id: v.number(),
  name: v.string(),
  evolutionChainId: v.optional(v.number()),
  habitat: v.optional(v.string()),
  color: v.optional(v.string()),
};

export default defineSchema({
  pokemon: defineTable(pokemonFields).index("by_pokeapi_id", ["id"]),

  species: defineTable(speciesFields).index("by_pokeapi_id", ["id"]),

  evolutionChain: defineTable({
    id: v.number(),
    stages: v.array(evolutionStageValidator),
  }).index("by_pokeapi_id", ["id"]),

  types: defineTable({
    id: v.number(),
    name: v.string(),
    damageRelations: damageRelationsValidator,
  }).index("by_pokeapi_id", ["id"]),
});
