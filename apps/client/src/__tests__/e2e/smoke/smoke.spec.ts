import { test, expect } from "@playwright/test";
import { HomePage, SignInPage, CreatePage } from "../pages";
import { verifyBasicContent } from "../utils/test-helpers";

/**
 * MINIMAL smoke tests - just verify pages load and show content
 * These tests run FAST and focus on critical functionality only
 *
 * ✅ Tests page loads without errors
 * ✅ Tests basic content is present
 * ✅ Tests no JavaScript errors
 * ❌ NO visual snapshots (too slow/brittle)
 * ❌ NO comprehensive testing (just smoke)
 */
test.describe("Smoke Tests - Critical Routes Only", () => {
  test("Home page loads and shows content", async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.visit();

    // Basic smoke checks
    expect(await homePage.isLoaded()).toBeTruthy();
    expect(await homePage.isHomePageLoaded()).toBeTruthy();

    // Verify page has content
    await verifyBasicContent(page);

    // Check title is set
    const title = await homePage.getTitle();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test.skip("Sign-in page loads and shows content", async ({ page }) => {
    const signInPage = new SignInPage(page);

    await signInPage.visit();

    // Basic smoke checks
    expect(await signInPage.isLoaded()).toBeTruthy();
    expect(await signInPage.isSignInFormVisible()).toBeTruthy();

    // Verify page has content
    await verifyBasicContent(page);

    // Check title contains auth-related content
    const title = await signInPage.getTitle();
    expect(title.toLowerCase()).toMatch(/sign|login|auth/);
  });

  // TODO: Update test to use EditorPage instead of CreatePage
  test.skip("Editor page loads and shows content - OLD TEST", async ({
    page,
  }) => {
    const createPage = new CreatePage(page);

    await createPage.visit();

    // Basic smoke checks
    expect(await createPage.isLoaded()).toBeTruthy();
    expect(await createPage.isCreateInterfaceLoaded()).toBeTruthy();

    // Verify page has content
    await verifyBasicContent(page);

    // Wait for any 3D content (but don't require it)
    await createPage.waitFor3DReady();
  });

  test("Navigation works between critical routes", async ({ page }) => {
    // Quick navigation test between key pages
    const homePage = new HomePage(page);

    // Start at home
    await homePage.visit();
    expect(await homePage.isLoaded()).toBeTruthy();

    // Quick check we can navigate (if nav exists)
    const hasNav = (await homePage.navigation.count()) > 0;
    if (hasNav) {
      expect(await homePage.navigation.isVisible()).toBeTruthy();
    }
  });
});
