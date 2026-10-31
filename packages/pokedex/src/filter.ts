import type { api } from "@simpledex/backend/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";

/** The at-a-glance view of a Pokémon used for browsing. */
export type PokedexEntry = FunctionReturnType<typeof api.pokemon.pokedex>[number];

export interface PokedexFilters {
  /** Name substring or Pokédex number (`25`, `025`, `#25`). */
  q?: string;
  type?: string;
  gen?: number;
}

const POKEDEX_NUMBER = /^#?(\d+)$/;

function matchesSearch(entry: PokedexEntry, q: string): boolean {
  const number = POKEDEX_NUMBER.exec(q);
  if (number?.[1]) return entry.id === Number(number[1]);
  return entry.name.includes(q.toLowerCase());
}

export function filterPokedex(entries: PokedexEntry[], filters: PokedexFilters): PokedexEntry[] {
  const q = filters.q?.trim();
  return entries.filter(
    (entry) =>
      (!q || matchesSearch(entry, q)) &&
      (!filters.type || entry.types.includes(filters.type)) &&
      (!filters.gen || entry.generation === filters.gen),
  );
}
