import type { PokedexEntry } from "@simpledex/pokedex";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { useQuery } from "convex/react";

import PokedexScreen from "@/app/index";

jest.mock("convex/react", () => ({ useQuery: jest.fn() }));

// The native header renders nothing in Jest. Render the header's right-hand
// items in place, and stand in a text input for the search bar that reports
// changes and clears the way the native one does.
jest.mock("expo-router", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const { TextInput } = jest.requireActual<typeof import("react-native")>("react-native");
  return {
    // Navigating from a Pokédex entry is covered in pokemon-screen.test.tsx.
    Link: ({ children }: { children: React.ReactNode }) => children,
    Stack: {
      Screen: ({ options }: { options?: { headerRight?: () => React.ReactNode } }) => (
        <>{options?.headerRight?.()}</>
      ),
      SearchBar: function SearchBar({
        ref,
        placeholder,
        onChangeText,
      }: {
        ref?: React.Ref<{ clearText: () => void }>;
        placeholder: string;
        onChangeText: (event: { nativeEvent: { text: string } }) => void;
      }) {
        const [text, setText] = React.useState("");
        React.useImperativeHandle(ref, () => ({
          clearText: () => setText(""),
        }));
        return (
          <TextInput
            placeholder={placeholder}
            value={text}
            onChangeText={(next) => {
              setText(next);
              onChangeText({ nativeEvent: { text: next } });
            }}
          />
        );
      },
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
  {
    id: 155,
    name: "cyndaquil",
    types: ["fire"],
    image: "https://example.com/155.png",
    generation: 2,
  },
];

async function search(text: string): Promise<void> {
  await fireEvent.changeText(screen.getByPlaceholderText("Search by name or number"), text);
}

async function openFilters(): Promise<void> {
  await fireEvent.press(screen.getByRole("button", { name: "Filters" }));
}

async function choose(name: string): Promise<void> {
  await fireEvent.press(screen.getByRole("radio", { name }));
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

  it("filters by Type from the filter sheet", async () => {
    await render(<PokedexScreen />);

    await openFilters();
    await choose("fire");

    expect(screen.getByText("charmander")).toBeOnTheScreen();
    expect(screen.getByText("cyndaquil")).toBeOnTheScreen();
    expect(screen.queryByText("bulbasaur")).not.toBeOnTheScreen();
    expect(screen.queryByText("pikachu")).not.toBeOnTheScreen();
  });

  it("filters by Generation from the filter sheet", async () => {
    await render(<PokedexScreen />);

    await openFilters();
    await choose("Gen II Johto");

    expect(screen.getByText("cyndaquil")).toBeOnTheScreen();
    expect(screen.queryByText("charmander")).not.toBeOnTheScreen();
  });

  it("combines search, Type, and Generation", async () => {
    await render(<PokedexScreen />);

    await search("a");
    await openFilters();
    await choose("fire");
    await choose("Gen I Kanto");

    expect(screen.getByText("charmander")).toBeOnTheScreen();
    expect(screen.queryByText("cyndaquil")).not.toBeOnTheScreen();
    expect(screen.queryByText("bulbasaur")).not.toBeOnTheScreen();
  });

  it("clears search and all filters in one action", async () => {
    await render(<PokedexScreen />);

    await search("char");
    await openFilters();
    await choose("fire");
    await choose("Gen I Kanto");
    await fireEvent.press(screen.getByRole("button", { name: "Clear all" }));

    expect(screen.getByPlaceholderText("Search by name or number")).toHaveDisplayValue("");
    expect(screen.getByRole("radio", { name: "fire" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "Gen I Kanto" })).not.toBeChecked();
    for (const name of ["bulbasaur", "charmander", "pikachu", "cyndaquil"]) {
      expect(screen.getByText(name)).toBeOnTheScreen();
    }
  });

  it("says so when nothing matches the filters, and offers to clear them", async () => {
    await render(<PokedexScreen />);

    await openFilters();
    await choose("electric");
    await choose("Gen II Johto");
    await fireEvent.press(screen.getByLabelText("Close filters"));

    expect(screen.getByText("No Pokémon found")).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole("button", { name: "Clear all" }));

    expect(screen.getByText("pikachu")).toBeOnTheScreen();
    expect(screen.getByText("cyndaquil")).toBeOnTheScreen();
  });

  it("shows on the Filters button how many filters are active", async () => {
    await render(<PokedexScreen />);
    const button = screen.getByRole("button", { name: "Filters" });

    expect(button).not.toHaveAccessibilityValue({ text: expect.any(String) });

    await openFilters();
    await choose("fire");
    expect(button).toHaveAccessibilityValue({ text: "1 active" });

    await choose("Gen I Kanto");
    expect(button).toHaveAccessibilityValue({ text: "2 active" });

    await fireEvent.press(screen.getByRole("button", { name: "Clear all" }));
    expect(button).not.toHaveAccessibilityValue({ text: expect.any(String) });
  });

  it("shows a loading message while the query is loading", async () => {
    mockUseQuery.mockReturnValue(undefined);

    await render(<PokedexScreen />);

    expect(screen.getByText("Loading…")).toBeOnTheScreen();
  });
});
