import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    port: 3001,
  },
  resolve: {
    tsconfigPaths: true,
    // Always bundle one React, however node_modules is laid out. A second copy
    // (e.g. one reached through a stale install) has no active renderer, so
    // hooks called through it throw "can't access property 'useReducer'".
    dedupe: ["react", "react-dom"],
  },
  plugins: [
    tailwindcss(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "simpledex",
        short_name: "simpledex",
        description: "simpledex - PWA Application",
        theme_color: "#0c0c0c",
        background_color: "#0c0c0c",
        display: "standalone",
        start_url: "/",
        id: "/",
      },
      // Generates the icons, favicon, and apple-touch icon from public/logo.svg
      // (pwa-assets.config.ts) and injects them into the manifest and index.html.
      pwaAssets: { disabled: false, config: true },
      devOptions: { enabled: true },
    }),
  ],
});
