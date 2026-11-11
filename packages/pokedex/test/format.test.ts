import { describe, expect, it } from "vitest";
import { formatPokedexNumber, formatSlug, formatStatName } from "../src";

describe("formatPokedexNumber", () => {
  it.each([
    [1, "#001"],
    [25, "#025"],
    [250, "#250"],
    [1025, "#1025"],
  ])("formats %i as %s", (id, expected) => {
    expect(formatPokedexNumber(id)).toBe(expected);
  });
});

describe("formatSlug", () => {
  it("turns hyphens into spaces", () => {
    expect(formatSlug("special-attack")).toBe("special attack");
    expect(formatSlug("hp")).toBe("hp");
  });
});

describe("formatStatName", () => {
  it("spells HP as an abbreviation", () => {
    expect(formatStatName("hp")).toBe("HP");
  });

  it("turns other stats' hyphens into spaces, leaving capitalisation to the UI", () => {
    expect(formatStatName("special-attack")).toBe("special attack");
    expect(formatStatName("speed")).toBe("speed");
  });
});
