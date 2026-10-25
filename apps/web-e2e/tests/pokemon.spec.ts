import { test, expect } from "@playwright/test";

test.describe("Pokémon detail page", () => {
  test("shows a branching Evolution Chain with methods", async ({ page }) => {
    await page.goto("/pokemon/133");

    const evolutions = page.getByRole("heading", { name: "Evolutions" }).locator("..");
    await expect(evolutions.getByRole("img", { name: "vaporeon" })).toBeVisible();
    await expect(evolutions).toContainText("Use Water Stone");
  });
});
