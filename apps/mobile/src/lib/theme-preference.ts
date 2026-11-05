import Storage from "expo-sqlite/kv-store";
import { Uniwind, useUniwind } from "uniwind";

/** Light or dark always, or whichever the device is set to. */
export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

/** Applies the saved theme preference; with none saved, the app follows the device. */
export function restoreThemePreference(): void {
  const saved = Storage.getItemSync(STORAGE_KEY);
  if (isThemePreference(saved)) Uniwind.setTheme(saved);
}

/** The theme preference, and a setter that applies and saves it. */
export function useThemePreference(): [ThemePreference, (preference: ThemePreference) => void] {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const preference: ThemePreference = hasAdaptiveThemes ? "system" : toPreference(theme);
  const choose = (next: ThemePreference): void => {
    Storage.setItemSync(STORAGE_KEY, next);
    Uniwind.setTheme(next);
  };
  return [preference, choose];
}

function toPreference(theme: string): ThemePreference {
  return theme === "dark" ? "dark" : "light";
}

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}
