import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const upsertPokedexRecord = mutation({
  args: {
    userId: v.id("users"),
    gameId: v.string(),
    generationId: v.optional(v.number()),
    caughtIds: v.optional(v.array(v.number())),
    seenIds: v.optional(v.array(v.number())),
    shinyCaughtIds: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pokedexRecords")
      .withIndex("by_user_and_game", (q) =>
        q.eq("userId", args.userId).eq("gameId", args.gameId),
      )
      .first();

    const patch: Record<string, unknown> = {};
    if (args.generationId !== undefined) patch.generationId = args.generationId;
    if (args.caughtIds !== undefined) patch.caughtIds = args.caughtIds;
    if (args.seenIds !== undefined) patch.seenIds = args.seenIds;
    if (args.shinyCaughtIds !== undefined) patch.shinyCaughtIds = args.shinyCaughtIds;

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    return await ctx.db.insert("pokedexRecords", {
      userId: args.userId,
      gameId: args.gameId,
      generationId: args.generationId,
      caughtIds: args.caughtIds ?? [],
      seenIds: args.seenIds ?? [],
      shinyCaughtIds: args.shinyCaughtIds ?? [],
    });
  },
});

export const listPokedexRecords = query({
  args: {
    userId: v.id("users"),
    gameId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.gameId) {
      const gameId: string = args.gameId;
      return await ctx.db
        .query("pokedexRecords")
        .withIndex("by_user_and_game", (q) =>
          q.eq("userId", args.userId).eq("gameId", gameId),
        )
        .first();
    }

    return await ctx.db
      .query("pokedexRecords")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getPokedexSummary = query({
  args: {
    userId: v.id("users"),
    gameId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const records = args.gameId
      ? [await ctx.db
          .query("pokedexRecords")
          .withIndex("by_user_and_game", (q) =>
            q.eq("userId", args.userId).eq("gameId", args.gameId!),
          )
          .first()]
      : await ctx.db
          .query("pokedexRecords")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .collect();

    return records
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .map((record) => ({
        gameId: record.gameId,
        generationId: record.generationId,
        caughtCount: record.caughtIds?.length ?? 0,
        seenCount: record.seenIds?.length ?? 0,
        shinyCaughtCount: record.shinyCaughtIds?.length ?? 0,
      }));
  },
});
