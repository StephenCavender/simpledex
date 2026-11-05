import { Stack } from "expo-router";
import { fireEvent, renderRouter, screen } from "expo-router/testing-library";
import Storage from "expo-sqlite/kv-store";
import { Uniwind } from "uniwind";

import AboutScreen from "@/app/about";
import PokedexScreen from "@/app/index";
import { restoreThemePreference } from "@/lib/theme-preference";
import { useCachedQuery } from "@/lib/use-cached-query";

jest.mock("@/lib/use-cached-query", () => ({ useCachedQuery: jest.fn() }));

// Uniwind's bundler plugin compiles the stylesheet; Jest can't load it.
jest.mock("../src/global.css", () => ({}));

// The real client needs a deployment URL; these tests never talk to Convex.
jest.mock("@/lib/convex", () => ({ convex: {} }));

// An in-memory key-value store in place of SQLite, shared across module registries
// so a simulated relaunch sees what the previous launch saved.
const mockItems = new Map<string, string>();
jest.mock("expo-sqlite/kv-store", () => ({
  __esModule: true,
  default: {
    getItemSync: (key: string) => mockItems.get(key) ?? null,
    setItemSync: (key: string, value: string) => mockItems.set(key, value),
    clearSync: () => mockItems.clear(),
  },
}));

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

  it.each([
    ["Light", "light"],
    ["Dark", "dark"],
  ] as const)("applies the %s theme as soon as it's chosen", async (label, theme) => {
    await renderApp("/about");

    await chooseTheme(label);

    expect(screen.getByRole("radio", { name: label })).toBeChecked();
    expect(screen.getByRole("radio", { name: "System" })).not.toBeChecked();
    expect(Uniwind.hasAdaptiveThemes).toBe(false);
    expect(Uniwind.currentTheme).toBe(theme);
  });

  it.each([
    // [choice, a different theme to start the relaunch from, expected theme, follows device]
    ["Light", "dark", "light", false],
    ["Dark", "light", "dark", false],
    ["System", "dark", "light", true],
  ] as const)("keeps %s chosen at the next launch", async (name, stale, theme, followsDevice) => {
    await renderApp("/about");
    await chooseTheme(name === "System" ? "Dark" : "Light");
    await chooseTheme(name);
    await screen.unmount();

    // Start the relaunch from a different theme so only the saved choice can explain the result.
    Uniwind.setTheme(stale);
    restoreThemePreference();
    await renderApp("/about");

    expect(screen.getByRole("radio", { name })).toBeChecked();
    expect(Uniwind.hasAdaptiveThemes).toBe(followsDevice);
    expect(Uniwind.currentTheme).toBe(theme);
  });

  it("applies the saved theme when the app's root layout loads, before anything renders", () => {
    Storage.setItemSync("theme", "dark");

    // Load the real root layout in a fresh module registry, as on a cold launch.
    jest.isolateModules(() => {
      const { Uniwind: freshUniwind } = jest.requireActual<typeof import("uniwind")>("uniwind");
      expect(freshUniwind.currentTheme).not.toBe("dark");

      require("@/app/_layout");

      expect(freshUniwind.currentTheme).toBe("dark");
      expect(freshUniwind.hasAdaptiveThemes).toBe(false);
    });
  });
});
