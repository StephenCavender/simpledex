import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads and displays the page title", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/SimpleDex/);
  });

  test("renders Pokédex entries", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /bulbasaur/i })).toBeVisible();
  });

  test("searching by name finds Pikachu as #025", async ({ page }) => {
    await page.goto("/");

    await page.getByPlaceholder(/search/i).fill("pikachu");

    const card = page.getByRole("link", { name: /pikachu/i });
    await expect(card).toBeVisible();
    await expect(card).toContainText("#025");
    await expect(page).toHaveURL(/q=pikachu/);
  });

  test("Generation filter in the URL includes Pokédex numbers above 1000", async ({ page }) => {
    await page.goto("/?gen=9");

    await expect(page.getByRole("link", { name: /#1025/ })).toBeVisible();
  });

  test("Back from a Pokémon keeps the Pokédex filters", async ({ page }) => {
    await page.goto("/?type=electric");

    await page.getByRole("link", { name: /pikachu/i }).click();
    await expect(page.getByRole("heading", { name: /pikachu/i })).toBeVisible();
    await page.getByRole("link", { name: /back/i }).click();

    await expect(page).toHaveURL(/type=electric/);
    await expect(page.getByRole("link", { name: /bulbasaur/i })).toBeHidden();
  });
});
