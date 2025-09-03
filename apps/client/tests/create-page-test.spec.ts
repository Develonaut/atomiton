import { test, expect } from "@playwright/test";

test.use({
  viewport: { width: 1920, height: 1080 },
});

test.describe("Create Page Layout", () => {
  test("Should display editor layout without overlapping", async ({ page }) => {
    await page.goto("/create");
    await page.waitForLoadState("networkidle");

    // Take screenshot of the full page
    await page.screenshot({
      path: "tests/debug/create-page-full.png",
      fullPage: true,
    });

    // Check if right sidebar is visible
    const rightSidebar = page.locator('[class*="RightSidebar"]').first();
    if ((await rightSidebar.count()) > 0) {
      await rightSidebar.screenshot({
        path: "tests/debug/create-page-sidebar.png",
      });
    }

    // Check for overlapping elements in the Camera section
    const cameraSection = page.locator('text="Camera"').first();
    if ((await cameraSection.count()) > 0) {
      const cameraParent = await cameraSection.locator("..").locator("..");
      await cameraParent.screenshot({
        path: "tests/debug/camera-section.png",
      });
    }
  });
});
