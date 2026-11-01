import { DarkTheme, DefaultTheme, type Theme } from "expo-router";
import type { ColorValue } from "react-native";
import { useCSSVariable, useUniwind } from "uniwind";

function color(value: string | number | undefined, fallback: ColorValue): ColorValue {
  return typeof value === "string" ? value : fallback;
}

/**
 * The navigation theme (header, screen background) built from the shared
 * token colours for the active light or dark theme.
 */
export function useNavigationTheme(): Theme {
  const { theme } = useUniwind();
  const [background, card, text, border, primary] = useCSSVariable([
    "--color-background",
    "--color-card",
    "--color-foreground",
    "--color-border",
    "--color-primary",
  ]);
  const base = theme === "dark" ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      background: color(background, base.colors.background),
      card: color(card, base.colors.card),
      text: color(text, base.colors.text),
      border: color(border, base.colors.border),
      primary: color(primary, base.colors.primary),
    },
  };
}
