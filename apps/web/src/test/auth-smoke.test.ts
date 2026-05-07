import { describe, it, expect } from "vitest";

describe("Auth routes compile and basic structure", () => {
  it("login route exports a route definition", async () => {
    const mod = await import("../routes/login");
    expect(mod.Route).toBeDefined();
    expect(typeof mod.Route).toBe("object");
  });

  it("_authenticated layout route exports a route definition", async () => {
    const mod = await import("../routes/_authenticated");
    expect(mod.Route).toBeDefined();
    expect(typeof mod.Route).toBe("object");
  });

  it("favorites route is defined under _authenticated", async () => {
    const mod = await import("../routes/_authenticated/favorites");
    expect(mod.Route).toBeDefined();
  });

  it("pokedex per-game route is defined under _authenticated", async () => {
    const mod = await import("../routes/_authenticated/pokedex.$gameId");
    expect(mod.Route).toBeDefined();
  });
});
