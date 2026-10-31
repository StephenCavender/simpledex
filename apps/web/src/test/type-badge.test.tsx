import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { POKEMON_TYPES } from "@simpledex/pokedex";
import { TypeBadge } from "@/components/type-badge";

describe("TypeBadge", () => {
  it.each(POKEMON_TYPES)("renders %s with its label, colour token, and icon", (type) => {
    const { container } = render(<TypeBadge type={type} />);

    const badge = screen.getByText(type);
    expect(badge.style.backgroundColor).toBe(`var(--type-${type})`);
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelector("svg.lucide-info")).toBeNull();
  });

  it("gives every Type its own icon", () => {
    const icons = POKEMON_TYPES.map((type) => {
      const { container, unmount } = render(<TypeBadge type={type} />);
      const icon = container.querySelector("svg")?.getAttribute("class");
      unmount();
      return icon;
    });
    expect(new Set(icons).size).toBe(POKEMON_TYPES.length);
  });

  it("renders Dark with the Moon icon", () => {
    const { container } = render(<TypeBadge type="dark" />);
    expect(container.querySelector("svg.lucide-moon")).not.toBeNull();
  });

  it("falls back to a neutral colour and icon for an unknown Type", () => {
    const { container } = render(<TypeBadge type="stellar" />);

    expect(screen.getByText("stellar").style.backgroundColor).toBe("var(--muted-foreground)");
    expect(container.querySelector("svg.lucide-info")).not.toBeNull();
  });
});

describe("Type colour tokens", () => {
  const css = readFileSync(resolve(import.meta.dirname, "../index.css"), "utf8");

  it.each(POKEMON_TYPES)("index.css defines --type-%s", (type) => {
    expect(css).toMatch(new RegExp(`--type-${type}:\\s*oklch\\(`));
  });
});
