import { describe, expect, it } from "vitest";
import { evolutionLinks, type EvolutionStage } from "../src";

const sprite = (n: number): string => `https://img/${n}.png`;
const stage = (id: number, name: string, from?: number, method?: string): EvolutionStage => ({
  id,
  name,
  sprite: sprite(id),
  ...(from === undefined ? {} : { from }),
  ...(method === undefined ? {} : { method }),
});

const EEVEE = [
  stage(133, "eevee"),
  stage(134, "vaporeon", 133, "Use Water Stone"),
  stage(135, "jolteon", 133, "Use Thunder Stone"),
  stage(136, "flareon", 133, "Use Fire Stone"),
];
const ODDISH = [
  stage(43, "oddish"),
  stage(44, "gloom", 43, "Level 21"),
  stage(45, "vileplume", 44, "Use Leaf Stone"),
  stage(182, "bellossom", 44, "Use Sun Stone"),
];
const WURMPLE = [
  stage(265, "wurmple"),
  stage(266, "silcoon", 265, "Level 7"),
  stage(267, "beautifly", 266, "Level 10"),
  stage(268, "cascoon", 265, "Level 7"),
  stage(269, "dustox", 268, "Level 10"),
];
const PICHU = [
  stage(172, "pichu"),
  stage(25, "pikachu", 172, "High friendship"),
  stage(26, "raichu", 25, "Use Thunder Stone"),
];
const DITTO = [stage(132, "ditto")];

const names = (links: { stage: EvolutionStage }[]): string[] => links.map((l) => l.stage.name);

describe("evolutionLinks", () => {
  it("gives a first stage every branch it evolves into, with methods", () => {
    const links = evolutionLinks(EEVEE, 133);

    expect(links.from).toBeUndefined();
    expect(links.into.map((l) => [l.stage.name, l.method])).toEqual([
      ["vaporeon", "Use Water Stone"],
      ["jolteon", "Use Thunder Stone"],
      ["flareon", "Use Fire Stone"],
    ]);
  });

  it("gives a branch what it evolves from, and nothing it evolves into", () => {
    const links = evolutionLinks(EEVEE, 135);

    expect(links.from).toEqual({ stage: EEVEE[0], method: "Use Thunder Stone" });
    expect(links.into).toEqual([]);
  });

  it("handles a branch below the first stage", () => {
    const gloom = evolutionLinks(ODDISH, 44);

    expect(gloom.from?.stage.name).toBe("oddish");
    expect(gloom.from?.method).toBe("Level 21");
    expect(names(gloom.into)).toEqual(["vileplume", "bellossom"]);
  });

  it("follows only this Pokémon's path through a chain with two paths", () => {
    const silcoon = evolutionLinks(WURMPLE, 266);

    expect(silcoon.from?.stage.name).toBe("wurmple");
    expect(names(silcoon.into)).toEqual(["beautifly"]);
  });

  it("links a baby to the Pokémon it evolves into", () => {
    expect(names(evolutionLinks(PICHU, 172).into)).toEqual(["pikachu"]);
    expect(evolutionLinks(PICHU, 25).from?.stage.name).toBe("pichu");
  });

  it("returns the whole Evolution Chain", () => {
    expect(evolutionLinks(WURMPLE, 269).chain.map((s) => s.name)).toEqual([
      "wurmple",
      "silcoon",
      "beautifly",
      "cascoon",
      "dustox",
    ]);
  });

  it("gives a single-stage Pokémon nothing to evolve from or into", () => {
    const links = evolutionLinks(DITTO, 132);

    expect(links.from).toBeUndefined();
    expect(links.into).toEqual([]);
  });
});
