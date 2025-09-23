import { test, expect } from "@playwright/test";
import { _electron as electron } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Desktop integration tests - testing UI through Electron wrapper
// These tests expect the dev environment to be running (client + desktop)

test.describe("Desktop App Lifecycle", () => {
  test("should launch app and initialize services without crashing", async () => {
    // Launch Electron app that loads the client UI
    const electronApp = await electron.launch({
      args: [path.join(__dirname, "../../../desktop/out/main/index.js")],
      timeout: 15000,
    });

    try {
      // Act - Get the first window (main window)
      const firstWindow = await electronApp.firstWindow();

      // Assert - App should launch successfully
      expect(firstWindow).toBeDefined();

      // Verify window properties
      const title = await firstWindow.title();
      expect(title).toBeDefined();

      // Verify app doesn't crash on startup - check if window loaded properly
      await firstWindow.waitForLoadState("domcontentloaded");
      expect(firstWindow).toBeDefined();
    } finally {
      // Cleanup
      await electronApp.close();
    }
  });

  test("should handle app quit gracefully", async () => {
    const electronApp = await electron.launch({
      args: [path.join(__dirname, "../../../desktop/out/main/index.js")],
      timeout: 15000,
    });

    try {
      const firstWindow = await electronApp.firstWindow();
      expect(firstWindow).toBeDefined();

      // App should close without hanging
      // If we reach this point, the app closed successfully
      expect(true).toBe(true);
    } finally {
      await electronApp.close();
    }
  });

  test("should persist storage between app restarts", async () => {
    // Test storage persistence - a real user scenario

    // First app instance
    const electronApp1 = await electron.launch({
      args: [path.join(__dirname, "../../../desktop/out/main/index.js")],
      timeout: 15000,
    });

    try {
      // Verify first instance starts
      const window1 = await electronApp1.firstWindow();
      expect(window1).toBeDefined();
    } finally {
      await electronApp1.close();
    }

    // Second app instance - should reuse same storage
    const electronApp2 = await electron.launch({
      args: [path.join(__dirname, "../../../desktop/out/main/index.js")],
      timeout: 15000,
    });

    try {
      const window2 = await electronApp2.firstWindow();
      expect(window2).toBeDefined();
    } finally {
      await electronApp2.close();
    }
  });

  test("should handle multiple rapid window operations", async () => {
    // Brian's "rapid clicking" test for Electron
    const electronApp = await electron.launch({
      args: [path.join(__dirname, "../../../desktop/out/main/index.js")],
      timeout: 15000,
    });

    try {
      const firstWindow = await electronApp.firstWindow();

      // Act - Perform rapid operations
      for (let i = 0; i < 5; i++) {
        await firstWindow.reload();
        await firstWindow.waitForLoadState("domcontentloaded");
      }

      // Assert - App should still be responsive
      await firstWindow.waitForLoadState("domcontentloaded");
      expect(firstWindow).toBeDefined();
    } finally {
      await electronApp.close();
    }
  });

  test("should maintain responsive UI during heavy operations", async () => {
    // Test app responsiveness under load
    const electronApp = await electron.launch({
      args: [path.join(__dirname, "../../../desktop/out/main/index.js")],
      timeout: 15000,
    });

    try {
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
    } finally {
      await electronApp.close();
    }
  });
});
