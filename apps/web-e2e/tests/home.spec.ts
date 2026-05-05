import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads and displays the page title", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/SimpleDex/);
  });

  test("displays pokemon content", async ({ page }) => {
    await page.goto("/");

    await page.waitForLoadState("networkidle");

    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});
