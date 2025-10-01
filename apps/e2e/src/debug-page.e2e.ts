import { expect, test } from "#fixtures/electron";

test.describe("Debug Page Core Functionality", () => {
  test.beforeAll(async ({ sharedElectronPage }) => {
    // Navigate once to debug route - will redirect to /debug/nodes
    await sharedElectronPage.goto("http://localhost:5173/debug", {
      waitUntil: "load",
      timeout: 10000,
    });
    // Wait for debug page title to be visible
    await sharedElectronPage
      .locator('[data-testid="debug-page-title"]')
      .waitFor({ state: "visible", timeout: 10000 });
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

  test("conductor health check auto-runs on page load", async ({
    sharedElectronPage,
  }) => {
    // Navigate to System page using the new route
    await sharedElectronPage.goto("http://localhost:5173/debug/system", {
      waitUntil: "domcontentloaded",
    });

    // The HealthStatusIndicator component automatically checks health on mount
    // Verify health check button is visible with health status
    const healthButton = sharedElectronPage.locator(
      '[data-testid="test-health"]',
    );
    await expect(healthButton).toBeVisible({ timeout: 5000 });

    // Wait for auto health check to complete (should be "healthy" or "unhealthy")
    await sharedElectronPage.waitForTimeout(2000);

    // Verify health status is set (not "checking" or "unknown")
    const healthDataOutput = await healthButton.getAttribute("data-output");
    expect(healthDataOutput).toMatch(/^(healthy|unhealthy)$/);

    // For MVP health check should succeed
    expect(healthDataOutput).toBe("healthy");
  });

  test("conductor health check works via button click", async ({
    sharedElectronPage,
  }) => {
    // Navigate to System page
    await sharedElectronPage.goto("http://localhost:5173/debug/system", {
      waitUntil: "domcontentloaded",
    });

    // Wait for initial auto-check to complete
    const healthButton = sharedElectronPage.locator(
      '[data-testid="test-health"]',
    );
    await expect(healthButton).toBeVisible({ timeout: 5000 });
    await sharedElectronPage.waitForTimeout(2000);

    // Click button to manually trigger health check
    await healthButton.click();

    // Should briefly show "checking" status
    const checkingStatus = await healthButton.getAttribute("data-output");
    expect(checkingStatus).toMatch(/^(checking|healthy)$/);

    // Wait for health check to complete
    await sharedElectronPage.waitForTimeout(2000);

    // Verify final health status
    const finalStatus = await healthButton.getAttribute("data-output");
    expect(finalStatus).toBe("healthy");
  });
});
