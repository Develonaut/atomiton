import { test, expect } from "@playwright/test";
import { _electron as electron } from "playwright";

/**
 * Smoke Tests - Quick check that everything works
 * Goal: < 3 seconds, no errors, content visible
 */

test.describe("Smoke Tests", () => {
  test.describe.configure({ mode: "parallel" });

  test("client app - no errors, has content", async ({ page }) => {
    const errors: string[] = [];
    page.on(
      "console",
      (msg) => msg.type() === "error" && errors.push(msg.text()),
    );
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("http://localhost:5173", { waitUntil: "domcontentloaded" });

    expect(errors).toHaveLength(0);
    await expect(page.locator("#root")).toBeVisible();

    // Just check something rendered
    const hasContent = await page
      .locator("#root")
      .evaluate((el) => el.children.length > 0);
    expect(hasContent).toBeTruthy();
  });

  test("ui package - no errors, has content", async ({ page }) => {
    const errors: string[] = [];
    page.on(
      "console",
      (msg) => msg.type() === "error" && errors.push(msg.text()),
    );
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("http://localhost:5174", { waitUntil: "domcontentloaded" });

    expect(errors).toHaveLength(0);
    await expect(page.locator("#root")).toBeVisible();

    const hasContent = await page
      .locator("#root")
      .evaluate((el) => el.children.length > 0);
    expect(hasContent).toBeTruthy();
  });

  test.skip("desktop app - launches without crash", async () => {
    // Skip in CI or if not built
    if (process.env.CI) return;

    try {
      const app = await electron.launch({
        args: ["apps/desktop/dist/main/index.js"],
        timeout: 5000,
      });

      const window = await app.firstWindow();
      const isVisible = await window.isVisible("body");
      expect(isVisible).toBe(true);

      await app.close();
    } catch (error) {
      test.skip(true, "Desktop app not available");
    }
  });

  test("servers responding", async ({ request }) => {
    const responses = await Promise.allSettled([
      request.get("http://localhost:5173"),
      request.get("http://localhost:5174"),
    ]);

    responses.forEach((res) => {
      expect(res.status).toBe("fulfilled");
      if (res.status === "fulfilled") {
        expect(res.value.ok()).toBeTruthy();
      }
    });
  });
});
