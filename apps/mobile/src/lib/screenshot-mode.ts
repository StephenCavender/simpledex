/**
 * Whether Pokémon artwork is obscured for store screenshots: in development
 * builds started with `EXPO_PUBLIC_SCREENSHOT_MODE=1` only, never in release
 * builds. App Store review rejected the earlier app's screenshots for showing
 * Pokémon artwork.
 */
export function isScreenshotMode(): boolean {
  return __DEV__ && process.env.EXPO_PUBLIC_SCREENSHOT_MODE === "1";
}
