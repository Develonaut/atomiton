import { test, expect } from "@playwright/test";

/**
 * SUPER MINIMAL smoke test - just verify we can access existing server
 * This bypasses the webServer config to avoid hangs
 */
test.describe("Simple Smoke Test", () => {
  test("Can connect to running dev server at localhost:3000", async ({
    page,
  }) => {
    try {
      // Try to navigate to home page
      await page.goto("http://localhost:3000/", { timeout: 10000 });

      // Basic checks that page loaded
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);

      // Check page has some content
      const bodyText = await page.locator("body").textContent();
      expect(bodyText).toBeTruthy();
      expect(bodyText!.trim().length).toBeGreaterThan(0);

      console.log("✅ Home page loaded successfully");
      console.log(`Title: ${title}`);
    } catch (error) {
      console.log("❌ Failed to load page:", error);
      throw error;
    }
  });

  test("Sign-in page is accessible", async ({ page }) => {
    try {
      await page.goto("http://localhost:3000/sign-in", { timeout: 10000 });

      const title = await page.title();
      expect(title).toBeTruthy();

      // Check page loaded (not 404)
      const bodyText = await page.locator("body").textContent();
      expect(bodyText).toBeTruthy();
      expect(bodyText!.toLowerCase()).toMatch(/sign|login|auth/);

      console.log("✅ Sign-in page loaded successfully");
    } catch (error) {
      console.log("❌ Failed to load sign-in page:", error);
      throw error;
    }
  });

  test("Create page is accessible", async ({ page }) => {
    try {
      await page.goto("http://localhost:3000/create", { timeout: 10000 });

      const title = await page.title();
      expect(title).toBeTruthy();

      // Check page loaded (not 404)
      const bodyText = await page.locator("body").textContent();
      expect(bodyText).toBeTruthy();

      console.log("✅ Create page loaded successfully");
    } catch (error) {
      console.log("❌ Failed to load create page:", error);
      throw error;
    }
  });
});
