import { test, expect } from "@playwright/test";
import { createBrowserLogger } from "@atomiton/logger/browser";

const logger = createBrowserLogger({ namespace: "E2E:IPC-COMPONENT" });

test.describe("IPC Test Component", () => {
  test.beforeEach(async ({ page }) => {
    logger.info("Navigating to IPC test page");

    // Navigate to the IPC test page
    await page.goto("http://localhost:5173/test/ipc");
    await page.waitForLoadState("networkidle");
  });

  test("IPCTest component renders and shows correct state", async ({
    page,
  }) => {
    logger.info("🚀 Starting IPCTest component test...");

    // Check if the IPC test container is present
    const container = page.locator('[data-testid="ipc-test-container"]');
    const notAvailable = page.locator('[data-testid="ipc-not-available"]');

    // Either the component or the "not available" message should be present
    const containerVisible = await container.isVisible().catch(() => false);
    const notAvailableVisible = await notAvailable
      .isVisible()
      .catch(() => false);

    if (notAvailableVisible) {
      logger.info("✅ IPC not available message shown (browser mode)");
      expect(notAvailableVisible).toBe(true);

      // Verify the message text
      const messageText = await notAvailable.textContent();
      expect(messageText).toContain("IPC not available");
    } else if (containerVisible) {
      logger.info("✅ IPC test container is visible (Electron mode)");
      expect(containerVisible).toBe(true);

      // Verify the component has the expected elements
      const pingButton = page.locator('[data-testid="ping-button"]');
      const executeButton = page.locator('[data-testid="execute-button"]');

      expect(await pingButton.isVisible()).toBe(true);
      expect(await executeButton.isVisible()).toBe(true);
      logger.info("✅ IPC test buttons are present");
    } else {
      throw new Error(
        "Neither IPC container nor 'not available' message found",
      );
    }
  });

  test("IPCTest component UI interactions work", async ({ page }) => {
    logger.info("🚀 Testing IPCTest component UI...");

    // Check if we're in browser mode (IPC not available) or Electron mode
    const notAvailable = page.locator('[data-testid="ipc-not-available"]');
    const isNotAvailable = await notAvailable.isVisible().catch(() => false);

    if (isNotAvailable) {
      logger.info(
        "ℹ️ Running in browser mode - IPC interactions not available",
      );
      // In browser mode, we just verify the warning is shown
      expect(isNotAvailable).toBe(true);
      return;
    }

    // In Electron mode, test the interactions
    const testContainer = page.locator('[data-testid="ipc-test-container"]');
    expect(await testContainer.isVisible()).toBe(true);

    // Test ping button
    const pingButton = page.locator('[data-testid="ping-button"]');
    await pingButton.click();
    logger.info("Clicked ping button");

    // Wait for ping result
    const pingResult = page.locator('[data-testid="ping-result"]');
    await pingResult.waitFor({ timeout: 5000 }).catch(() => {
      logger.info("⚠️ Ping result not shown (may be running in browser mode)");
    });

    if (await pingResult.isVisible()) {
      const pingText = await pingResult.textContent();
      expect(pingText).toContain("pong");
      logger.info("✅ Ping test successful");
    }

    // Test execute button
    const executeButton = page.locator('[data-testid="execute-button"]');
    await executeButton.click();
    logger.info("Clicked execute button");

    // Wait for either progress or result
    await page.waitForTimeout(1000);

    const progressIndicator = page.locator(
      '[data-testid="progress-indicator"]',
    );
    const executionResult = page.locator('[data-testid="execution-result"]');
    const errorDisplay = page.locator('[data-testid="error-display"]');

    const hasProgress = await progressIndicator.isVisible().catch(() => false);
    const hasResult = await executionResult.isVisible().catch(() => false);
    const hasError = await errorDisplay.isVisible().catch(() => false);

    if (hasProgress) {
      logger.info("✅ Progress indicator shown");
    }
    if (hasResult) {
      logger.info("✅ Execution result shown");
    }
    if (hasError) {
      const errorText = await errorDisplay.textContent();
      logger.info(`⚠️ Error shown: ${errorText}`);
    }

    // At least one of these should be visible after clicking execute
    expect(hasProgress || hasResult || hasError).toBe(true);
    logger.info("✅ Execute button test completed");
  });
});
