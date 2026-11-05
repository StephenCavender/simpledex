import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

// The PWA icons, favicon, and apple-touch icon are generated from the logo at
// build time. public/logo.svg is copied from packages/brand/logo.svg by
// `bun run generate:assets`; don't edit it here.
export default defineConfig({
  preset: minimal2023Preset,
  images: ["public/logo.svg"],
});
