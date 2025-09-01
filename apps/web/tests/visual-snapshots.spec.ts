import { test, expect } from "@playwright/test";
import {
  waitFor3DContent,
  takePageSnapshot,
  waitForPageLoad,
  VIEWPORTS,
} from "./utils/test-helpers";

test.describe("Visual Snapshot Tests", () => {
  // Configure longer timeouts for 3D/animation content
  test.setTimeout(60000);

  test.describe("3D and Animation Pages", () => {
    test("should capture explore page with animations", async ({ page }) => {
      await page.goto("/explore");
      await waitFor3DContent(page);

      // Wait for any loading animations to complete
      await page
        .waitForSelector('[data-testid="loading"]', { state: "hidden" })
        .catch(() => {});

      await takePageSnapshot(page, "explore-page.png");
    });

    test("should capture explore animations page", async ({ page }) => {
      await page.goto("/explore/animations");
      await waitFor3DContent(page);

      // Additional wait for animation content to load
      await page.waitForTimeout(3000);

      await takePageSnapshot(page, "explore-animations.png");
    });

    test("should capture explore designs page", async ({ page }) => {
      await page.goto("/explore/designs");
      await waitFor3DContent(page);

      await takePageSnapshot(page, "explore-designs.png");
    });

    test("should capture create page with 3D interface", async ({ page }) => {
      await page.goto("/create");
      await waitFor3DContent(page);

      // Ensure 3D canvas is ready
      const canvas = page.locator("canvas").first();
      if (await canvas.isVisible()) {
        await page.waitForTimeout(2000); // Additional time for WebGL rendering
      }

      await takePageSnapshot(page, "create-page-3d.png");
    });
  });

  test.describe("Asset Pages", () => {
    test("should capture 3D objects asset page", async ({ page }) => {
      await page.goto("/assets/3d-objects");
      await waitForPageLoad(page);

      // Wait for asset previews to load
      await page
        .waitForSelector("img, canvas", { timeout: 10000 })
        .catch(() => {});
      await page.waitForTimeout(2000);

      await takePageSnapshot(page, "assets-3d-objects.png");
    });

    test("should capture materials asset page", async ({ page }) => {
      await page.goto("/assets/materials");
      await waitForPageLoad(page);

      // Wait for material previews to load
      await page.waitForTimeout(2000);

      await takePageSnapshot(page, "assets-materials.png");
    });
  });

  test.describe("Responsive Snapshots", () => {
    const pages = [
      { url: "/", name: "home" },
      { url: "/explore", name: "explore" },
      { url: "/create", name: "create" },
      { url: "/profile", name: "profile" },
    ];

    for (const pageInfo of pages) {
      test(`should capture ${pageInfo.name} page on tablet`, async ({
        page,
      }) => {
        await page.setViewportSize(VIEWPORTS.tablet);
        await page.goto(pageInfo.url);

        if (pageInfo.name === "create" || pageInfo.name === "explore") {
          await waitFor3DContent(page);
        } else {
          await waitForPageLoad(page);
        }

        await takePageSnapshot(page, `${pageInfo.name}-tablet.png`);
      });

      test(`should capture ${pageInfo.name} page on desktop`, async ({
        page,
      }) => {
        await page.setViewportSize(VIEWPORTS.desktop);
        await page.goto(pageInfo.url);

        if (pageInfo.name === "create" || pageInfo.name === "explore") {
          await waitFor3DContent(page);
        } else {
          await waitForPageLoad(page);
        }

        await takePageSnapshot(page, `${pageInfo.name}-desktop.png`);
      });
    }
  });

  test.describe("State-based Snapshots", () => {
    test("should capture loading states", async ({ page }) => {
      // Throttle network to capture loading state
      await page.route("**/*", (route) => {
        setTimeout(() => route.continue(), 100);
      });

      await page.goto("/create");

      // Try to capture loading state (might not always be visible)
      const loadingElement = page
        .locator('[data-testid="loading"], .loading, .spinner')
        .first();
      const isLoadingVisible = await loadingElement
        .isVisible()
        .catch(() => false);

      if (isLoadingVisible) {
        await expect(page).toHaveScreenshot("loading-state.png");
      }

      // Continue to fully loaded state
      await waitFor3DContent(page);
      await takePageSnapshot(page, "create-loaded-state.png");
    });

    test("should capture error states gracefully", async ({ page }) => {
      // Test error handling by going to non-existent route
      await page.goto("/non-existent-route");
      await waitForPageLoad(page);

      // Check if we get a proper 404 or error page
      const pageContent = await page.textContent("body");
      if (
        pageContent &&
        (pageContent.includes("404") || pageContent.includes("Not Found"))
      ) {
        await takePageSnapshot(page, "error-404.png");
      }
    });
  });
});
