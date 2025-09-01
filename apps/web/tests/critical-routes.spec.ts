import { test, expect } from '@playwright/test';
import { HomePage, SignInPage, CreatePage, ProfilePage } from './pages';
import { takePageSnapshot, VIEWPORTS } from './utils/test-helpers';

test.describe('Critical Routes - Smoke Tests', () => {
  test.describe('Home Page', () => {
    test('should load home page successfully', async ({ page }) => {
      const homePage = new HomePage(page);
      
      await homePage.visit();
      
      // Verify page loaded
      expect(await homePage.isLoaded()).toBeTruthy();
      expect(await homePage.isHomePageLoaded()).toBeTruthy();
      
      // Check title
      const title = await homePage.getTitle();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
    });

    test('should take home page snapshot', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.visit();
      await takePageSnapshot(page, 'home-page.png');
    });

    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      
      const homePage = new HomePage(page);
      await homePage.visit();
      
      expect(await homePage.isLoaded()).toBeTruthy();
      await takePageSnapshot(page, 'home-page-mobile.png');
    });
  });

  test.describe('Sign-in Page', () => {
    test('should load sign-in page successfully', async ({ page }) => {
      const signInPage = new SignInPage(page);
      
      await signInPage.visit();
      
      // Verify page loaded
      expect(await signInPage.isLoaded()).toBeTruthy();
      expect(await signInPage.isSignInFormVisible()).toBeTruthy();
      
      // Check title contains sign-in related content
      const title = await signInPage.getTitle();
      expect(title.toLowerCase()).toMatch(/sign|login|auth/);
    });

    test('should display sign-in form elements', async ({ page }) => {
      const signInPage = new SignInPage(page);
      await signInPage.visit();
      
      // Check form elements are present (but don't interact to avoid auth)
      await expect(signInPage.formContainer).toBeVisible();
    });

    test('should take sign-in page snapshot', async ({ page }) => {
      const signInPage = new SignInPage(page);
      await signInPage.visit();
      await takePageSnapshot(page, 'sign-in-page.png');
    });
  });

  test.describe('Create Page', () => {
    test('should load create page successfully', async ({ page }) => {
      const createPage = new CreatePage(page);
      
      await createPage.visit();
      
      // Verify page loaded
      expect(await createPage.isLoaded()).toBeTruthy();
      expect(await createPage.isCreateInterfaceLoaded()).toBeTruthy();
    });

    test('should wait for 3D content to load', async ({ page }) => {
      const createPage = new CreatePage(page);
      await createPage.visit();
      
      // This test ensures our 3D waiting logic works
      await createPage.waitFor3DReady();
      expect(await createPage.isCreateInterfaceLoaded()).toBeTruthy();
    });

    test('should take create page snapshot', async ({ page }) => {
      const createPage = new CreatePage(page);
      await createPage.visit();
      
      // Wait extra time for 3D content to stabilize
      await createPage.waitFor3DReady();
      await takePageSnapshot(page, 'create-page.png');
    });
  });

  test.describe('Profile Page', () => {
    test('should load profile page successfully', async ({ page }) => {
      const profilePage = new ProfilePage(page);
      
      await profilePage.visit();
      
      // Verify page loaded
      expect(await profilePage.isLoaded()).toBeTruthy();
      expect(await profilePage.isProfileLoaded()).toBeTruthy();
    });

    test('should take profile page snapshot', async ({ page }) => {
      const profilePage = new ProfilePage(page);
      await profilePage.visit();
      await takePageSnapshot(page, 'profile-page.png');
    });

    test('should handle profile content gracefully', async ({ page }) => {
      const profilePage = new ProfilePage(page);
      await profilePage.visit();
      
      // Profile might not have content in test environment, that's okay
      const hasContent = await profilePage.hasUserContent();
      // Just verify we can check for content without errors
      expect(typeof hasContent).toBe('boolean');
    });
  });
});