import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { POKEMON_TYPES } from "@simpledex/pokedex";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(import.meta.dirname, "../theme.css"), "utf8");

/** The body of the first block whose header matches, up to its closing brace. */
function block(header: RegExp): string {
  const match = header.exec(css);
  if (!match) throw new Error(`No block matching ${header}`);
  let depth = 0;
  for (let i = match.index + match[0].length - 1; i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}" && --depth === 0) return css.slice(match.index, i);
  }
  throw new Error(`Unclosed block matching ${header}`);
}

function names(body: string): string[] {
  return [...body.matchAll(/(--color-[\w-]+):/g)].map((m) => m[1] ?? "").toSorted();
}

describe("Type colour tokens", () => {
  const typeColours = block(/@theme static \{/);

  it.each(POKEMON_TYPES)("defines --color-type-%s", (type) => {
    expect(typeColours).toMatch(new RegExp(`--color-type-${type}:\\s*oklch\\(`));
  });
});

describe("theme colour tokens", () => {
  const light = names(block(/@variant light \{/));

  it("defines the same colours in light and dark", () => {
    expect(names(block(/@variant dark \{/))).toEqual(light);
  });

  it("registers every theme colour with Tailwind", () => {
    expect(names(block(/@theme inline reference \{/))).toEqual(light);
  });
});
