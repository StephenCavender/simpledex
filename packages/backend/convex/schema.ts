import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  pokemon: defineTable({
    id: v.number(),
    name: v.string(),
    types: v.array(v.string()),
    sprite: v.string(),
    artwork: v.optional(v.string()),
    height: v.number(),
    weight: v.number(),
    stats: v.array(
      v.object({
        name: v.string(),
        value: v.number(),
      }),
    ),
    abilities: v.array(
      v.object({
        name: v.string(),
        isHidden: v.boolean(),
      }),
    ),
    speciesId: v.number(),
    generationId: v.optional(v.number()),
  })
    .index("by_name", ["name"])
    .index("by_speciesId", ["speciesId"])
    .index("by_type", ["types"])
    .index("by_generationId", ["generationId"]),

  species: defineTable({
    id: v.number(),
    name: v.string(),
    evolutionChainId: v.optional(v.number()),
    generation: v.optional(v.string()),
    habitat: v.optional(v.string()),
    color: v.optional(v.string()),
    evolvesFrom: v.optional(v.number()),
  })
    .index("by_name", ["name"])
    .index("by_evolutionChainId", ["evolutionChainId"]),

  evolutionChain: defineTable({
    id: v.number(),
    chain: v.any(),
  }),

  types: defineTable({
    id: v.number(),
    name: v.string(),
    damageRelations: v.any(),
  }).index("by_name", ["name"]),
});
