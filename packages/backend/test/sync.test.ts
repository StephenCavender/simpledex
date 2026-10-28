import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, internal } from "../convex/_generated/api";
import schema from "../convex/schema";
import { fixtureFetch, type FixtureFetch } from "./pokeapi-fixtures";

const modules = import.meta.glob("../convex/**/*.*s");

let pokeapi: FixtureFetch;

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubEnv("SYNC_REQUEST_DELAY_MS", "0");
  pokeapi = fixtureFetch();
  vi.stubGlobal("fetch", pokeapi.fetch);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

type SyncArgs = { gens?: number[]; numbers?: number[]; force?: boolean };

async function sync(t: ReturnType<typeof convexTest>, args: SyncArgs): Promise<void> {
  await t.action(internal.sync.run, args);
  await t.finishAllScheduledFunctions(vi.runAllTimers);
}

const LINEAR = [1, 2, 3];
const BABY = [172, 25, 26];
const BRANCHING = [133, 134, 135, 136];

describe("sync.run", () => {
  it("syncs Pokédex entries with Generation and image", async () => {
    const t = convexTest(schema, modules);
    await sync(t, { numbers: [25, 1025] });

    expect(await t.query(api.pokemon.pokedex, {})).toEqual([
      {
        id: 25,
        name: "pikachu",
        types: ["electric"],
        image:
          "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
        generation: 1,
      },
      expect.objectContaining({
        id: 1025,
        name: "pecharunt",
        types: ["poison", "ghost"],
        generation: 9,
      }),
    ]);
  });

  it("syncs Pokémon details in metres and kilograms", async () => {
    const t = convexTest(schema, modules);
    await sync(t, { numbers: [25] });

    const pikachu = await t.query(api.pokemon.getById, { id: 25 });
    expect(pikachu).toMatchObject({
      id: 25,
      name: "pikachu",
      height: 0.4,
      weight: 6,
      speciesId: 25,
      sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    });
    expect(pikachu?.stats).toContainEqual({ name: "speed", value: 90 });
    expect(pikachu?.abilities).toEqual([
      { name: "static", isHidden: false },
      { name: "lightning-rod", isHidden: true },
    ]);
  });

  it("syncs Species", async () => {
    const t = convexTest(schema, modules);
    await sync(t, { numbers: [25] });

    expect(await t.query(api.pokemon.getSpecies, { id: 25 })).toMatchObject({
      id: 25,
      name: "pikachu",
      evolutionChainId: 10,
      habitat: "forest",
      color: "yellow",
    });
  });

  describe("Evolution Chains", () => {
    const sprite = (n: number): string =>
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${n}.png`;

    it("stores a linear chain as stages with level methods", async () => {
      const t = convexTest(schema, modules);
      await sync(t, { numbers: LINEAR });

      expect(await t.query(api.pokemon.getEvolutionChain, { id: 1 })).toEqual([
        { id: 1, name: "bulbasaur", sprite: sprite(1) },
        { id: 2, name: "ivysaur", sprite: sprite(2), from: 1, method: "Level 16" },
        { id: 3, name: "venusaur", sprite: sprite(3), from: 2, method: "Level 32" },
      ]);
    });

    it("stores a chain with a baby, friendship, and item methods", async () => {
      const t = convexTest(schema, modules);
      await sync(t, { numbers: BABY });

      expect(await t.query(api.pokemon.getEvolutionChain, { id: 10 })).toEqual([
        { id: 172, name: "pichu", sprite: sprite(172) },
        { id: 25, name: "pikachu", sprite: sprite(25), from: 172, method: "High friendship" },
        { id: 26, name: "raichu", sprite: sprite(26), from: 25, method: "Use Thunder Stone" },
      ]);
    });

    it("stores a branching chain, fetching it once per run", async () => {
      const t = convexTest(schema, modules);
      await sync(t, { numbers: BRANCHING });

      const stages = await t.query(api.pokemon.getEvolutionChain, { id: 67 });
      expect(stages?.map((s) => [s.name, s.from, s.method])).toEqual([
        ["eevee", undefined, undefined],
        ["vaporeon", 133, "Use Water Stone"],
        ["jolteon", 133, "Use Thunder Stone"],
        ["flareon", 133, "Use Fire Stone"],
        ["espeon", 133, "High friendship (day)"],
        ["umbreon", 133, "High friendship (night)"],
        ["leafeon", 133, "Level up at Eterna Forest"],
        ["glaceon", 133, "Level up at Sinnoh Route 217"],
        ["sylveon", 133, "Level up knowing a Fairy move"],
      ]);
      expect(pokeapi.requests.filter((p) => p === "evolution-chain/67")).toHaveLength(1);
    });

    it("has no Evolution Chain before it is synced", async () => {
      const t = convexTest(schema, modules);
      expect(await t.query(api.pokemon.getEvolutionChain, { id: 10 })).toBeNull();
    });

    it("stores a single-stage chain", async () => {
      const t = convexTest(schema, modules);
      await sync(t, { numbers: [1025] });

      const species = await t.query(api.pokemon.getSpecies, { id: 1025 });
      expect(species?.evolutionChainId).toBeDefined();
      expect(
        await t.query(api.pokemon.getEvolutionChain, { id: species?.evolutionChainId ?? 0 }),
      ).toEqual([{ id: 1025, name: "pecharunt", sprite: sprite(1025) }]);
    });
  });

  it("syncs Types that have Pokémon, with typed damage relations", async () => {
    const t = convexTest(schema, modules);
    await sync(t, { numbers: [25] });

    const types = await t.query(api.pokemon.listTypes, {});
    expect(types.map((type) => type.name)).toEqual([
      "normal",
      "fighting",
      "flying",
      "poison",
      "ground",
      "rock",
      "bug",
      "ghost",
      "steel",
      "fire",
      "water",
      "grass",
      "electric",
      "psychic",
      "ice",
      "dragon",
      "dark",
      "fairy",
    ]);
    const fire = types.find((type) => type.name === "fire");
    expect(fire?.damageRelations.doubleDamageTo).toEqual(
      expect.arrayContaining(["grass", "ice", "bug", "steel"]),
    );
    expect(fire?.damageRelations.halfDamageFrom).toContain("fire");
  });

  it("removes stored Types that no Pokémon has", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await ctx.db.insert("types", { id: 19, name: "stellar", damageRelations: {} });
      await ctx.db.insert("types", { id: 10001, name: "unknown", damageRelations: {} });
    });

    await sync(t, { numbers: [25] });

    const names = (await t.query(api.pokemon.listTypes, {})).map((type) => type.name);
    expect(names).not.toContain("stellar");
    expect(names).not.toContain("unknown");
    expect(names).toHaveLength(18);
  });

  it("skips Pokémon already stored unless forced", async () => {
    const t = convexTest(schema, modules);
    await sync(t, { numbers: [25] });
    await t.run(async (ctx) => {
      const doc = await ctx.db
        .query("pokemon")
        .withIndex("by_pokeapi_id", (q) => q.eq("id", 25))
        .unique();
      if (doc) await ctx.db.patch(doc._id, { name: "edited" });
    });

    await sync(t, { numbers: [25] });
    expect((await t.query(api.pokemon.getById, { id: 25 }))?.name).toBe("edited");

    await sync(t, { numbers: [25], force: true });
    expect((await t.query(api.pokemon.getById, { id: 25 }))?.name).toBe("pikachu");
  });

  it("removes stale fields when a forced Sync replaces a document", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await ctx.db.insert("pokemon", {
        id: 1,
        name: "bulbasaur",
        types: ["grass"],
        sprite: "old.png",
        height: 0,
        weight: 0,
        stats: [],
        abilities: [],
        speciesId: 1,
        generationId: 1,
      });
    });

    await sync(t, { numbers: [1], force: true });

    const bulbasaur = await t.query(api.pokemon.getById, { id: 1 });
    expect(bulbasaur).not.toHaveProperty("generationId");
    expect(bulbasaur?.types).toEqual(["grass", "poison"]);
  });

  it("fails only the Pokémon PokeAPI can't serve", async () => {
    const t = convexTest(schema, modules);
    await sync(t, { numbers: [4, 25] }); // #4 is not recorded, so PokeAPI 404s

    expect((await t.query(api.pokemon.pokedex, {})).map((e) => e.id)).toEqual([25]);
  });

  it("selects Pokémon by Generation across scheduled batches", async () => {
    const t = convexTest(schema, modules);
    await sync(t, { gens: [9] }); // 906–1025: three batches; only #1025 is recorded

    expect((await t.query(api.pokemon.pokedex, {})).map((e) => e.id)).toEqual([1025]);
    expect(pokeapi.requests).toContain("pokemon/906");
    expect(pokeapi.requests).toContain("pokemon/1025");
  });

  it("syncs the union of gens and numbers", async () => {
    const t = convexTest(schema, modules);
    await sync(t, { gens: [9], numbers: [25] });

    expect((await t.query(api.pokemon.pokedex, {})).map((e) => e.id)).toEqual([25, 1025]);
  });
});

describe("sync.clear", () => {
  it("wipes synced data", async () => {
    const t = convexTest(schema, modules);
    await sync(t, { numbers: [25] });

    await t.mutation(internal.sync.clear, {});

    expect(await t.query(api.pokemon.pokedex, {})).toEqual([]);
    expect(await t.query(api.pokemon.listTypes, {})).toEqual([]);
  });
});
