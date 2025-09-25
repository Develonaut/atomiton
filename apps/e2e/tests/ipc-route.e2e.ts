import { test, expect } from "@playwright/test";

test.describe("IPC Test Route", () => {
  test("IPC test route loads successfully", async ({ page }) => {
    // Navigate to the IPC test page
    const response = await page.goto("http://localhost:5173/test/ipc");

    // Check that the page loads
    expect(response?.status()).toBeLessThan(400);

    // Wait for the page to be ready
    await page.waitForLoadState("networkidle");

    // Check for the page title
    const title = await page.textContent("h1");
    expect(title).toContain("IPC System Test");

    // Check that either the IPC component or the "not available" message is present
    const hasIPCContainer =
      (await page.locator('[data-testid="ipc-test-container"]').count()) > 0;
    const hasNotAvailable =
      (await page.locator('[data-testid="ipc-not-available"]').count()) > 0;

    expect(hasIPCContainer || hasNotAvailable).toBe(true);
    console.log(`IPC Container present: ${hasIPCContainer}`);
    console.log(`Not Available message present: ${hasNotAvailable}`);
  });
});
