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

    // Verify template cards are present (My Scenes)
    const templateCards = page.locator('a[href^="/editor/"]');
    const cardCount = await templateCards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test("Clicking on a template loads it in the editor", async ({ page }) => {
    // Navigate to home page
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Wait for template cards to be visible
    await page.waitForSelector('a[href^="/editor/"]', {
      timeout: 5000,
    });

    // Get the first template card
    const firstTemplateCard = page.locator('a[href^="/editor/"]').first();

    // Get the expected navigation URL
    const expectedHref = await firstTemplateCard.getAttribute("href");
    expect(expectedHref).toBeTruthy();
    expect(expectedHref).toMatch(/^\/editor\/.+$/);

    // Click on the template card
    await firstTemplateCard.click();

    // Verify navigation to editor with template ID
    await expect(page).toHaveURL(expectedHref!);

    // Wait for editor to load
    await page.waitForSelector(".react-flow", { timeout: 10000 });

    // Verify the editor canvas is present
    const canvas = page.locator(".react-flow");
    await expect(canvas).toBeVisible();

    // Verify editor UI elements are loaded
    const toolbar = page.locator('[data-testid="toolbar"], .shadow-toolbar');
    await expect(toolbar).toBeVisible();
  });

  test("Explore page navigation", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");

    // Verify we're on the explore page
    await expect(page).toHaveURL(/\/explore/);

    // Verify explore content is loaded
    const exploreContent = page
      .locator('[class*="explore"], [class*="Explore"]')
      .first();
    await expect(exploreContent).toBeVisible();
  });

  test.skip("Create button navigation - OUT OF SCOPE", async ({ page }) => {
    // This test is skipped as Create button functionality is out of scope for current work
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Create button test would go here but is currently out of scope
  });
});
