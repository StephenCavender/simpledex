import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const addFavorite = mutation({
  args: {
    userId: v.id("users"),
    pokemonId: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_pokemon", (q) =>
        q.eq("userId", args.userId).eq("pokemonId", args.pokemonId),
      )
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("favorites", {
      userId: args.userId,
      pokemonId: args.pokemonId,
    });
  },
});

export const removeFavorite = mutation({
  args: {
    userId: v.id("users"),
    pokemonId: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_pokemon", (q) =>
        q.eq("userId", args.userId).eq("pokemonId", args.pokemonId),
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return true;
    }

    return false;
  },
});

export const listFavorites = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const isFavorite = query({
  args: {
    userId: v.id("users"),
    pokemonId: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_pokemon", (q) =>
        q.eq("userId", args.userId).eq("pokemonId", args.pokemonId),
      )
      .first();

    return existing !== null;
  },
});
