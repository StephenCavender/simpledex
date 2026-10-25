import { describe, expect, it } from "vitest";
import {
  GENERATIONS,
  MAX_POKEDEX_NUMBER,
  generationOf,
} from "@simpledex/backend/convex/generations";

describe("generationOf", () => {
  it.each([
    [1, 1],
    [151, 1],
    [152, 2],
    [493, 4],
    [906, 9],
    [1025, 9],
  ])("puts Pokédex number %i in Generation %i", (pokedexNumber, generation) => {
    expect(generationOf(pokedexNumber)).toBe(generation);
  });

  it.each([0, -1, 1026, 1.5])("has no Generation for %s", (pokedexNumber) => {
    expect(generationOf(pokedexNumber)).toBeUndefined();
  });
});

describe("GENERATIONS", () => {
  it("covers every Pokédex number from 1 to MAX_POKEDEX_NUMBER without gaps", () => {
    expect(GENERATIONS[0]?.first).toBe(1);
    expect(MAX_POKEDEX_NUMBER).toBe(1025);
    GENERATIONS.forEach((generation, index) => {
      expect(generation.number).toBe(index + 1);
      const next = GENERATIONS[index + 1];
      if (next) expect(next.first).toBe(generation.last + 1);
    });
  });
});
