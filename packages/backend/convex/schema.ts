import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  }).index("by_email", ["email"]),

  favorites: defineTable({
    userId: v.id("users"),
    pokemonId: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_pokemon", ["userId", "pokemonId"]),

  pokedexRecords: defineTable({
    userId: v.id("users"),
    gameId: v.string(),
    generationId: v.optional(v.number()),
    caughtIds: v.optional(v.array(v.number())),
    seenIds: v.optional(v.array(v.number())),
    shinyCaughtIds: v.optional(v.array(v.number())),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_game", ["userId", "gameId"]),

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
