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
  },
  handler: async ({ db }, { type, search, limit = 20 }) => {
    let results = await db.query("pokemon").take(1000);

    if (type) {
      results = results.filter((p) => p.types.includes(type.toLowerCase()));
    }

    if (search) {
      const s = search.toLowerCase();
      results = results.filter((p) => p.name.includes(s));
    }

    return results.slice(0, limit);
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
    return db.query("types").order("asc").collect();
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

export const ingestEvolutionChain = mutation({
  args: {
    id: v.number(),
    chain: v.any(),
  },
  handler: async ({ db }, { id, chain }) => {
    const existing = await db
      .query("evolutionChain")
      .filter((q) => q.eq(q.field("id"), id))
      .first();

    if (existing) {
      await db.patch(existing._id, { id, chain });
    } else {
      await db.insert("evolutionChain", { id, chain });
    }

    return { success: true };
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

const simplifyEvolutionChain = (chain: any): any => {
  const extractSpeciesId = (url: string): number => {
    const match = url.match(/\/(\d+)\/$/);
    return match ? parseInt(match[1], 10) : 1;
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
