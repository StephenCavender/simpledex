import type { ColorValue } from "react-native";

/** A colour read with Uniwind's `useCSSVariable`, or the fallback when it isn't set. */
export function cssColor<Fallback extends ColorValue | undefined>(
  value: string | number | undefined,
  fallback: Fallback,
): ColorValue | Fallback {
  return typeof value === "string" ? value : fallback;
}
