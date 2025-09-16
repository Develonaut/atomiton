import { test, expect } from "@playwright/test";

test.describe("Critical User Flows", () => {
  test("Home page loads", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify the page loaded
    await expect(page).toHaveTitle(/Atomiton/i);

    // Verify main navigation is present
    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();
  });

  test("Explore page navigation", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");

    // Verify we're on the explore page
    await expect(page).toHaveURL(/\/explore/);
  });

  test("Create/Editor page loads", async ({ page }) => {
    await page.goto("/create");
    await page.waitForLoadState("networkidle");

    // Verify we're on the create page
    await expect(page).toHaveURL(/\/create/);

    // Verify the editor canvas is present
    const canvas = page.locator('[class*="react-flow"]').first();
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });
});
