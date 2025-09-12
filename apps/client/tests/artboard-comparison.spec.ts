import { test } from "@playwright/test";

test.use({
  viewport: { width: 1920, height: 1080 },
});

test.describe("Artboard Section Comparison", () => {
  test("Capture Artboard section - LOCAL", async ({ page }) => {
    await page.goto("http://localhost:3001/create");
    await page.waitForLoadState("networkidle");

    // Find the Artboard section
    const artboardSection = page
      .locator('text="Artboard"')
      .first()
      .locator("..")
      .locator("..");

    // Take screenshot of just the Artboard section
    await artboardSection.screenshot({
      path: "tests/debug/artboard-local.png",
    });

    // Also try clicking the X Post dropdown to see if it opens
    const dropdown = page.locator('text="X Post"').first();
    if ((await dropdown.count()) > 0) {
      await dropdown.click();
      await page.waitForTimeout(500);

      // Take screenshot after clicking
      await artboardSection.screenshot({
        path: "tests/debug/artboard-local-dropdown-open.png",
      });

      // Check if any options are visible
      const listbox = page.locator('[role="listbox"]');
      const optionsCount = await listbox.locator('[role="option"]').count();
      console.error("LOCAL - Dropdown options found:", optionsCount);
    }
  });

  test("Capture Artboard section - REFERENCE", async ({ page }) => {
    await page.goto("https://brainwave2-app.vercel.app/create");
    await page.waitForLoadState("networkidle");

    // Find the Artboard section
    const artboardSection = page
      .locator('text="Artboard"')
      .first()
      .locator("..")
      .locator("..");

    // Take screenshot of just the Artboard section
    await artboardSection.screenshot({
      path: "tests/debug/artboard-reference.png",
    });

    // Also try clicking the X Post dropdown to see if it opens
    const dropdown = page.locator('text="X Post"').first();
    if ((await dropdown.count()) > 0) {
      await dropdown.click();
      await page.waitForTimeout(500);

      // Take screenshot after clicking
      await artboardSection.screenshot({
        path: "tests/debug/artboard-reference-dropdown-open.png",
      });

      // Check if any options are visible
      const listbox = page.locator('[role="listbox"]');
      const optionsCount = await listbox.locator('[role="option"]').count();
      console.error("REFERENCE - Dropdown options found:", optionsCount);
    }
  });

  test("Capture full sidebar comparison", async ({ page }) => {
    // LOCAL
    await page.goto("http://localhost:3001/create");
    await page.waitForLoadState("networkidle");

    const localSidebar = page.locator(".fixed.right-0.top-0.bottom-0").first();
    await localSidebar.screenshot({
      path: "tests/debug/sidebar-local-full.png",
    });

    // REFERENCE
    await page.goto("https://brainwave2-app.vercel.app/create");
    await page.waitForLoadState("networkidle");

    const refSidebar = page.locator(".fixed.right-0.top-0.bottom-0").first();
    await refSidebar.screenshot({
      path: "tests/debug/sidebar-reference-full.png",
    });
  });
});
