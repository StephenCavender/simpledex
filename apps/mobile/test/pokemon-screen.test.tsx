import type { api } from "@simpledex/backend/convex/_generated/api";
import type { EvolutionStage, PokedexEntry } from "@simpledex/pokedex";
import { getFunctionName, type FunctionReference, type FunctionReturnType } from "convex/server";
import { Stack } from "expo-router";
import { fireEvent, renderRouter, screen, testRouter, within } from "expo-router/testing-library";

import PokedexScreen from "@/app/index";
import PokemonScreen from "@/app/pokemon/[id]";
import { useCachedQuery, type CachedQuery } from "@/lib/use-cached-query";

jest.mock("@/lib/use-cached-query", () => ({ useCachedQuery: jest.fn() }));

type Pokemon = NonNullable<FunctionReturnType<typeof api.pokemon.getById>>;
type Species = NonNullable<FunctionReturnType<typeof api.pokemon.getSpecies>>;

const pokemon = (
  id: number,
  name: string,
  types: string[],
  extra: Partial<Pokemon> = {},
): Pokemon => ({
  _id: `pokemon-${id}` as Pokemon["_id"],
  _creationTime: 0,
  id,
  name,
  types,
  sprite: `https://example.com/sprite/${id}.png`,
  artwork: `https://example.com/artwork/${id}.png`,
  height: 0.3,
  weight: 6.5,
  stats: [
    { name: "hp", value: 55 },
    { name: "special-attack", value: 65 },
  ],
  abilities: [
    { name: "run-away", isHidden: false },
    { name: "anticipation", isHidden: true },
  ],
  speciesId: id,
  ...extra,
});

const stage = (id: number, name: string, from?: number, method?: string): EvolutionStage => ({
  id,
  name,
  sprite: `https://example.com/sprite/${id}.png`,
  ...(from === undefined ? {} : { from }),
  ...(method === undefined ? {} : { method }),
});

const EEVEE_CHAIN = [
  stage(133, "eevee"),
  stage(134, "vaporeon", 133, "Use Water Stone"),
  stage(135, "jolteon", 133, "Use Thunder Stone"),
  stage(136, "flareon", 133, "Use Fire Stone"),
];

const POKEMON: Record<number, Pokemon> = {
  133: pokemon(133, "eevee", ["normal"]),
  135: pokemon(135, "jolteon", ["electric"]),
  136: pokemon(136, "flareon", ["fire"]),
  132: pokemon(132, "ditto", ["normal"]),
};

const SPECIES: Record<number, Species> = {
  133: {
    _id: "species-133" as Species["_id"],
    _creationTime: 0,
    id: 133,
    name: "eevee",
    habitat: "urban",
    color: "brown",
  },
};

const EVOLUTIONS: Record<number, EvolutionStage[] | null> = {
  133: EEVEE_CHAIN,
  135: EEVEE_CHAIN,
  136: EEVEE_CHAIN,
  132: [stage(132, "ditto")],
};

const POKEDEX: PokedexEntry[] = Object.values(POKEMON).map((p) => ({
  id: p.id,
  name: p.name,
  types: p.types,
  image: p.artwork ?? p.sprite,
  generation: 1,
}));

/** Nothing cached and offline. */
const OFFLINE = Symbol("offline");

/**
 * Answers each query from the fixtures above; `undefined` means still loading,
 * and `OFFLINE` means it needs a connection.
 */
let answer: (name: string, args: Record<string, number>) => unknown;

function cached(value: unknown): CachedQuery<unknown> {
  if (value === undefined) return { status: "loading" };
  if (value === OFFLINE) return { status: "offline" };
  return { status: "loaded", data: value };
}

function defaultAnswer(name: string, args: Record<string, number>): unknown {
  switch (name) {
    case "pokemon:pokedex":
      return POKEDEX;
    case "pokemon:getById":
      return POKEMON[args.id ?? 0] ?? null;
    case "pokemon:getSpecies":
      return SPECIES[args.id ?? 0] ?? null;
    case "pokemon:getEvolutions":
      return EVOLUTIONS[args.pokemon ?? 0] ?? null;
    default:
      throw new Error(`Unexpected query ${name}`);
  }
}

jest
  .mocked(useCachedQuery)
  .mockImplementation(((query: FunctionReference<"query">, args: Record<string, number> | "skip") =>
    cached(
      args === "skip" ? undefined : answer(getFunctionName(query), args),
    )) as typeof useCachedQuery);

async function renderApp(initialUrl: string): ReturnType<typeof renderRouter> {
  return renderRouter(
    {
      _layout: () => <Stack />,
      index: PokedexScreen,
      "pokemon/[id]": PokemonScreen,
    },
    { initialUrl },
  );
}

/** Types into the header's native search bar, which has no text input in Jest. */
async function search(text: string): Promise<void> {
  const [searchBar] = screen.container.queryAll(
    (instance) => instance.props.placeholder === "Search by name or number",
  );
  if (!searchBar) throw new Error("No search bar");
  await fireEvent(searchBar, "changeText", { nativeEvent: { text } });
}

describe("PokemonScreen", () => {
  // FlashList reports its first layout on a timer; fake timers keep that out of act().
  beforeAll(() => jest.useFakeTimers());
  afterAll(() => jest.useRealTimers());

  beforeEach(() => {
    answer = defaultAnswer;
  });

  it("shows the Pokémon's number, name, artwork, and Types", async () => {
    await renderApp("/pokemon/133");

    expect(screen.getByText("#133")).toBeOnTheScreen();
    expect(screen.getByRole("header", { name: "eevee" })).toBeOnTheScreen();
    expect(screen.getByTestId("pokemon-artwork")).toBeOnTheScreen();
    expect(screen.getByTestId("type-badge-normal")).toBeOnTheScreen();
  });

  it("shows a placeholder when the artwork fails to load", async () => {
    await renderApp("/pokemon/133");

    await fireEvent(
      within(screen.getByTestId("pokemon-artwork")).getByLabelText("eevee"),
      "error",
      { nativeEvent: { error: "404" } },
    );

    expect(
      within(screen.getByTestId("pokemon-artwork")).getByTestId("pokemon-image-placeholder"),
    ).toBeOnTheScreen();
  });

  it("shows size and species information", async () => {
    await renderApp("/pokemon/133");

    expect(screen.getByText("0.3 m")).toBeOnTheScreen();
    expect(screen.getByText("6.5 kg")).toBeOnTheScreen();
    expect(screen.getByText("urban")).toBeOnTheScreen();
    expect(screen.getByText("brown")).toBeOnTheScreen();
  });

  it("doesn't call species information unknown while it's loading", async () => {
    answer = (name, args) =>
      name === "pokemon:getSpecies" ? undefined : defaultAnswer(name, args);

    await renderApp("/pokemon/133");

    expect(screen.queryByText("Unknown")).not.toBeOnTheScreen();
    expect(screen.getAllByText("…")).toHaveLength(2);
  });

  it("says when species information is unknown", async () => {
    await renderApp("/pokemon/135");

    expect(screen.getAllByText("Unknown")).toHaveLength(2);
  });

  it("shows abilities, marking the hidden one", async () => {
    await renderApp("/pokemon/133");

    expect(screen.getByText("run away")).toBeOnTheScreen();
    expect(screen.getByText("anticipation (hidden)")).toBeOnTheScreen();
  });

  it("shows each base stat with its value", async () => {
    await renderApp("/pokemon/133");

    expect(screen.getByLabelText("hp")).toHaveAccessibilityValue({ text: "55" });
    expect(screen.getByLabelText("special attack")).toHaveAccessibilityValue({ text: "65" });
  });

  it("shows a branching Evolution Chain", async () => {
    await renderApp("/pokemon/133");

    const into = screen.getByLabelText("Evolves into");
    expect(within(into).getByText("jolteon")).toBeOnTheScreen();
    expect(within(into).getByText("Use Thunder Stone")).toBeOnTheScreen();
    expect(within(into).getByText("flareon")).toBeOnTheScreen();
    const chain = screen.getByLabelText("Evolution chain");
    for (const s of EEVEE_CHAIN) expect(within(chain).getByText(s.name)).toBeOnTheScreen();
  });

  it("shows what a later stage evolves from", async () => {
    await renderApp("/pokemon/135");

    const from = screen.getByLabelText("Evolves from");
    expect(within(from).getByText("eevee")).toBeOnTheScreen();
    expect(within(from).getByText("Use Thunder Stone")).toBeOnTheScreen();
    expect(screen.getByText("Nothing: this is a final stage.")).toBeOnTheScreen();
  });

  it("opens a Pokémon when its Evolution Chain stage is tapped", async () => {
    const router = await renderApp("/pokemon/133");

    await fireEvent.press(
      within(screen.getByLabelText("Evolution chain")).getByRole("link", { name: "flareon" }),
    );

    expect(router.getPathname()).toBe("/pokemon/136");
    expect(screen.getByRole("header", { name: "flareon" })).toBeOnTheScreen();
  });

  it("marks the current Pokémon in its Evolution Chain", async () => {
    await renderApp("/pokemon/135");

    const chain = screen.getByLabelText("Evolution chain");
    expect(within(chain).getByRole("link", { name: "jolteon" })).toBeSelected();
    expect(within(chain).getByRole("link", { name: "eevee" })).not.toBeSelected();
  });

  it("says a single-stage Pokémon does not evolve", async () => {
    await renderApp("/pokemon/132");

    expect(screen.getByText("Does not evolve.")).toBeOnTheScreen();
    expect(screen.queryByLabelText("Evolution chain")).not.toBeOnTheScreen();
  });

  it("shows a loading message while the Pokémon is loading", async () => {
    answer = () => undefined;

    await renderApp("/pokemon/133");

    expect(screen.getByText("Loading…")).toBeOnTheScreen();
  });

  it("says it needs a connection when the Pokémon isn't cached and it's offline", async () => {
    answer = () => OFFLINE;

    await renderApp("/pokemon/133");

    expect(screen.getByText("SimpleDex needs a connection to load this Pokémon")).toBeOnTheScreen();
    expect(screen.queryByText("Loading…")).not.toBeOnTheScreen();
  });

  it("says when the Evolution Chain needs a connection", async () => {
    answer = (name, args) =>
      name === "pokemon:getEvolutions" ? OFFLINE : defaultAnswer(name, args);

    await renderApp("/pokemon/133");

    expect(screen.getByText("Evolutions need a connection to load")).toBeOnTheScreen();
  });

  it.each(["9999", "pikachu"])("says so when there is no Pokémon %s", async (id) => {
    await renderApp(`/pokemon/${id}`);

    expect(screen.getByText("Pokémon not found")).toBeOnTheScreen();
  });

  it("opens from a tapped Pokédex entry, and goes back to the list as it was", async () => {
    const router = await renderApp("/");

    await search("eon");
    await fireEvent.press(screen.getByRole("button", { name: "Filters" }));
    await fireEvent.press(screen.getByRole("radio", { name: "electric" }));
    await fireEvent.press(screen.getByLabelText("Close filters"));
    const listAsItWas = (): void => {
      expect(screen.getByText("jolteon")).toBeOnTheScreen();
      expect(screen.queryByText("flareon")).not.toBeOnTheScreen();
      expect(screen.queryByText("eevee")).not.toBeOnTheScreen();
    };
    listAsItWas();

    await fireEvent.press(screen.getByRole("link", { name: /jolteon/ }));

    expect(router.getPathname()).toBe("/pokemon/135");
    expect(screen.getByRole("header", { name: "jolteon" })).toBeOnTheScreen();

    await testRouter.back("/");

    listAsItWas();
  });
});
