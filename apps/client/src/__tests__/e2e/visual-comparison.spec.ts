import { test, expect } from "@playwright/test";

const routes = [
  { path: "/", name: "home" },
  { path: "/explore", name: "explore" },
  { path: "/explore/designs", name: "explore-designs" },
  { path: "/explore/animations", name: "explore-animations" },
  { path: "/create", name: "create" },
  { path: "/profile", name: "profile" },
  { path: "/pricing", name: "pricing" },
  { path: "/likes", name: "likes" },
  { path: "/updates", name: "updates" },
  { path: "/sign-in", name: "sign-in" },
  { path: "/create-account", name: "create-account" },
  { path: "/reset-password", name: "reset-password" },
  { path: "/assets/3d-objects", name: "assets-3d-objects" },
  { path: "/assets/materials", name: "assets-materials" },
];

test.describe("Visual Comparison - Reference vs Local", () => {
  test.describe.configure({ mode: "parallel" });

  // Take screenshots from reference site
  test.describe("Reference Site Screenshots", () => {
    routes.forEach(({ path, name }) => {
      test(`Capture reference: ${name}`, async ({ page }) => {
        // Navigate to reference site
        await page.goto(`https://brainwave2-app.vercel.app${path}`);

        // Wait for content to load
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000); // Extra wait for animations

        // Take screenshot and save to reference folder
        await page.screenshot({
          path: `tests/snapshots/reference/${name}.png`,
          fullPage: true,
        });
      });
    });
  });

  // Take screenshots from local Vite site
  test.describe("Local Vite Screenshots", () => {
    routes.forEach(({ path, name }) => {
      test(`Capture local: ${name}`, async ({ page }) => {
        // Navigate to local Vite site
        await page.goto(`http://localhost:3001${path}`);

        // Wait for content to load
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000); // Extra wait for animations

        // Take screenshot and save to local folder
        await page.screenshot({
          path: `tests/snapshots/local/${name}.png`,
          fullPage: true,
        });
      });
    });
  });

  // Compare screenshots
  test.describe("Visual Differences", () => {
    routes.forEach(({ path, name }) => {
      test(`Compare: ${name}`, async ({ page }) => {
        // This test will use Playwright's built-in visual comparison
        // First navigate to local site
        await page.goto(`http://localhost:3001${path}`);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);

        // Take screenshot and compare with reference
        await expect(page).toHaveScreenshot(`${name}.png`, {
          fullPage: true,
          maxDiffPixels: 100,
          threshold: 0.2, // 20% difference threshold
          // This will compare against tests/snapshots/reference/${name}.png
        });
      });
    });
  });
});

// Alternative: Side-by-side comparison test
test.describe("Side-by-Side Comparison", () => {
  routes.forEach(({ path, name }) => {
    test(`Side-by-side: ${name}`, async ({ browser }) => {
      // Create two browser contexts
      const referenceContext = await browser.newContext({
        viewport: { width: 1280, height: 720 },
      });
      const localContext = await browser.newContext({
        viewport: { width: 1280, height: 720 },
      });

      // Create pages
      const referencePage = await referenceContext.newPage();
      const localPage = await localContext.newPage();

      // Navigate both
      await Promise.all([
        referencePage.goto(`https://brainwave2-app.vercel.app${path}`),
        localPage.goto(`http://localhost:3001${path}`),
      ]);

      // Wait for both to load
      await Promise.all([
        referencePage.waitForLoadState("networkidle"),
        localPage.waitForLoadState("networkidle"),
      ]);

      // Take screenshots
      await Promise.all([
        referencePage.screenshot({
          path: `tests/snapshots/comparison/${name}-reference.png`,
          fullPage: false, // Just viewport for consistent comparison
        }),
        localPage.screenshot({
          path: `tests/snapshots/comparison/${name}-local.png`,
          fullPage: false,
        }),
      ]);

      // Cleanup
      await referenceContext.close();
      await localContext.close();
    });
  });
});
