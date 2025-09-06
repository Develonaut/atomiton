import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test.describe('Client App', () => {
    test('should load and display main navigation', async ({ page }) => {
      // Navigate to client app
      await page.goto('http://localhost:5173');
      
      // Wait for app to load
      await page.waitForLoadState('networkidle');
      
      // Check that the app root is rendered
      await expect(page.locator('#root')).toBeVisible();
      
      // Check for key UI elements that indicate the app loaded
      // These selectors may need adjustment based on actual app structure
      const appContent = page.locator('#root > div').first();
      await expect(appContent).toBeVisible();
      
      // Verify no console errors
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Give it a moment to catch any delayed errors
      await page.waitForTimeout(1000);
      expect(consoleErrors).toHaveLength(0);
    });

    test('should navigate between routes', async ({ page }) => {
      await page.goto('http://localhost:5173');
      
      // Check initial route loads
      await expect(page).toHaveURL(/http:\/\/localhost:5173/);
      
      // Try navigating if there are navigation elements
      // This is a placeholder - adjust based on actual navigation
      const navLinks = page.locator('a[href^="/"]');
      const linkCount = await navLinks.count();
      
      if (linkCount > 0) {
        // Click first internal link
        await navLinks.first().click();
        
        // Verify navigation occurred
        await page.waitForLoadState('networkidle');
        
        // Should still be on the same domain
        await expect(page).toHaveURL(/http:\/\/localhost:5173/);
      }
    });
  });

  test.describe('UI Package', () => {
    test('should load UI component showcase', async ({ page }) => {
      // Navigate to UI package dev server
      await page.goto('http://localhost:5174');
      
      // Wait for app to load
      await page.waitForLoadState('networkidle');
      
      // Check that the app root is rendered
      await expect(page.locator('#root')).toBeVisible();
      
      // UI package should show component examples
      const appContent = page.locator('#root > div').first();
      await expect(appContent).toBeVisible();
      
      // Verify no console errors
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      await page.waitForTimeout(1000);
      expect(consoleErrors).toHaveLength(0);
    });

    test('should render Button component if exported', async ({ page }) => {
      await page.goto('http://localhost:5174');
      
      // Check if any buttons are rendered in the showcase
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      // If buttons exist, verify they're interactive
      if (buttonCount > 0) {
        const firstButton = buttons.first();
        await expect(firstButton).toBeVisible();
        
        // Check button is interactive
        const isDisabled = await firstButton.isDisabled();
        if (!isDisabled) {
          // Hover to check for hover states
          await firstButton.hover();
          
          // Click to verify it's clickable
          await firstButton.click();
        }
      }
    });
  });

  test.describe('Health Checks', () => {
    test('should respond to health check endpoints', async ({ request }) => {
      // Check client app is responding
      const clientResponse = await request.get('http://localhost:5173');
      expect(clientResponse.ok()).toBeTruthy();
      expect(clientResponse.status()).toBe(200);
      
      // Check UI package is responding
      const uiResponse = await request.get('http://localhost:5174');
      expect(uiResponse.ok()).toBeTruthy();
      expect(uiResponse.status()).toBe(200);
    });

    test('should serve static assets', async ({ request }) => {
      // Check if Vite is serving assets properly
      const clientViteResponse = await request.get('http://localhost:5173/@vite/client');
      expect(clientViteResponse.ok()).toBeTruthy();
      
      const uiViteResponse = await request.get('http://localhost:5174/@vite/client');
      expect(uiViteResponse.ok()).toBeTruthy();
    });
  });
});