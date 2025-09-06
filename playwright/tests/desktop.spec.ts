import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';

/**
 * Desktop app smoke tests
 * Note: These tests require the desktop app to be built first
 * Run: pnpm --filter @atomiton/desktop build
 */
test.describe.skip('Desktop App', () => {
  test('should launch and display main window', async () => {
    // Skip in CI for now - Electron testing requires special setup
    if (process.env.CI) {
      test.skip();
      return;
    }

    // Path to the Electron app
    const electronApp = await electron.launch({
      args: ['apps/desktop/out/main/index.js'],
    });

    // Get the first window that opens
    const window = await electronApp.firstWindow();
    
    // Wait for window to be ready
    await window.waitForLoadState('domcontentloaded');
    
    // Check window title
    const title = await window.title();
    expect(title).toBeTruthy();
    
    // Take a screenshot for visual verification
    await window.screenshot({ path: 'playwright/screenshots/desktop-main.png' });
    
    // Check that content is loaded
    const isVisible = await window.isVisible();
    expect(isVisible).toBe(true);
    
    // Close the app
    await electronApp.close();
  });

  test('should handle window controls', async () => {
    if (process.env.CI) {
      test.skip();
      return;
    }

    const electronApp = await electron.launch({
      args: ['apps/desktop/out/main/index.js'],
    });

    const window = await electronApp.firstWindow();
    
    // Test minimize/maximize/restore
    const isMaximized = await window.evaluate(() => {
      return new Promise((resolve) => {
        // @ts-ignore - Electron API
        window.api?.isMaximized().then(resolve);
      });
    });
    
    expect(typeof isMaximized).toBe('boolean');
    
    await electronApp.close();
  });
});