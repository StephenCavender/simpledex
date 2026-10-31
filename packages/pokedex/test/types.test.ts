import { describe, expect, it } from "vitest";
import { isPokemonType, POKEMON_TYPES } from "../src";

describe("POKEMON_TYPES", () => {
  it("covers all 18 Types", () => {
    expect(POKEMON_TYPES).toHaveLength(18);
    expect(new Set(POKEMON_TYPES).size).toBe(18);
  });
});

describe("isPokemonType", () => {
  it("accepts known Types and rejects anything else", () => {
    expect(isPokemonType("fire")).toBe(true);
    expect(isPokemonType("stellar")).toBe(false);
    expect(isPokemonType("Fire")).toBe(false);
  });
});
