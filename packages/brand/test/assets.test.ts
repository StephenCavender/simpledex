import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { generateAssets } from "../src/assets";

let root: string;

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "simpledex-brand-"));
  await generateAssets(root);
});

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});

const image = (path: string) => sharp(join(root, path));

/** Alpha of every pixel, row by row, plus the image edge length. */
async function alphaOf(
  path: string,
): Promise<{ size: number; alpha: (x: number, y: number) => number }> {
  const { data, info } = await image(path)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return {
    size: info.width,
    alpha: (x, y) => data[(y * info.width + x) * info.channels + 3] ?? 0,
  };
}

/**
 * Android masks adaptive icons to shapes that always contain the centre
 * 66dp circle of the 108dp layer, so artwork must stay inside it.
 */
async function expectWithinSafeZone(path: string): Promise<void> {
  const { size, alpha } = await alphaOf(path);
  const radius = ((66 / 108) * size) / 2;
  const centre = size / 2;
  let outside = 0;
  let inside = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const distance = Math.hypot(x + 0.5 - centre, y + 0.5 - centre);
      if (alpha(x, y) === 0) continue;
      if (distance > radius) outside++;
      else inside++;
    }
  }
  expect(size).toBe(1024);
  expect(outside).toBe(0);
  expect(inside).toBeGreaterThan(0);
}

describe("generateAssets", () => {
  it("renders a 1024px, fully opaque iOS app icon", async () => {
    const icon = image("apps/mobile/assets/images/icon.png");
    const { width, height } = await icon.metadata();
    const { isOpaque } = await icon.stats();

    expect([width, height]).toEqual([1024, 1024]);
    expect(isOpaque).toBe(true);
  });

  it("keeps the Android adaptive icon foreground inside the safe zone", async () => {
    await expectWithinSafeZone("apps/mobile/assets/images/android-icon-foreground.png");
  });

  it("renders an opaque 1024px Android adaptive icon background", async () => {
    const background = image("apps/mobile/assets/images/android-icon-background.png");
    const { width, height } = await background.metadata();
    const { isOpaque } = await background.stats();

    expect([width, height]).toEqual([1024, 1024]);
    expect(isOpaque).toBe(true);
  });

  it("renders the Android monochrome icon from the outline alone", async () => {
    const path = "apps/mobile/assets/images/android-icon-monochrome.png";
    await expectWithinSafeZone(path);

    // A point in the logo's yellow fill: painted in the foreground, not here.
    const [x, y] = [256 + 150, 256 + 400];
    const foreground = await alphaOf("apps/mobile/assets/images/android-icon-foreground.png");
    const monochrome = await alphaOf(path);
    expect(foreground.alpha(x, y)).toBe(255);
    expect(monochrome.alpha(x, y)).toBe(0);
  });

  it("renders a 1024px splash image on a transparent background", async () => {
    const { size, alpha } = await alphaOf("apps/mobile/assets/images/splash-icon.png");

    expect(size).toBe(1024);
    expect(alpha(0, 0)).toBe(0);
    expect(alpha(512, 512)).toBe(255);
  });

  it.each(["apps/web/public/logo.svg", "apps/marketing/src/images/logo.svg"])(
    "copies the source logo to %s",
    async (path) => {
      const source = await readFile(join(import.meta.dirname, "../logo.svg"), "utf8");
      expect(await readFile(join(root, path), "utf8")).toBe(source);
    },
  );
});
