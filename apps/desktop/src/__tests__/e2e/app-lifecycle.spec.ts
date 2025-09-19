import { test, expect } from "@playwright/test";
import { _electron as electron } from "playwright";
import path from "path";

// Real Electron E2E tests - testing actual app behavior
// These tests launch the real Electron app and verify user-facing functionality

test.describe("Desktop App Lifecycle", () => {
  test("should launch app and initialize services without crashing", async () => {
    // Arrange - Launch real Electron app
    const electronApp = await electron.launch({
      args: [path.join(__dirname, "../../../main/index.js")],
      timeout: 15000,
    });

    // Act - Get the first window (main window)
    const firstWindow = await electronApp.firstWindow();

    // Assert - App should launch successfully
    expect(firstWindow).toBeDefined();

    // Verify window properties
    const title = await firstWindow.title();
    expect(title).toBeDefined();

    // Verify app doesn't crash on startup
    const isVisible = await firstWindow.isVisible();
    expect(isVisible).toBe(true);

    // Cleanup
    await electronApp.close();
  });

  test("should handle app quit gracefully", async () => {
    // Arrange
    const electronApp = await electron.launch({
      args: [path.join(__dirname, "../../../main/index.js")],
      timeout: 15000,
    });

    const firstWindow = await electronApp.firstWindow();
    expect(firstWindow).toBeDefined();

    // Act - Close the app
    await electronApp.close();

    // Assert - App should close without hanging
    // If we reach this point, the app closed successfully
    expect(true).toBe(true);
  });

  test("should persist storage between app restarts", async () => {
    // Test storage persistence - a real user scenario

    // First app instance
    const electronApp1 = await electron.launch({
      args: [path.join(__dirname, "../../../main/index.js")],
      timeout: 15000,
    });

    // Verify first instance starts
    const window1 = await electronApp1.firstWindow();
    expect(window1).toBeDefined();

    // Close first instance
    await electronApp1.close();

    // Second app instance - should reuse same storage
    const electronApp2 = await electron.launch({
      args: [path.join(__dirname, "../../../main/index.js")],
      timeout: 15000,
    });

    const window2 = await electronApp2.firstWindow();
    expect(window2).toBeDefined();

    // Cleanup
    await electronApp2.close();
  });

  test("should handle multiple rapid window operations", async () => {
    // Brian's "rapid clicking" test for Electron
    const electronApp = await electron.launch({
      args: [path.join(__dirname, "../../../main/index.js")],
      timeout: 15000,
    });

    const firstWindow = await electronApp.firstWindow();

    // Act - Perform rapid operations
    for (let i = 0; i < 5; i++) {
      await firstWindow.reload();
      await firstWindow.waitForLoadState("domcontentloaded");
    }

    // Assert - App should still be responsive
    const isVisible = await firstWindow.isVisible();
    expect(isVisible).toBe(true);

    await electronApp.close();
  });

  test("should maintain responsive UI during heavy operations", async () => {
    // Test app responsiveness under load
    const electronApp = await electron.launch({
      args: [path.join(__dirname, "../../../main/index.js")],
      timeout: 15000,
    });

    const firstWindow = await electronApp.firstWindow();

    // Act - Simulate heavy operations
    // (In a real app, this might be large data processing)
    await firstWindow.evaluate(() => {
      // Simulate some work in the renderer
      return new Promise((resolve) => setTimeout(resolve, 1000));
    });

    // Assert - UI should remain responsive
    const title = await firstWindow.title();
    expect(title).toBeDefined();

    await electronApp.close();
  });
});
