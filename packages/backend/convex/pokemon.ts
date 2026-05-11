import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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
    cursor: v.optional(v.string()),
    generation: v.optional(v.number()),
  },
  handler: async ({ db }, { type, search, limit = 50, cursor, generation }) => {
    let results = await db.query("pokemon").take(1000);

    if (generation) {
      const GEN_ID_RANGES: Record<number, { min: number; max: number }> = {
        1: { min: 1, max: 151 },
        2: { min: 152, max: 251 },
        3: { min: 252, max: 386 },
        4: { min: 387, max: 493 },
        5: { min: 494, max: 649 },
        6: { min: 650, max: 721 },
        7: { min: 722, max: 809 },
        8: { min: 810, max: 905 },
        9: { min: 906, max: 1025 },
      };
      const range = GEN_ID_RANGES[generation];
      results = results.filter(
        (p: any) =>
          p.generationId === generation ||
          (range && p.id >= range.min && p.id <= range.max),
      );
    }

    if (type) {
      results = results.filter((p: any) => p.types.includes(type.toLowerCase()));
    }

    if (search) {
      const s = search.toLowerCase();
      results = results.filter((p: any) => p.name.includes(s));
    }

    const startIndex = cursor ? results.findIndex((p: any) => p._id === cursor) + 1 : 0;
    const paginated = results.slice(startIndex, startIndex + limit);
    const nextCursor =
      startIndex + limit < results.length ? paginated[paginated.length - 1]?._id : undefined;

    return {
      pokemon: paginated,
      nextCursor,
    };
  },
});

export const getById = query({
  args: { id: v.number() },
  handler: async ({ db }, { id }) => {
    return db
      .query("pokemon")
      .filter((q) => q.eq(q.field("id"), id))
      .first();
  },
});

export const getByName = query({
  args: { name: v.string() },
  handler: async ({ db }, { name }) => {
    return db
      .query("pokemon")
      .filter((q) => q.eq(q.field("name"), name))
      .first();
  },
});

// Get a species by its id
export const getSpecies = query({
  args: { id: v.number() },
  handler: async ({ db }, { id }) => {
    return db
      .query("species")
      .filter((q) => q.eq(q.field("id"), id))
      .first();
  },
});

// Get an evolution chain by its id and return the chain data
export const getEvolutionChain = query({
  args: { id: v.number() },
  handler: async ({ db }, { id }) => {
    const existing = await db
      .query("evolutionChain" as any)
      .filter((q: any) => q.eq(q.field("id"), id))
      .first();

    return existing?.chain;
  },
});

export const getBySpeciesId = query({
  args: { id: v.number() },
  handler: async ({ db }, { id }) => {
    return db
      .query("pokemon")
      .filter((q) => q.eq(q.field("speciesId"), id))
      .first();
  },
});

export const listTypes = query({
  handler: async ({ db }) => {
    return db.query("types").order("asc").collect();
  },
});

export const listSpecies = query({
  handler: async ({ db }) => {
    return db.query("species").collect();
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
      generationId: v.optional(v.number()),
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
      await db.patch(existing._id, pokemon as any);
    } else {
      await db.insert("pokemon" as any, pokemon);
    }

    const existingSpecies = await db
      .query("species")
      .filter((q) => q.eq(q.field("id"), species.id))
      .first();

    if (existingSpecies) {
      await db.patch(existingSpecies._id, species as any);
    } else {
      await db.insert("species" as any, species);
    }

    return { success: true };
  },
});

export const ingestTypes = mutation({
  args: {
    types: v.array(v.object({ id: v.number(), name: v.string(), damageRelations: v.any() })),
  },
  handler: async ({ db }, { types }) => {
    for (const type of types) {
      const existing = await db
        .query("types" as any)
        .filter((q: any) => q.eq(q.field("id"), type.id))
        .first();

      if (existing) {
        await db.patch(existing._id, { name: type.name, damageRelations: type.damageRelations });
      } else {
        await db.insert("types" as any, type);
      }
    }

    return { synced: types.length };
  },
});

export const ingestEvolutionChain = mutation({
  args: { id: v.number(), chain: v.any() },
  handler: async ({ db }, { id, chain }) => {
    const existing = await db
      .query("evolutionChain" as any)
      .filter((q: any) => q.eq(q.field("id"), id))
      .first();

    if (existing) {
      await db.patch(existing._id, { chain });
    } else {
      await db.insert("evolutionChain" as any, { id, chain });
    }

    return { success: true };
  },
});

export const backfillGenerationIds = mutation({
  handler: async ({ db }) => {
    const GEN_ID_RANGES: Record<number, { min: number; max: number }> = {
      1: { min: 1, max: 151 },
      2: { min: 152, max: 251 },
      3: { min: 252, max: 386 },
      4: { min: 387, max: 493 },
      5: { min: 494, max: 649 },
      6: { min: 650, max: 721 },
      7: { min: 722, max: 809 },
      8: { min: 810, max: 905 },
      9: { min: 906, max: 1025 },
    };

    const genLookup: Record<number, number> = {};
    for (const [gen, range] of Object.entries(GEN_ID_RANGES)) {
      for (let id = range.min; id <= range.max; id++) {
        genLookup[id] = Number(gen);
      }
    }

    const allPokemon = await db.query("pokemon").collect();
    let updated = 0;

    for (const p of allPokemon) {
      if (!p.generationId) {
        const genId = genLookup[p.id as number];
        if (genId) {
          await db.patch(p._id, { generationId: genId });
          updated++;
        }
      }
    }

    return { updated, total: allPokemon.length };
  },
});

export const clearAll = mutation({
  handler: async ({ db }) => {
    const tables = ["pokemon", "species", "evolutionChain", "types"];
    let deleted = 0;
    for (const table of tables) {
      const docs = await db.query(table as any).collect();
      for (const doc of docs) {
        await db.delete(doc._id);
        deleted++;
      }
    }
    return { deleted };
  },
});

export const fetchEvolutionChain = action({
  args: { chainId: v.number() },
  handler: async (ctx, { chainId }) => {
    const runMutation = ctx.runMutation.bind(ctx);
    try {
      const data = await fetchJson(`${POKEAPI_BASE}/evolution-chain/${chainId}`);

      const simplifiedChain = simplifyEvolutionChain(data.chain);

      await runMutation(api.pokemon.ingestEvolutionChain, {
        id: chainId,
        chain: simplifiedChain,
      });

      return { success: true, chain: simplifiedChain };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  },
});

export const syncAllEvolutionChains = action({
  args: {},
  handler: async (ctx) => {
    const species = await ctx.runQuery(api.pokemon.listSpecies);
    const chainIds: number[] = [
      ...new Set(
        species
          .map((s: any) => s.evolutionChainId)
          .filter((id: any) => id != null),
      ),
    ];

    let synced = 0;
    let failed = 0;

    for (const chainId of chainIds) {
      try {
        const data = await fetchJson(`${POKEAPI_BASE}/evolution-chain/${chainId}`);
        const chain = simplifyEvolutionChain(data.chain);
        await ctx.runMutation(api.pokemon.ingestEvolutionChain, {
          id: chainId,
          chain,
        });
        synced++;
      } catch (e) {
        failed++;
      }

      // Be nice to PokeAPI
      await new Promise((r) => setTimeout(r, 500));
    }

    return { synced, failed, total: chainIds.length };
  },
});

const simplifyEvolutionChain = (chain: any): any => {
  const extractSpeciesId = (url: string): number => {
    const match = url.match(/\/(\d+)\/$/);
    return match?.[1] ? parseInt(match[1], 10) : 1;
  };

  const getSprite = (id: number): string =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

  const processChain = (node: any): any => {
    const speciesId = extractSpeciesId(node.species.url);
    const result: any = {
      species: node.species.name,
      id: speciesId,
      sprite: getSprite(speciesId),
      evolvesTo: [],
    };

    for (const ev of node.evolves_to || []) {
      const details = ev.evolution_details?.[0] || {};
      result.evolvesTo.push({
        ...processChain(ev),
        method: details.min_level
          ? `level ${details.min_level}`
          : details.item
            ? `use ${details.item.name}`
            : details.trigger?.name || "trade",
      });
    }

    return result;
  };

  return processChain(chain);
};
