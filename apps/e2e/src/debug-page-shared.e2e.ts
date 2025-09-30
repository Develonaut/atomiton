import { expect, test } from "#fixtures/electron";

test.describe("Debug Page Core Functionality", () => {
  test.beforeEach(async ({ sharedElectronPage }) => {
    // Navigate to debug route for each test - will redirect to /debug/nodes
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
    // Navigate to System page using the new route
    await sharedElectronPage.goto("http://localhost:5173/debug/system");
    await sharedElectronPage.waitForLoadState("networkidle");
    await sharedElectronPage.waitForTimeout(1000);

    // Now test through the debug page UI button using data-testid
    const healthButton = sharedElectronPage.locator(
      '[data-testid="test-health"]',
    );

    await expect(healthButton).toBeVisible({ timeout: 5000 });
    await healthButton.click();
    await sharedElectronPage.waitForTimeout(1000);

    // Verify ping message is sent
    const pingElement = sharedElectronPage.locator(
      '[data-testid="health-ping"]',
    );
    await expect(pingElement).toBeVisible({ timeout: 5000 });
    const pingDataOutput = await pingElement.getAttribute("data-output");
    expect(pingDataOutput).toBe("ping");

    // Verify pong response is received
    const pongElement = sharedElectronPage.locator(
      '[data-testid="health-pong"]',
    );
    await expect(pongElement).toBeVisible({ timeout: 5000 });
    const pongDataOutput = await pongElement.getAttribute("data-output");
    // The health check should succeed, returning 'success' in data-output
    expect(pongDataOutput).toBe("success");

    // Verify IPC connection message
    const messageElement = sharedElectronPage.locator(
      '[data-testid="health-message"]',
    );
    const hasMessage = await messageElement
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    if (hasMessage) {
      const messageOutput = await messageElement.getAttribute("data-output");
      expect(messageOutput).toContain("IPC connection");
    }

    // Verify timestamp is present
    const timestampElement = sharedElectronPage.locator(
      '[data-testid="health-timestamp"]',
    );
    await expect(timestampElement).toBeVisible({ timeout: 5000 });
    const timestampOutput = await timestampElement.getAttribute("data-output");
    expect(timestampOutput).toBeTruthy();
    // Verify it looks like a time
    expect(timestampOutput).toMatch(/\d{1,2}:\d{2}:\d{2}/);
  });
});
