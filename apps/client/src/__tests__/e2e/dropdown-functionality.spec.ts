import { test, expect } from "@playwright/test";

test.describe("Dropdown Functionality", () => {
  test("All scenes dropdown should open and show options", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");

    // Find and click the "All scenes" dropdown
    const dropdown = page.getByText("All scenes").first();
    await expect(dropdown).toBeVisible();
    await dropdown.click();

    // Check if dropdown options are visible
    await expect(page.getByText("Designs")).toBeVisible();
    await expect(page.getByText("Animation")).toBeVisible();

    // Take screenshot for debugging
    await page.screenshot({ path: "tests/debug/all-scenes-dropdown.png" });
  });

  test("Inspiration dropdown should open on explore page", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");

    // Find and click the "Inspiration" dropdown in the prompt bar
    const inspirationDropdown = page.getByText("Inspiration").first();
    await expect(inspirationDropdown).toBeVisible();
    await inspirationDropdown.click();

    // Check if "Describe" option is visible
    await expect(page.getByText("Describe")).toBeVisible();

    // Take screenshot for debugging
    await page.screenshot({ path: "tests/debug/inspiration-dropdown.png" });
  });

  test("Brainwave 2.5 dropdown should open", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");

    // Find and click the "Brainwave 2.5" dropdown
    const brainwaveDropdown = page.getByText("Brainwave 2.5").first();
    await expect(brainwaveDropdown).toBeVisible();
    await brainwaveDropdown.click();

    // Wait for dropdown menu to appear
    await page.waitForTimeout(500); // Give animation time

    // Take screenshot for debugging
    await page.screenshot({
      path: "tests/debug/brainwave-dropdown.png",
      fullPage: true,
    });

    // Check if any dropdown content is visible
    const dropdownContent = page.locator(
      '[role="listbox"], [data-open], .data-open',
    );
    const count = await dropdownContent.count();
    console.error(`Found ${count} dropdown elements`);
  });

  test("Check dropdown data attributes", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");

    // Before clicking - log initial state
    const allScenesButton = page
      .locator('button:has-text("All scenes")')
      .first();
    const initialAttributes = await allScenesButton.evaluate((el) => {
      return {
        dataOpen: el.getAttribute("data-open"),
        dataClosed: el.getAttribute("data-closed"),
        dataState: el.getAttribute("data-state"),
        dataHeadlessuiState: el.getAttribute("data-headlessui-state"),
        classList: el.className,
      };
    });
    console.error("Initial button attributes:", initialAttributes);

    // Click the dropdown
    await allScenesButton.click();
    await page.waitForTimeout(500);

    // After clicking - log state
    const afterClickAttributes = await allScenesButton.evaluate((el) => {
      return {
        dataOpen: el.getAttribute("data-open"),
        dataClosed: el.getAttribute("data-closed"),
        dataState: el.getAttribute("data-state"),
        dataHeadlessuiState: el.getAttribute("data-headlessui-state"),
        classList: el.className,
      };
    });
    console.error("After click attributes:", afterClickAttributes);

    // Check for dropdown menu
    const dropdownMenu = page.locator('[role="menu"], [role="listbox"]');
    const menuCount = await dropdownMenu.count();
    console.error(`Found ${menuCount} dropdown menus`);

    if (menuCount > 0) {
      const menuAttributes = await dropdownMenu.first().evaluate((el) => {
        return {
          role: el.getAttribute("role"),
          dataOpen: el.getAttribute("data-open"),
          dataClosed: el.getAttribute("data-closed"),
          classList: el.className,
          style: el.getAttribute("style"),
          isVisible: (el as HTMLElement).offsetParent !== null,
        };
      });
      console.error("Menu attributes:", menuAttributes);
    }
  });
});
