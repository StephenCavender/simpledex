import { test, expect } from "@playwright/test";

test.describe("Pokémon detail page", () => {
  test("shows a branching Evolution Chain with methods", async ({ page }) => {
    await page.goto("/pokemon/133");

    const evolutions = page.getByRole("heading", { name: "Evolutions" }).locator("..");
    const into = evolutions.getByRole("region", { name: "Evolves into" });
    await expect(into.getByRole("img", { name: "vaporeon" })).toBeVisible();
    await expect(into).toContainText("Use Water Stone");
  });

  test("says a single-stage Pokémon does not evolve", async ({ page }) => {
    await page.goto("/pokemon/1025");

    const evolutions = page.getByRole("heading", { name: "Evolutions" }).locator("..");
    await expect(evolutions).toContainText("Does not evolve.");
  });
});
