import { expect, test } from "#fixtures/electron";

test.describe("Debug Page Core Functionality", () => {
  test.beforeEach(async ({ sharedElectronPage }) => {
    // Navigate to debug route for each test
    await sharedElectronPage.goto("http://localhost:5173/debug");
    await sharedElectronPage.waitForLoadState("networkidle");
    await sharedElectronPage.waitForTimeout(2000); // Give React time to render
  });

  test("debug page loads", async ({ sharedElectronPage }) => {
    // Verify we're on the debug page
    const pageContent = await sharedElectronPage.textContent("body");
    expect(pageContent).toContain("Debug");

    // Verify debug page title is present using data-testid
    await expect(
      sharedElectronPage.locator('[data-testid="debug-page-title"]'),
    ).toBeVisible();
  });

  test("conductor health check works through UI", async ({
    sharedElectronPage,
  }) => {
    // Test through the debug page UI button using data-testid
    const healthButton = sharedElectronPage.locator(
      '[data-testid="test-health"]',
    );

    await expect(healthButton).toBeVisible({ timeout: 5000 });
    await healthButton.click();
    await sharedElectronPage.waitForTimeout(1000);

    // Check if health result is displayed in UI
    const healthStatus = await sharedElectronPage
      .locator('[data-testid="health-status"]')
      .isVisible({ timeout: 5000 });
    expect(healthStatus).toBe(true);
  });
});
