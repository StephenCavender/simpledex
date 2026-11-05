// Regenerates every app icon, splash image, and logo copy from logo.svg.
// Run with `bun run generate:assets` from the repo root.
import { join } from "node:path";
import { generateAssets } from "../src/assets";

await generateAssets(join(import.meta.dirname, "../../.."));
console.log("Generated brand assets from packages/brand/logo.svg");
