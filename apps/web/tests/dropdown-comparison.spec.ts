import { test } from "@playwright/test";

test.use({
  viewport: { width: 1920, height: 1080 },
});

test.describe("Dropdown Visual Comparison", () => {
  test("Capture Inspiration dropdown - LOCAL", async ({ page }) => {
    // Navigate to local app
    await page.goto("http://localhost:3001/create");
    await page.waitForLoadState("networkidle");

    // Find and click the Inspiration dropdown
    const dropdown = page.locator('button:has-text("Inspiration")').first();
    await dropdown.click();

    // Wait for animation
    await page.waitForTimeout(500);

    // Take screenshot of the dropdown area
    const promptBar = page.locator(".fixed.bottom-3");
    await promptBar.screenshot({
      path: "tests/debug/inspiration-local-opened.png",
    });

    // Also take full page for context
    await page.screenshot({
      path: "tests/debug/create-local-with-dropdown.png",
      fullPage: false,
    });
  });

  test("Capture Inspiration dropdown - REFERENCE", async ({ page }) => {
    // Navigate to reference app
    await page.goto("https://brainwave2-app.vercel.app/create");
    await page.waitForLoadState("networkidle");

    // Find and click the Inspiration dropdown
    const dropdown = page.locator('button:has-text("Inspiration")').first();
    await dropdown.click();

    // Wait for animation
    await page.waitForTimeout(500);

    // Take screenshot of the dropdown area
    const promptBar = page.locator(".fixed.bottom-3");
    await promptBar.screenshot({
      path: "tests/debug/inspiration-reference-opened.png",
    });

    // Also take full page for context
    await page.screenshot({
      path: "tests/debug/create-reference-with-dropdown.png",
      fullPage: false,
    });
  });

  test("Capture both dropdowns side by side", async ({ page }) => {
    // First capture local
    await page.goto("http://localhost:3001/create");
    await page.waitForLoadState("networkidle");

    const localDropdown = page
      .locator('button:has-text("Inspiration")')
      .first();
    await localDropdown.click();
    await page.waitForTimeout(500);

    // Check what's visible
    const localListbox = page.locator('[role="listbox"]').first();
    const localIsVisible = await localListbox.isVisible().catch(() => false);
    const localBoundingBox = localIsVisible
      ? await localListbox.boundingBox()
      : null;

    console.log("LOCAL dropdown visible:", localIsVisible);
    console.log("LOCAL dropdown position:", localBoundingBox);

    // Now capture reference
    await page.goto("https://brainwave2-app.vercel.app/create");
    await page.waitForLoadState("networkidle");

    const refDropdown = page.locator('button:has-text("Inspiration")').first();
    await refDropdown.click();
    await page.waitForTimeout(500);

    // Check what's visible
    const refListbox = page.locator('[role="listbox"]').first();
    const refIsVisible = await refListbox.isVisible().catch(() => false);
    const refBoundingBox = refIsVisible ? await refListbox.boundingBox() : null;

    console.log("REFERENCE dropdown visible:", refIsVisible);
    console.log("REFERENCE dropdown position:", refBoundingBox);
  });
});
