import { expect, test } from "#fixtures/electron";

test.describe("Debug Page Core Functionality", () => {
  test("debug page loads", async ({ electronPage }) => {
    // Navigate to debug route - will redirect to /debug/nodes
    await electronPage.goto("http://localhost:5173/debug", {
      waitUntil: "load",
      timeout: 10000,
    });
    // Wait for debug page title to be visible
    await electronPage
      .locator('[data-testid="debug-page-title"]')
      .waitFor({ state: "visible", timeout: 10000 });

    await expect(
      electronPage.locator('[data-testid="debug-page-title"]'),
    ).toBeVisible();
  });

  test("conductor health check auto-runs on page load", async ({
    electronPage,
  }) => {
    // Navigate to System page using the new route
    await electronPage.goto("http://localhost:5173/debug/system", {
      waitUntil: "domcontentloaded",
    });

    // The HealthStatusIndicator component automatically checks health on mount
    // Verify health check button is visible with health status
    const healthButton = electronPage.locator('[data-testid="test-health"]');
    await expect(healthButton).toBeVisible({ timeout: 5000 });

    // Wait for auto health check to complete by checking the data-output attribute
    await expect(healthButton).toHaveAttribute(
      "data-output",
      /^(healthy|unhealthy)$/,
      { timeout: 5000 },
    );

    // For MVP health check should succeed
    const healthDataOutput = await healthButton.getAttribute("data-output");
    expect(healthDataOutput).toBe("healthy");
  });

  test("conductor health check works via button click", async ({
    electronPage,
  }) => {
    // Navigate to System page
    await electronPage.goto("http://localhost:5173/debug/system", {
      waitUntil: "domcontentloaded",
    });

    // Wait for initial auto-check to complete
    const healthButton = electronPage.locator('[data-testid="test-health"]');
    await expect(healthButton).toBeVisible({ timeout: 5000 });
    await expect(healthButton).toHaveAttribute(
      "data-output",
      /^(healthy|unhealthy)$/,
      { timeout: 5000 },
    );

    // Click button to manually trigger health check
    await healthButton.click();

    // Wait for health check to complete (status should be either "checking" or "healthy" initially)
    await expect(healthButton).toHaveAttribute(
      "data-output",
      /^(checking|healthy)$/,
      { timeout: 1000 },
    );

    // Wait for final status
    await expect(healthButton).toHaveAttribute("data-output", "healthy", {
      timeout: 5000,
    });

    // Verify final health status
    const finalStatus = await healthButton.getAttribute("data-output");
    expect(finalStatus).toBe("healthy");
  });
});
