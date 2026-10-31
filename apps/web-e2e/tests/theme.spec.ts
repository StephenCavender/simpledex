import { test, expect, type Page } from "@playwright/test";

// next-themes sets `color-scheme` on <html> once the theme is applied, for
// light and dark alike. Asserting on it waits until the theme has settled,
// where a negative class assertion would pass before it does.
async function expectTheme(page: Page, theme: "light" | "dark"): Promise<void> {
  await expect(page.locator("html")).toHaveCSS("color-scheme", theme);
}

test.describe("Theme", () => {
  test("a first-time visitor sees the light theme when the OS is light", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");

    await expectTheme(page, "light");
  });

  test("a first-time visitor sees the dark theme when the OS is dark", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");

    await expectTheme(page, "dark");
  });

  test("changing the OS setting while on System updates the app", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await expectTheme(page, "light");

    await page.emulateMedia({ colorScheme: "dark" });

    await expectTheme(page, "dark");
  });

  test("an explicit choice overrides the OS setting and persists", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expectTheme(page, "dark");

    await page.getByRole("button", { name: "Toggle theme" }).click();
    await page.getByRole("menuitem", { name: "Light" }).click();
    await expectTheme(page, "light");

    await page.reload();

    await expectTheme(page, "light");
  });
});
