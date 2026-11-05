import { DarkTheme, DefaultTheme, type Theme } from "expo-router";
import { useCSSVariable, useUniwind } from "uniwind";

import { cssColor as color } from "@/lib/css-color";

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
