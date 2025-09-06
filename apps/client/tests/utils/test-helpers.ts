import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Common test utilities for the Atomiton web app
 */

/**
 * Wait for page to be fully loaded including network activity
 * Especially useful for pages with 3D content or animations
 */
export async function waitForPageLoad(
  page: Page,
  options?: { timeout?: number },
) {
  await page.waitForLoadState("networkidle", {
    timeout: options?.timeout || 10000,
  });

  // Additional wait for any animations to settle
  await page.waitForTimeout(1000);
}

/**
 * Wait for 3D content to load (useful for animation and design pages)
 */
export async function waitFor3DContent(page: Page) {
  // Wait for canvas elements to be present (common in 3D applications)
  await page.waitForSelector("canvas", { timeout: 15000 }).catch(() => {
    // Canvas might not be present on all pages, that's okay
  });

  // Wait for network idle to ensure all assets are loaded
  await page.waitForLoadState("networkidle", { timeout: 15000 });

  // Give additional time for 3D rendering to complete
  await page.waitForTimeout(2000);
}

/**
 * Verify basic page content is present (MINIMAL smoke test approach)
 */
export async function verifyBasicContent(page: Page) {
  // Check that page has some text content (not blank)
  const bodyText = await page.locator("body").textContent();
  expect(bodyText).toBeTruthy();
  expect(bodyText!.trim().length).toBeGreaterThan(0);

  // Check for no critical errors
  await checkNoErrors(page);
}

/**
 * Wait for navigation and ensure page is stable
 */
export async function navigateAndWait(page: Page, url: string) {
  await page.goto(url);
  await waitForPageLoad(page);
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

/**
 * Viewport sizes for responsive testing
 */
export const VIEWPORTS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
  widescreen: { width: 1920, height: 1080 },
} as const;

/**
 * Common selectors used throughout the app
 */
export const SELECTORS = {
  navigation: '[data-testid="navigation"], nav',
  header: '[data-testid="header"], header',
  footer: '[data-testid="footer"], footer',
  loading: '[data-testid="loading"], .loading',
  error: '[data-testid="error"], .error',
} as const;

/**
 * Take a visual snapshot of the current page
 * Useful for visual regression testing
 */
export async function takePageSnapshot(page: Page, fileName: string) {
  // Wait for page to be stable before taking screenshot
  await waitForPageLoad(page);

  // Take the screenshot with consistent settings
  await expect(page).toHaveScreenshot(fileName, {
    fullPage: true,
    animations: "disabled",
    clip: undefined, // Full page
  });
}
