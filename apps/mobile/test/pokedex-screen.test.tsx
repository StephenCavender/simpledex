import type { PokedexEntry } from "@simpledex/pokedex";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { useQuery } from "convex/react";

import PokedexScreen from "@/app/index";

jest.mock("convex/react", () => ({ useQuery: jest.fn() }));

// The native header search bar renders nothing in Jest; stand in a text input
// that reports changes the way the native one does.
jest.mock("expo-router", () => {
  const { TextInput } = jest.requireActual<typeof import("react-native")>("react-native");
  return {
    Stack: {
      SearchBar: ({
        placeholder,
        onChangeText,
      }: {
        placeholder: string;
        onChangeText: (event: { nativeEvent: { text: string } }) => void;
      }) => (
        <TextInput
          placeholder={placeholder}
          onChangeText={(text) => onChangeText({ nativeEvent: { text } })}
        />
      ),
    },
  };
});

const mockUseQuery = jest.mocked(useQuery);

const POKEDEX: PokedexEntry[] = [
  {
    id: 1,
    name: "bulbasaur",
    types: ["grass", "poison"],
    image: "https://example.com/1.png",
    generation: 1,
  },
  { id: 4, name: "charmander", types: ["fire"], image: "https://example.com/4.png", generation: 1 },
  {
    id: 25,
    name: "pikachu",
    types: ["electric"],
    image: "https://example.com/25.png",
    generation: 1,
  },
];

async function search(text: string): Promise<void> {
  await fireEvent.changeText(screen.getByPlaceholderText("Search by name or number"), text);
}

describe("PokedexScreen", () => {
  // FlashList reports its first layout on a timer; fake timers keep that out of act().
  beforeAll(() => jest.useFakeTimers());
  afterAll(() => jest.useRealTimers());

  beforeEach(() => {
    mockUseQuery.mockReturnValue(POKEDEX);
  });

  it("shows each Pokédex entry's number, name, Types, and artwork", async () => {
    await render(<PokedexScreen />);

    expect(screen.getByText("#001")).toBeOnTheScreen();
    expect(screen.getByText("bulbasaur")).toBeOnTheScreen();
    expect(screen.getByText("grass")).toBeOnTheScreen();
    expect(screen.getByText("poison")).toBeOnTheScreen();
    expect(screen.getByText("#025")).toBeOnTheScreen();
    expect(screen.getByText("pikachu")).toBeOnTheScreen();
    expect(screen.getByLabelText("charmander")).toBeOnTheScreen();
  });

  it("searches by name", async () => {
    await render(<PokedexScreen />);

    await search("char");

    expect(screen.getByText("charmander")).toBeOnTheScreen();
    expect(screen.queryByText("bulbasaur")).not.toBeOnTheScreen();
    expect(screen.queryByText("pikachu")).not.toBeOnTheScreen();
  });

  it.each(["25", "025", "#25"])("searches by Pokédex number %s", async (q) => {
    await render(<PokedexScreen />);

    await search(q);

    expect(screen.getByText("pikachu")).toBeOnTheScreen();
    expect(screen.queryByText("bulbasaur")).not.toBeOnTheScreen();
    expect(screen.queryByText("charmander")).not.toBeOnTheScreen();
  });

  it("says so when nothing matches the search", async () => {
    await render(<PokedexScreen />);

    await search("missingno");

    expect(screen.getByText("No Pokémon found")).toBeOnTheScreen();
  });

  it("shows a loading message while the query is loading", async () => {
    mockUseQuery.mockReturnValue(undefined);

    await render(<PokedexScreen />);

    expect(screen.getByText("Loading…")).toBeOnTheScreen();
  });
});
