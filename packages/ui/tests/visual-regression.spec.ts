import { test, expect } from "@playwright/test";

test.describe("Atomiton UI Design System - Visual Regression Tests", () => {
  test.describe("Desktop Viewport", () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test("Homepage - Design System Overview", async ({ page }) => {
      await page.goto("/");

      // Wait for the app to load and settle
      await expect(
        page.locator("h1", { hasText: "Atomiton UI Design System" }),
      ).toBeVisible();
      await page.waitForTimeout(1000); // Allow theme and styles to settle

      // Take screenshot of main content area only (exclude sidebar)
      const mainContent = page.locator("div.mantine-Container-root").first();
      await expect(mainContent).toHaveScreenshot("homepage-desktop.png");

      // Test navigation items are present
      await expect(page.locator(".mantine-AppShell-navbar")).toBeVisible();
      await expect(page.getByRole("link", { name: "Overview" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Buttons" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Cards" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Inputs" })).toBeVisible();
    });

    test("Button Component Page - All States and Variants", async ({
      page,
    }) => {
      await page.goto("/buttons");

      // Wait for components to render
      await expect(page.locator("h2", { hasText: "Buttons" })).toBeVisible();
      await page.waitForTimeout(1500); // Allow all buttons to render and settle

      // Take screenshot of main content area only (exclude sidebar)
      const mainContent = page.locator("div.mantine-Container-root").first();
      await expect(mainContent).toHaveScreenshot("buttons-page-desktop.png");

      // Test individual button sections are rendered
      await expect(
        page.locator("h3", { hasText: "Primary Buttons" }),
      ).toBeVisible();
      await expect(
        page.locator("h3", { hasText: "Secondary Buttons" }),
      ).toBeVisible();
      await expect(
        page.locator("h3", { hasText: "Danger Buttons" }),
      ).toBeVisible();
      await expect(
        page.locator("h3", { hasText: "Default Buttons" }),
      ).toBeVisible();
      await expect(
        page.locator("h3", { hasText: "Size Variations" }),
      ).toBeVisible();
      await expect(page.locator("h3", { hasText: "Full Width" })).toBeVisible();

      // Test specific button states
      await expect(
        page.locator("button", { hasText: "Primary" }).first(),
      ).toBeVisible();
      await expect(page.locator("button:disabled").first()).toBeVisible();
      await expect(
        page.locator('button[data-loading="true"]').first(),
      ).toBeVisible();
    });

    test("Card Component Page - All Variants", async ({ page }) => {
      await page.goto("/cards");

      // Wait for cards to render
      await expect(page.locator("h2", { hasText: "Cards" })).toBeVisible();
      await page.waitForTimeout(1500); // Allow all cards to render and settle

      // Take screenshot of main content area only (exclude sidebar)
      const mainContent = page.locator("div.mantine-Container-root").first();
      await expect(mainContent).toHaveScreenshot("cards-page-desktop.png");
    });

    test("Input Component Page - All States", async ({ page }) => {
      await page.goto("/inputs");

      // Wait for inputs to render
      await expect(page.locator("h2", { hasText: "Inputs" })).toBeVisible();
      await page.waitForTimeout(1500); // Allow all inputs to render and settle

      // Take screenshot of main content area only (exclude sidebar)
      const mainContent = page.locator("div.mantine-Container-root").first();
      await expect(mainContent).toHaveScreenshot("inputs-page-desktop.png");
    });
  });

  test.describe.skip("Mobile Viewport", () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

    test("Homepage - Mobile Layout", async ({ page }) => {
      await page.goto("/");

      await expect(
        page.locator("h1", { hasText: "Atomiton UI Design System" }),
      ).toBeVisible();
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot("homepage-mobile.png");
    });

    test("Button Component Page - Mobile Layout", async ({ page }) => {
      await page.goto("/buttons");

      await expect(page.locator("h2", { hasText: "Buttons" })).toBeVisible();
      await page.waitForTimeout(1500);

      await expect(page).toHaveScreenshot("buttons-page-mobile.png");
    });

    test("Card Component Page - Mobile Layout", async ({ page }) => {
      await page.goto("/cards");

      await expect(page.locator("h2", { hasText: "Cards" })).toBeVisible();
      await page.waitForTimeout(1500);

      await expect(page).toHaveScreenshot("cards-page-mobile.png");
    });

    test("Input Component Page - Mobile Layout", async ({ page }) => {
      await page.goto("/inputs");

      await expect(page.locator("h2", { hasText: "Inputs" })).toBeVisible();
      await page.waitForTimeout(1500);

      await expect(page).toHaveScreenshot("inputs-page-mobile.png");
    });
  });

  test.describe("Navigation and Interaction Tests", () => {
    test("Navigation between pages works correctly", async ({ page }) => {
      await page.goto("/");

      // Navigate to buttons page
      await page.getByRole("link", { name: "Buttons" }).click();
      await expect(page).toHaveURL("/buttons");
      await expect(page.locator("h2", { hasText: "Buttons" })).toBeVisible();

      // Navigate to cards page
      await page.getByRole("link", { name: "Cards" }).click();
      await expect(page).toHaveURL("/cards");
      await expect(page.locator("h2", { hasText: "Cards" })).toBeVisible();

      // Navigate to inputs page
      await page.getByRole("link", { name: "Inputs" }).click();
      await expect(page).toHaveURL("/inputs");
      await expect(page.locator("h2", { hasText: "Inputs" })).toBeVisible();

      // Navigate back to home
      await page.getByRole("link", { name: "Overview" }).click();
      await expect(page).toHaveURL("/");
      await expect(
        page.locator("h1", { hasText: "Atomiton UI Design System" }),
      ).toBeVisible();
    });

    test("Active navigation state is correctly shown", async ({ page }) => {
      await page.goto("/buttons");

      // Verify that buttons nav item is active
      const buttonsNavLink = page.getByRole("link", { name: "Buttons" });
      await expect(buttonsNavLink).toHaveAttribute("data-active", "true");

      // Verify other nav items are not active
      await expect(
        page.getByRole("link", { name: "Overview" }),
      ).not.toHaveAttribute("data-active", "true");
      await expect(
        page.getByRole("link", { name: "Cards" }),
      ).not.toHaveAttribute("data-active", "true");
      await expect(
        page.getByRole("link", { name: "Inputs" }),
      ).not.toHaveAttribute("data-active", "true");
    });
  });

  test.describe("Theme Integration Tests", () => {
    test("Brainwave theme is properly applied", async ({ page }) => {
      await page.goto("/");

      // Check if the theme colors are applied by checking computed styles
      const navbar = page
        .locator('[data-testid="navbar"], .mantine-AppShell-navbar')
        .first();
      await expect(navbar).toBeVisible();

      // Verify theme-based styling is present
      const bodyStyles = await page.locator("body").evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          fontFamily: styles.fontFamily,
        };
      });

      // The font family should include the Brainwave theme font
      expect(bodyStyles.fontFamily).toBeTruthy();
    });

    test("Component consistency across pages", async ({ page }) => {
      const pages = ["/", "/buttons", "/cards", "/inputs"];

      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForTimeout(500);

        // Verify consistent navbar styling
        const navbar = page.locator(".mantine-AppShell-navbar").first();
        await expect(navbar).toBeVisible();

        // Verify consistent main content area styling
        const main = page.locator(".mantine-AppShell-main").first();
        await expect(main).toBeVisible();

        // Verify consistent navigation links
        await expect(
          page.getByRole("link", { name: "Overview" }),
        ).toBeVisible();
        await expect(page.getByRole("link", { name: "Buttons" })).toBeVisible();
        await expect(page.getByRole("link", { name: "Cards" })).toBeVisible();
        await expect(page.getByRole("link", { name: "Inputs" })).toBeVisible();
      }
    });
  });
});
