import { describe, expect, it } from "vitest";
import { filterPokedex, type PokedexEntry } from "@/lib/pokedex";

const entry = (id: number, name: string, types: string[], generation?: number): PokedexEntry => ({
  id,
  name,
  types,
  image: `https://img/${id}.png`,
  generation,
});

const POKEDEX: PokedexEntry[] = [
  entry(1, "bulbasaur", ["grass", "poison"], 1),
  entry(4, "charmander", ["fire"], 1),
  entry(25, "pikachu", ["electric"], 1),
  entry(250, "ho-oh", ["fire", "flying"], 2),
  entry(255, "torchic", ["fire"], 3),
  entry(1007, "koraidon", ["fighting", "dragon"], 9),
  entry(1025, "pecharunt", ["poison", "ghost"], 9),
];

const ids = (entries: PokedexEntry[]): number[] => entries.map((e) => e.id);

describe("filterPokedex", () => {
  it("returns every entry when no filters are set", () => {
    expect(ids(filterPokedex(POKEDEX, {}))).toEqual([1, 4, 25, 250, 255, 1007, 1025]);
  });

  it("treats blank search as no search", () => {
    expect(filterPokedex(POKEDEX, { q: "   " })).toHaveLength(POKEDEX.length);
  });

  it("searches by case-insensitive name substring", () => {
    expect(ids(filterPokedex(POKEDEX, { q: "CHARM" }))).toEqual([4]);
    expect(ids(filterPokedex(POKEDEX, { q: "ho-" }))).toEqual([250]);
  });

  it.each(["25", "025", "#25", "#025"])("finds Pikachu by Pokédex number %s", (q) => {
    expect(ids(filterPokedex(POKEDEX, { q }))).toEqual([25]);
  });

  it("matches Pokédex numbers exactly, not as substrings", () => {
    expect(ids(filterPokedex(POKEDEX, { q: "1" }))).toEqual([1]);
  });

  it("filters by Type", () => {
    expect(ids(filterPokedex(POKEDEX, { type: "fire" }))).toEqual([4, 250, 255]);
  });

  it("filters by Generation, including Pokédex numbers above 1000", () => {
    expect(ids(filterPokedex(POKEDEX, { gen: 9 }))).toEqual([1007, 1025]);
  });

  it("combines filters with AND", () => {
    expect(ids(filterPokedex(POKEDEX, { type: "fire", gen: 1 }))).toEqual([4]);
    expect(ids(filterPokedex(POKEDEX, { q: "pe", type: "poison", gen: 9 }))).toEqual([1025]);
    expect(filterPokedex(POKEDEX, { q: "pikachu", type: "fire" })).toEqual([]);
  });
});
