import { render, screen, within } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { Evolutions, evolutionLinks, type EvolutionStage } from "@/components/evolutions";

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
});

async function renderEvolutions(stages: EvolutionStage[], pokedexNumber: number): Promise<void> {
  const router = createRouter({
    routeTree: createRootRoute({
      component: () => <Evolutions stages={stages} pokedexNumber={pokedexNumber} />,
    }),
    history: createMemoryHistory(),
  });
  render(<RouterProvider router={router} />);
  await screen.findByText(/Evolution chain|Does not evolve/);
}

describe("Evolutions", () => {
  it("shows what a Pokémon evolves from and into, with methods", async () => {
    await renderEvolutions(ODDISH, 44);

    const from = screen.getByRole("region", { name: "Evolves from" });
    expect(within(from).getByText("oddish")).toBeTruthy();
    expect(within(from).getByText("Level 21")).toBeTruthy();
    const into = screen.getByRole("region", { name: "Evolves into" });
    expect(within(into).getByText("vileplume")).toBeTruthy();
    expect(within(into).getByText("Use Sun Stone")).toBeTruthy();
  });

  it("says so when a Pokémon is a first or final stage", async () => {
    await renderEvolutions(PICHU, 26);

    expect(screen.getByText("Nothing: this is a final stage.")).toBeTruthy();
  });

  it("names every Pokémon in the Evolution Chain, without hover", async () => {
    await renderEvolutions(EEVEE, 133);

    const chain = screen.getByRole("region", { name: "Evolution chain" });
    for (const s of EEVEE) expect(within(chain).getByText(s.name)).toBeTruthy();
  });

  it("says a single-stage Pokémon does not evolve", async () => {
    await renderEvolutions(DITTO, 132);

    expect(screen.getByText("Does not evolve.")).toBeTruthy();
    expect(screen.queryByRole("region", { name: "Evolves from" })).toBeNull();
    expect(screen.queryByRole("region", { name: "Evolution chain" })).toBeNull();
  });
});
