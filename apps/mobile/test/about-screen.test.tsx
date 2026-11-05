import { Stack } from "expo-router";
import { fireEvent, renderRouter, screen } from "expo-router/testing-library";
import Storage from "expo-sqlite/kv-store";
import { Uniwind } from "uniwind";

import AboutScreen from "@/app/about";
import PokedexScreen from "@/app/index";
import { restoreThemePreference } from "@/lib/theme-preference";
import { useCachedQuery } from "@/lib/use-cached-query";

jest.mock("@/lib/use-cached-query", () => ({ useCachedQuery: jest.fn() }));

// An in-memory key-value store in place of SQLite.
jest.mock("expo-sqlite/kv-store", () => {
  const items = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItemSync: (key: string) => items.get(key) ?? null,
      setItemSync: (key: string, value: string) => items.set(key, value),
      clearSync: () => items.clear(),
    },
  };
});

jest.mocked(useCachedQuery).mockReturnValue({ status: "loading" });

async function renderApp(initialUrl: string): ReturnType<typeof renderRouter> {
  return renderRouter(
    { _layout: () => <Stack />, index: PokedexScreen, about: AboutScreen },
    { initialUrl },
  );
}

async function chooseTheme(name: string): Promise<void> {
  await fireEvent.press(screen.getByRole("radio", { name }));
}

describe("AboutScreen", () => {
  beforeEach(() => {
    Storage.clearSync();
    Uniwind.setTheme("system");
  });

  it("opens from the Pokédex's header", async () => {
    const router = await renderApp("/");

    await fireEvent.press(screen.getByRole("link", { name: "About" }));

    expect(router.getPathname()).toBe("/about");
    expect(screen.getByRole("header", { name: "SimpleDex" })).toBeOnTheScreen();
  });

  it("describes SimpleDex and credits PokeAPI for its data", async () => {
    await renderApp("/about");

    expect(screen.getByText(/quick reference for Pokémon/)).toBeOnTheScreen();
    expect(screen.getByRole("link", { name: "PokeAPI" })).toHaveProp("href", "https://pokeapi.co");
  });

  it("follows the device's light or dark setting when no theme has been chosen", async () => {
    await renderApp("/about");

    expect(screen.getByRole("radio", { name: "System" })).toBeChecked();
    expect(Uniwind.hasAdaptiveThemes).toBe(true);
  });

  it.each(["light", "dark"] as const)(
    "applies the %s theme as soon as it's chosen",
    async (theme) => {
      await renderApp("/about");

      await chooseTheme(theme === "light" ? "Light" : "Dark");

      expect(
        screen.getByRole("radio", { name: theme === "light" ? "Light" : "Dark" }),
      ).toBeChecked();
      expect(screen.getByRole("radio", { name: "System" })).not.toBeChecked();
      expect(Uniwind.hasAdaptiveThemes).toBe(false);
      expect(Uniwind.currentTheme).toBe(theme);
    },
  );

  it.each([
    ["Light", "light", false],
    ["Dark", "dark", false],
    ["System", "light", true],
  ] as const)("keeps %s chosen at the next launch", async (name, theme, followsDevice) => {
    await renderApp("/about");
    await chooseTheme(name === "System" ? "Dark" : "Light");
    await chooseTheme(name);
    await screen.unmount();

    // A fresh launch starts out following the device, then restores the choice.
    Uniwind.setTheme("system");
    restoreThemePreference();
    await renderApp("/about");

    expect(screen.getByRole("radio", { name })).toBeChecked();
    expect(Uniwind.hasAdaptiveThemes).toBe(followsDevice);
    expect(Uniwind.currentTheme).toBe(theme);
  });
});
