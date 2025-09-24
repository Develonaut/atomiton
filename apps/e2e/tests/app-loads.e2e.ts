import { expect, test } from "@playwright/test";

test.describe("App Loading", () => {
  test("app loads successfully", async ({ page }) => {
    // Navigate to the app
    await page.goto("/");

    // Wait for the app to load - look for any main content
    await page.waitForSelector('main, [role="main"], .pl-55, .pl-0', {
      timeout: 10000,
    });

    // App should have loaded without errors
    const title = await page.title();
    expect(title).toBeTruthy();
  });
});
