import { test, expect } from "@playwright/test";

test.use({
  viewport: { width: 1920, height: 1080 },
});

test.describe("Interactive Dropdown Test", () => {
  test("Inspiration dropdown should open and show Describe option", async ({
    page,
  }) => {
    await page.goto("/create");
    await page.waitForLoadState("networkidle");

    // Find the Inspiration dropdown button
    const dropdownButton = page
      .locator('button:has-text("Inspiration")')
      .first();
    await expect(dropdownButton).toBeVisible();

    // Click to open dropdown
    await dropdownButton.click();

    // Wait a bit for animation
    await page.waitForTimeout(500);

    // Take screenshot after clicking
    await page.screenshot({
      path: "tests/debug/inspiration-opened.png",
      fullPage: false,
    });

    // Check if "Describe" option is visible
    const describeOption = page.getByText("Describe", { exact: true });
    const isDescribeVisible = await describeOption
      .isVisible()
      .catch(() => false);

    console.error("Describe option visible:", isDescribeVisible);

    // Check for any listbox elements
    const listboxes = await page.locator('[role="listbox"]').count();
    console.error("Listbox elements found:", listboxes);

    // Check for elements with data-open attribute
    const openElements = await page.locator("[data-open]").count();
    console.error("Elements with data-open:", openElements);

    // Log all visible text content in dropdown area
    const dropdownArea = page.locator(".fixed.bottom-3");
    const textContent = await dropdownArea.textContent();
    console.error("Dropdown area text:", textContent);
  });

  test("All scenes dropdown in explore page", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");

    // Look for the filter button with chevron
    const filterButton = page
      .locator("button")
      .filter({ hasText: /All scenes|Designs|Animation/ })
      .first();

    if ((await filterButton.count()) > 0) {
      console.error("Found filter button");
      await filterButton.click();
      await page.waitForTimeout(500);

      await page.screenshot({
        path: "tests/debug/filter-opened.png",
        fullPage: false,
      });

      // Check for menu items
      const menuItems = await page
        .locator('[role="menu"], [role="menuitem"]')
        .count();
      console.error("Menu items found:", menuItems);
    } else {
      console.error("Filter button not found");
    }
  });
});
