import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Wait for page to be fully loaded including network activity
 */
export async function waitForPageLoad(
  page: Page,
  options?: { timeout?: number },
) {
  await page.waitForLoadState("domcontentloaded", {
    timeout: options?.timeout || 10000,
  });

  // Additional wait for any animations to settle
  await page.waitForTimeout(1000);
}

/**
 * Wait for 3D content to load
 */
export async function waitFor3DContent(page: Page) {
  // Wait for canvas elements to be present (common in 3D applications)
  await page.waitForSelector("canvas", { timeout: 15000 }).catch(() => {
    // Canvas might not be present on all pages, that's okay
  });

  // Wait for network idle to ensure all assets are loaded
  await page.waitForLoadState("domcontentloaded", { timeout: 15000 });

  // Give additional time for 3D rendering to complete
  await page.waitForTimeout(2000);
}

/**
 * Check for common error states
 */
export async function checkNoErrors(page: Page) {
  // Check for 404 errors
  const notFoundText = page.locator('text="404"').first();
  await expect(notFoundText).not.toBeVisible();

  // Check for error messages
  const errorMessage = page
    .locator('[data-testid="error"], .error-message')
    .first();
  await expect(errorMessage).not.toBeVisible();

  // Check console errors (excluding known safe errors)
  const logs = await page.evaluate(() => {
    return (
      (window as unknown as { __playwright_logs?: unknown[] })
        .__playwright_logs || []
    );
  });

  // Filter out expected warnings/errors (adjust as needed)
  const criticalErrors = logs.filter(
    (log: unknown) =>
      typeof log === "object" &&
      log !== null &&
      "level" in log &&
      "message" in log &&
      (log as { level: string }).level === "error" &&
      !(log as { message: string }).message.includes("favicon") &&
      !(log as { message: string }).message.includes("sourcemap"),
  );

  expect(criticalErrors).toHaveLength(0);
}
