/**
 * Sync module: copies Pokémon, Species, Evolution Chain, and Type data from
 * PokeAPI into SimpleDex. Internal only; run with
 *
 *   bunx convex run sync:run '{"gens":[1]}'
 *
 * See plans/pokemon-sync.md.
 */
import { v, type Infer } from "convex/values";
import { z } from "zod";
import { internal } from "./_generated/api";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { GENERATIONS, MAX_POKEDEX_NUMBER } from "./generations";
import {
  damageRelationsValidator,
  evolutionStageValidator,
  pokemonFields,
  speciesFields,
} from "./schema";

const BATCH_SIZE = 50;
const POKEAPI = "https://pokeapi.co/api/v2";

// ─── Interface ──────────────────────────────────────────────────────────────

export const run = internalAction({
  args: {
    gens: v.optional(v.array(v.number())),
    numbers: v.optional(v.array(v.number())),
    force: v.optional(v.boolean()),
  },
  handler: async (ctx, { gens, numbers, force = false }) => {
    const selected = selectPokedexNumbers(gens, numbers);
    console.log(`sync: ${selected.length} Pokémon${force ? " (forced)" : ""}`);

    await ctx.runMutation(internal.sync.saveTypes, { types: await fetchTypes() });

    if (selected.length > 0) {
      await ctx.scheduler.runAfter(0, internal.sync.batch, {
        numbers: selected,
        offset: 0,
        force,
        chainsSynced: [],
      });
    } else {
      await ctx.runMutation(internal.sync.pruneEvolutionChains, {});
    }
  },
});

export const clear = internalMutation({
  args: {},
  handler: async (ctx) => {
    let deleted = 0;
    for (const table of ["pokemon", "species", "evolutionChain", "types"] as const) {
      for (const doc of await ctx.db.query(table).collect()) {
        await ctx.db.delete(doc._id);
        deleted++;
      }
    }
    return { deleted };
  },
});

/** Sync progress. Watch it live with `bunx convex run sync:status --watch`. */
export const status = internalQuery({
  args: {},
  handler: async (ctx) => {
    const [pokemon, species, evolutionChains, types] = await Promise.all([
      ctx.db.query("pokemon").collect(),
      ctx.db.query("species").collect(),
      ctx.db.query("evolutionChain").collect(),
      ctx.db.query("types").collect(),
    ]);
    const scheduled = await ctx.db.system.query("_scheduled_functions").collect();
    const running = scheduled.some(
      (job) =>
        job.name.startsWith("sync") &&
        (job.state.kind === "pending" || job.state.kind === "inProgress"),
    );
    const stored = new Set(pokemon.map((p) => p.id));
    let missing = 0;
    for (let n = 1; n <= MAX_POKEDEX_NUMBER; n++) if (!stored.has(n)) missing++;

    return {
      running,
      missing,
      pokemon: pokemon.length,
      species: species.length,
      evolutionChains: evolutionChains.length,
      types: types.length,
    };
  },
});

// ─── Batches ────────────────────────────────────────────────────────────────

export const batch = internalAction({
  args: {
    numbers: v.array(v.number()),
    offset: v.number(),
    force: v.boolean(),
    /** Evolution Chains already synced in this run, so each is fetched once. */
    chainsSynced: v.array(v.number()),
  },
  handler: async (ctx, { numbers, offset, force, chainsSynced }) => {
    const slice = numbers.slice(offset, offset + BATCH_SIZE);
    const stored = new Set(await ctx.runQuery(internal.sync.storedPokemon, { numbers: slice }));
    const chainsDone = new Set(chainsSynced);
    const tally = { synced: 0, skipped: 0, failed: 0 };

    for (const n of slice) {
      if (!force && stored.has(n)) {
        tally.skipped++;
        continue;
      }
      try {
        const pokemon = toPokemon(pokemonJson.parse(await getJson(`pokemon/${n}`)));
        const species = toSpecies(speciesJson.parse(await getJson(`pokemon-species/${n}`)));

        const chainId = species.evolutionChainId;
        if (chainId !== undefined && !chainsDone.has(chainId)) {
          const isStored = await ctx.runQuery(internal.sync.isChainStored, { id: chainId });
          if (force || !isStored) {
            const chain = evolutionChainJson.parse(await getJson(`evolution-chain/${chainId}`));
            await ctx.runMutation(internal.sync.saveEvolutionChain, {
              id: chainId,
              stages: toStages(chain.chain),
            });
          }
          chainsDone.add(chainId);
        }

        await ctx.runMutation(internal.sync.savePokemon, { pokemon, species });
        tally.synced++;
      } catch (e) {
        console.error(`sync: #${n} failed: ${e instanceof Error ? e.message : String(e)}`);
        tally.failed++;
      }
    }

    const last = slice[slice.length - 1];
    console.log(
      `sync: batch ${slice[0]}–${last} synced ${tally.synced}, skipped ${tally.skipped}, failed ${tally.failed}`,
    );

    if (offset + BATCH_SIZE < numbers.length) {
      await ctx.scheduler.runAfter(0, internal.sync.batch, {
        numbers,
        offset: offset + BATCH_SIZE,
        force,
        chainsSynced: [...chainsDone],
      });
    } else {
      await ctx.runMutation(internal.sync.pruneEvolutionChains, {});
    }
  },
});

function selectPokedexNumbers(gens?: number[], numbers?: number[]): number[] {
  if (!gens && !numbers) gens = GENERATIONS.map((g) => g.number);
  const selected = new Set(numbers ?? []);
  for (const g of GENERATIONS) {
    if (!gens?.includes(g.number)) continue;
    for (let n = g.first; n <= g.last; n++) selected.add(n);
  }
  return [...selected]
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= MAX_POKEDEX_NUMBER)
    .sort((a, b) => a - b);
}

// ─── Storage ────────────────────────────────────────────────────────────────

export const storedPokemon = internalQuery({
  args: { numbers: v.array(v.number()) },
  handler: async (ctx, { numbers }) => {
    const stored: number[] = [];
    for (const id of numbers) {
      const doc = await ctx.db
        .query("pokemon")
        .withIndex("by_pokeapi_id", (q) => q.eq("id", id))
        .unique();
      if (doc) stored.push(id);
    }
    return stored;
  },
});

export const isChainStored = internalQuery({
  args: { id: v.number() },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db
      .query("evolutionChain")
      .withIndex("by_pokeapi_id", (q) => q.eq("id", id))
      .unique();
    return doc !== null;
  },
});

export const savePokemon = internalMutation({
  args: { pokemon: v.object(pokemonFields), species: v.object(speciesFields) },
  handler: async (ctx, { pokemon, species }) => {
    // replace, never patch, so a forced Sync drops stale fields.
    const existingPokemon = await ctx.db
      .query("pokemon")
      .withIndex("by_pokeapi_id", (q) => q.eq("id", pokemon.id))
      .unique();
    if (existingPokemon) await ctx.db.replace(existingPokemon._id, pokemon);
    else await ctx.db.insert("pokemon", pokemon);

    const existingSpecies = await ctx.db
      .query("species")
      .withIndex("by_pokeapi_id", (q) => q.eq("id", species.id))
      .unique();
    if (existingSpecies) await ctx.db.replace(existingSpecies._id, species);
    else await ctx.db.insert("species", species);
  },
});

export const saveEvolutionChain = internalMutation({
  args: { id: v.number(), stages: v.array(evolutionStageValidator) },
  handler: async (ctx, chain) => {
    const existing = await ctx.db
      .query("evolutionChain")
      .withIndex("by_pokeapi_id", (q) => q.eq("id", chain.id))
      .unique();
    if (existing) await ctx.db.replace(existing._id, chain);
    else await ctx.db.insert("evolutionChain", chain);
  },
});

/** Deletes Evolution Chains that no stored Species references. Runs at the end of a Sync. */
export const pruneEvolutionChains = internalMutation({
  args: {},
  handler: async (ctx) => {
    const referenced = new Set<number>();
    for (const species of await ctx.db.query("species").collect()) {
      if (species.evolutionChainId !== undefined) referenced.add(species.evolutionChainId);
    }
    let deleted = 0;
    for (const chain of await ctx.db.query("evolutionChain").collect()) {
      if (!referenced.has(chain.id)) {
        await ctx.db.delete(chain._id);
        deleted++;
      }
    }
    if (deleted > 0) console.log(`sync: removed ${deleted} unreferenced Evolution Chains`);
  },
});

const typeValidator = v.object({
  id: v.number(),
  name: v.string(),
  damageRelations: damageRelationsValidator,
});

/** Replaces the whole Types table: `types` is every Type that has Pokémon. */
export const saveTypes = internalMutation({
  args: { types: v.array(typeValidator) },
  handler: async (ctx, { types }) => {
    const synced = new Set(types.map((type) => type.id));
    for (const stale of await ctx.db.query("types").collect()) {
      if (!synced.has(stale.id)) await ctx.db.delete(stale._id);
    }
    for (const type of types) {
      const existing = await ctx.db
        .query("types")
        .withIndex("by_pokeapi_id", (q) => q.eq("id", type.id))
        .unique();
      if (existing) await ctx.db.replace(existing._id, type);
      else await ctx.db.insert("types", type);
    }
  },
});

// ─── PokeAPI access ─────────────────────────────────────────────────────────

async function getJson(path: string): Promise<unknown> {
  const res = await fetch(`${POKEAPI}/${path}`);
  if (!res.ok) throw new Error(`PokeAPI ${path}: ${res.status}`);
  const json: unknown = await res.json();
  const delay = Number(process.env.SYNC_REQUEST_DELAY_MS ?? 100);
  if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
  return json;
}

async function fetchTypes(): Promise<Infer<typeof typeValidator>[]> {
  const list = typeListJson.parse(await getJson("type?limit=100"));
  const types: Infer<typeof typeValidator>[] = [];
  for (const { url } of list.results) {
    const type = typeJson.parse(await getJson(`type/${idFromUrl(url)}`));
    // Skip Types no Pokémon has (e.g. "unknown", "shadow", "stellar").
    if (type.pokemon.length > 0) types.push(toType(type));
  }
  return types;
}

// ─── Mapping: PokeAPI JSON → SimpleDex documents ────────────────────────────

const named = z.object({ name: z.string(), url: z.string() });

const pokemonJson = z.object({
  id: z.number(),
  name: z.string(),
  height: z.number(),
  weight: z.number(),
  species: named,
  types: z.array(z.object({ slot: z.number(), type: named })),
  sprites: z.object({
    front_default: z.string().nullish(),
    other: z
      .object({ "official-artwork": z.object({ front_default: z.string().nullish() }).nullish() })
      .nullish(),
  }),
  stats: z.array(z.object({ base_stat: z.number(), stat: named })),
  abilities: z.array(z.object({ slot: z.number(), is_hidden: z.boolean(), ability: named })),
});

const speciesJson = z.object({
  id: z.number(),
  name: z.string(),
  evolution_chain: z.object({ url: z.string() }).nullish(),
  habitat: named.nullish(),
  color: named.nullish(),
});

const evolutionDetailJson = z.object({
  trigger: named,
  min_level: z.number().nullish(),
  min_happiness: z.number().nullish(),
  item: named.nullish(),
  held_item: named.nullish(),
  known_move_type: named.nullish(),
  location: named.nullish(),
  time_of_day: z.string().nullish(),
});

const chainLinkJson = z.object({
  species: named,
  evolution_details: z.array(evolutionDetailJson),
  get evolves_to() {
    return z.array(chainLinkJson);
  },
});

const evolutionChainJson = z.object({ chain: chainLinkJson });

const typeListJson = z.object({ results: z.array(named) });

const typeJson = z.object({
  id: z.number(),
  name: z.string(),
  pokemon: z.array(z.unknown()),
  damage_relations: z.object({
    double_damage_from: z.array(named),
    double_damage_to: z.array(named),
    half_damage_from: z.array(named),
    half_damage_to: z.array(named),
    no_damage_from: z.array(named),
    no_damage_to: z.array(named),
  }),
});

function idFromUrl(url: string): number {
  const match = /\/(\d+)\/?$/.exec(url);
  if (!match?.[1]) throw new Error(`No id in PokeAPI URL ${url}`);
  return Number(match[1]);
}

const spriteUrl = (pokedexNumber: number): string =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokedexNumber}.png`;

function toPokemon(json: z.infer<typeof pokemonJson>): Infer<typeof pokemonDoc> {
  const artwork = json.sprites.other?.["official-artwork"]?.front_default ?? undefined;
  return {
    id: json.id,
    name: json.name,
    types: [...json.types].sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
    sprite: json.sprites.front_default ?? spriteUrl(json.id),
    ...(artwork ? { artwork } : {}),
    height: json.height / 10,
    weight: json.weight / 10,
    stats: json.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
    abilities: [...json.abilities]
      .sort((a, b) => a.slot - b.slot)
      .map((a) => ({ name: a.ability.name, isHidden: a.is_hidden })),
    speciesId: idFromUrl(json.species.url),
  };
}
const pokemonDoc = v.object(pokemonFields);

function toSpecies(json: z.infer<typeof speciesJson>): Infer<typeof speciesDoc> {
  return {
    id: json.id,
    name: json.name,
    ...(json.evolution_chain ? { evolutionChainId: idFromUrl(json.evolution_chain.url) } : {}),
    ...(json.habitat ? { habitat: json.habitat.name } : {}),
    ...(json.color ? { color: json.color.name } : {}),
  };
}
const speciesDoc = v.object(speciesFields);

type EvolutionStage = Infer<typeof evolutionStageValidator>;

/** Flattens the chain tree depth-first; each stage points at the stage it evolves `from`. */
function toStages(link: z.infer<typeof chainLinkJson>, from?: number): EvolutionStage[] {
  const id = idFromUrl(link.species.url);
  const method = from === undefined ? undefined : evolutionMethod(link.evolution_details[0]);
  const stage: EvolutionStage = {
    id,
    name: link.species.name,
    sprite: spriteUrl(id),
    ...(from === undefined ? {} : { from }),
    ...(method ? { method } : {}),
  };
  return [stage, ...link.evolves_to.flatMap((next) => toStages(next, id))];
}

const titleCase = (slug: string): string =>
  slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

function evolutionMethod(detail?: z.infer<typeof evolutionDetailJson>): string | undefined {
  if (!detail) return undefined;
  const time = detail.time_of_day ? ` (${detail.time_of_day})` : "";
  switch (detail.trigger.name) {
    case "level-up":
      if (detail.min_level) return `Level ${detail.min_level}${time}`;
      if (detail.min_happiness) return `High friendship${time}`;
      if (detail.known_move_type)
        return `Level up knowing a ${titleCase(detail.known_move_type.name)} move${time}`;
      if (detail.location) return `Level up at ${titleCase(detail.location.name)}${time}`;
      return `Level up${time}`;
    case "use-item":
      return detail.item ? `Use ${titleCase(detail.item.name)}` : "Use item";
    case "trade":
      return detail.held_item ? `Trade holding ${titleCase(detail.held_item.name)}` : "Trade";
    default:
      return titleCase(detail.trigger.name);
  }
}

function toType(json: z.infer<typeof typeJson>): Infer<typeof typeValidator> {
  const names = (list: { name: string }[]): string[] => list.map((t) => t.name);
  const r = json.damage_relations;
  return {
    id: json.id,
    name: json.name,
    damageRelations: {
      doubleDamageFrom: names(r.double_damage_from),
      doubleDamageTo: names(r.double_damage_to),
      halfDamageFrom: names(r.half_damage_from),
      halfDamageTo: names(r.half_damage_to),
      noDamageFrom: names(r.no_damage_from),
      noDamageTo: names(r.no_damage_to),
    },
  };
}
