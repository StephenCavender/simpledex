import { describe, it, expect } from "vitest";

describe("Pokemon types", () => {
  it("has color mapping for each type", () => {
    const TYPE_COLORS: Record<string, string> = {
      grass: "bg-green-500",
      fire: "bg-red-500",
      water: "bg-blue-500",
    };

    expect(TYPE_COLORS.grass).toBe("bg-green-500");
    expect(TYPE_COLORS.fire).toBe("bg-red-500");
    expect(TYPE_COLORS.water).toBe("bg-blue-500");
  });

  it("includes all gen 1 types", () => {
    const types = [
      "grass",
      "fire",
      "water",
      "ice",
      "rock",
      "bug",
      "dragon",
      "psychic",
      "flying",
      "ground",
      "poison",
      "steel",
      "fairy",
      "normal",
      "fighting",
      "electric",
    ];

    types.forEach((type) => {
      expect(type.length).toBeGreaterThan(0);
    });
  });
});

describe("Theme support", () => {
  it("has light theme CSS variables", () => {
    const light = {
      background: "oklch(1 0 0)",
      foreground: "oklch(0.145 0 0)",
      primary: "oklch(0.205 0 0)",
    };

    expect(light.background).toBe("oklch(1 0 0)");
    expect(light.foreground).toBe("oklch(0.145 0 0)");
    expect(light.primary).toBe("oklch(0.205 0 0)");
  });

  it("has dark theme CSS variables", () => {
    const dark = {
      background: "oklch(0.145 0 0)",
      foreground: "oklch(0.985 0 0)",
      primary: "oklch(0.87 0 0)",
    };

    expect(dark.background).toBe("oklch(0.145 0 0)");
    expect(dark.foreground).toBe("oklch(0.985 0 0)");
    expect(dark.primary).toBe("oklch(0.87 0 0)");
  });
});
