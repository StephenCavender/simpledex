import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import sharp, { type Sharp } from "sharp";

const LOGO_PATH = join(import.meta.dirname, "..", "logo.svg");

/** The logo's viewBox edge; the artwork is centred in it. */
const VIEWBOX = 512;

const WHITE = "#FFFFFF";

/** Edge of every generated mobile image. */
const ICON_SIZE = 1024;

/** The logo on the iOS icon: about 80% of its height, clear of the corner mask. */
const IOS_LOGO_SIZE = 860;

/**
 * The logo on Android adaptive icon layers. Android masks them to shapes that
 * always contain the centre 66dp of 108dp; at this size the artwork's farthest
 * corner sits just inside that circle.
 */
const ADAPTIVE_LOGO_SIZE = 512;

/** The logo without its `<g id="fill">` colour fills: just the outline. */
function outlineOnly(svg: string): string {
  return svg.replace(/<g id="fill">[\s\S]*?<\/g>/, "");
}

/** Renders the logo as a square PNG of `size` px. */
function renderLogo(svg: string, size: number): Promise<Buffer> {
  return sharp(Buffer.from(svg), { density: (72 * size) / VIEWBOX })
    .resize(size, size)
    .png()
    .toBuffer();
}

/** A `size` px square filled with `background`, transparent if null. */
function canvas(size: number, background: string | null): Sharp {
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });
}

/** Centres the logo, `logoSize` px square, on a `size` px canvas. */
async function placeLogo(
  svg: string,
  size: number,
  logoSize: number,
  background: string | null,
): Promise<Buffer> {
  const offset = Math.round((size - logoSize) / 2);
  return canvas(size, background)
    .composite([{ input: await renderLogo(svg, logoSize), left: offset, top: offset }])
    .png()
    .toBuffer();
}

async function write(path: string, contents: Buffer | string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, contents);
}

/**
 * Generates every app icon and splash image from `logo.svg`, writing them
 * under `root` at their paths in the monorepo.
 */
export async function generateAssets(root: string): Promise<void> {
  const svg = await readFile(LOGO_PATH, "utf8");
  const mobile = join(root, "apps/mobile/assets/images");

  await write(join(mobile, "icon.png"), await placeLogo(svg, ICON_SIZE, IOS_LOGO_SIZE, WHITE));
  await write(
    join(mobile, "android-icon-foreground.png"),
    await placeLogo(svg, ICON_SIZE, ADAPTIVE_LOGO_SIZE, null),
  );
  await write(
    join(mobile, "android-icon-background.png"),
    await canvas(ICON_SIZE, WHITE).png().toBuffer(),
  );
  // Android themed icons use only the alpha channel, so the fills would
  // flatten the artwork into a silhouette.
  await write(
    join(mobile, "android-icon-monochrome.png"),
    await placeLogo(outlineOnly(svg), ICON_SIZE, ADAPTIVE_LOGO_SIZE, null),
  );
  // The splash screen plugin sizes and centres this itself (`imageWidth`).
  await write(join(mobile, "splash-icon.png"), await renderLogo(svg, ICON_SIZE));

  // The web builds its PWA icons from this copy (apps/web/pwa-assets.config.ts).
  await write(join(root, "apps/web/public/logo.svg"), svg);
  await write(join(root, "apps/marketing/src/images/logo.svg"), svg);
}
