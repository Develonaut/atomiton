import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Navigation utility functions for E2E tests
 */

/**
 * Navigate to homepage and wait for it to load
 */
export async function goToHomepage(page: Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
}

/**
 * Navigate to explore page
 */
export async function goToExplorePage(page: Page) {
  const exploreButton = page.getByRole("button", { name: /explore/i });

  if ((await exploreButton.count()) > 0) {
    await exploreButton.click();
    await page.waitForURL(/\/explore/, { timeout: 5000 });
  } else {
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");
  }

  await expect(page).toHaveURL(/\/explore/);
}

/**
 * Verify main navigation elements are visible
 */
export async function verifyNavigationElements(page: Page) {
  // Create button should always be visible
  const createButton = page.getByRole("button", { name: "Create" });
  await expect(createButton).toBeVisible();

  // Check for main navigation items
  const exploreButton = page.getByText("Explore");
  await expect(exploreButton.first()).toBeVisible();

  const assetsButton = page.getByText("Assets");
  await expect(assetsButton.first()).toBeVisible();
}

/**
 * Wait for page content to be visible
 */
export async function waitForContent(page: Page) {
  const pageContent = page.locator(".w-full").first();
  await expect(pageContent).toBeVisible();
}
