/**
 * Records real PokeAPI responses used by the Sync tests.
 *
 *   bun run record-fixtures
 *
 * Files are written to test/fixtures/pokeapi/<path>.json, where <path> is the
 * PokeAPI path with "?" replaced by "__" (see test/pokeapi-fixtures.ts).
 *
 * Responses are real, but large keys the Sync never reads (move lists, game
 * indices, flavor text, sprite variants) are dropped to keep fixtures small.
 * If the Sync starts reading one of these, remove it from UNREAD_KEYS and
 * re-record.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const POKEAPI = "https://pokeapi.co/api/v2";
const OUT = join(import.meta.dirname, "..", "test", "fixtures", "pokeapi");

/** Pokédex numbers covering linear, baby, and branching chains plus Generation IX. */
const POKEDEX_NUMBERS = [1, 2, 3, 25, 26, 172, 133, 134, 135, 136, 1025];
const TYPE_LIST = "type?limit=100";

const UNREAD_KEYS = new Set([
  "moves",
  "game_indices",
  "held_items",
  "past_abilities",
  "past_stats",
  "past_types",
  "past_damage_relations",
  "cries",
  "flavor_text_entries",
  "genera",
  "names",
  "pokedex_numbers",
  "form_descriptions",
  "versions",
  "showdown",
  "dream_world",
  "home",
]);

function dropUnreadKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(dropUnreadKeys);
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !UNREAD_KEYS.has(key))
      .map(([key, v]) => [key, dropUnreadKeys(v)]),
  );
}

function fixtureFile(path: string): string {
  return join(OUT, `${path.replace("?", "__")}.json`);
}

async function record(path: string): Promise<unknown> {
  const res = await fetch(`${POKEAPI}/${path}`);
  if (!res.ok) throw new Error(`GET ${path}: ${res.status}`);
  const json = dropUnreadKeys(await res.json());
  const file = fixtureFile(path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(json, null, 2)}\n`);
  console.log(`recorded ${path}`);
  return json;
}

function idFromUrl(url: string): number {
  const match = /\/(\d+)\/?$/.exec(url);
  if (!match?.[1]) throw new Error(`No id in ${url}`);
  return Number(match[1]);
}

interface NamedResource {
  url: string;
}

const chainIds = new Set<number>();
for (const n of POKEDEX_NUMBERS) {
  await record(`pokemon/${n}`);
  const species = (await record(`pokemon-species/${n}`)) as {
    evolution_chain: NamedResource | null;
  };
  if (species.evolution_chain) chainIds.add(idFromUrl(species.evolution_chain.url));
}
for (const id of chainIds) await record(`evolution-chain/${id}`);

const types = (await record(TYPE_LIST)) as { results: NamedResource[] };
for (const type of types.results) await record(`type/${idFromUrl(type.url)}`);
