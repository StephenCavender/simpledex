import Storage from "expo-sqlite/kv-store";
import { useState } from "react";
import { Uniwind } from "uniwind";

/** Light or dark always, or whichever the device is set to. */
export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

/** Applies the saved theme preference; with none saved, the app follows the device. */
export function restoreThemePreference(): void {
  Uniwind.setTheme(savedPreference());
}

/** The theme preference, and a setter that applies and saves it. */
export function useThemePreference(): [ThemePreference, (preference: ThemePreference) => void] {
  const [preference, setPreference] = useState(savedPreference);
  const choose = (next: ThemePreference): void => {
    Storage.setItemSync(STORAGE_KEY, next);
    Uniwind.setTheme(next);
    setPreference(next);
  };
  return [preference, choose];
}

function savedPreference(): ThemePreference {
  const saved = Storage.getItemSync(STORAGE_KEY);
  return isThemePreference(saved) ? saved : "system";
}

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}
