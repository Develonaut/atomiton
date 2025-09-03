import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility Tests", () => {
  test("Homepage meets accessibility standards", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("Button page meets accessibility standards", async ({ page }) => {
    await page.goto("/buttons");
    await expect(page.locator("h2", { hasText: "Buttons" })).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("Card page meets accessibility standards", async ({ page }) => {
    await page.goto("/cards");
    await expect(page.locator("h2", { hasText: "Cards" })).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("Input page meets accessibility standards", async ({ page }) => {
    await page.goto("/inputs");
    await expect(page.locator("h2", { hasText: "Inputs" })).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("Keyboard navigation works correctly", async ({ page }) => {
    await page.goto("/");

    // Test tab navigation through nav links
    await page.keyboard.press("Tab"); // Should focus first interactive element
    await page.keyboard.press("Tab"); // Should move to next nav item
    await page.keyboard.press("Tab"); // Continue through nav
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Test Enter key navigation
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);

    // Should have navigated to a different page
    const url = page.url();
    expect(url).not.toBe("http://localhost:3000/");
  });

  test("Button focus states are visible", async ({ page }) => {
    await page.goto("/buttons");

    const firstButton = page.locator("button").first();
    await firstButton.focus();

    // Check that focus is visible (button should have focus styles)
    const focusedButton = page.locator("button:focus");
    await expect(focusedButton).toBeVisible();
  });
});
