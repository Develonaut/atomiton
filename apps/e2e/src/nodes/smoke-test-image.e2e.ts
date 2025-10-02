/**
 * Image Node Smoke Test E2E
 * Validates tangible results from image smoke tests
 */

import { test, expect } from "#fixtures/electron";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

// Files are created relative to repo root, not e2e directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../../../..");

// Run image tests serially to avoid race conditions
test.describe.configure({ mode: "serial" });

test.describe("Image Smoke Tests", () => {
  test.beforeAll(async () => {
    // Create output directory for test results (relative to repo root)
    const fs = await import("fs/promises");
    const outputDir = path.join(repoRoot, ".tmp/image-tests");
    await fs.mkdir(outputDir, { recursive: true });
  });

  test.beforeEach(async ({ electronPage }) => {
    await electronPage.goto("http://localhost:5173/debug/nodes", {
      waitUntil: "domcontentloaded",
    });
    await electronPage
      .locator('[data-testid="node-type-selector"]')
      .waitFor({ state: "visible", timeout: 10000 });

    // Select image node
    await electronPage.locator('[data-testid="node-type-selector"]').click();
    await electronPage.getByRole("option", { name: "image" }).click();
  });

  test("validates resize photo to 400x300", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-image-resize-photo-to-400x300"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    expect(dataOutput).toBeTruthy();

    const result = JSON.parse(dataOutput!);

    expect(result.success).toBe(true);
    expect(result.data.width).toBe(400);
    expect(result.data.height).toBe(300);
    expect(result.data.format).toBe("jpeg");

    // Verify actual file was created (relative to repo root)
    const outputPath = path.join(
      repoRoot,
      ".tmp/image-tests/resized-400x300.jpg",
    );
    expect(existsSync(outputPath)).toBe(true);

    // Verify image dimensions using Sharp
    const metadata = await sharp(outputPath).metadata();
    expect(metadata.width).toBe(400);
    expect(metadata.height).toBe(300);
    expect(metadata.format).toBe("jpeg");
  });

  test("validates convert photo to WebP", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-image-convert-photo-to-WebP"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.success).toBe(true);
    expect(result.data.format).toBe("webp");

    // Verify actual file was created (relative to repo root)
    const outputPath = path.join(repoRoot, ".tmp/image-tests/converted.webp");
    expect(existsSync(outputPath)).toBe(true);

    // Verify format conversion
    const metadata = await sharp(outputPath).metadata();
    expect(metadata.format).toBe("webp");
  });

  test("validates apply grayscale to photo", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-image-apply-grayscale-to-photo"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.success).toBe(true);
    expect(result.data.format).toBe("png");

    // Verify actual file was created (relative to repo root)
    const outputPath = path.join(repoRoot, ".tmp/image-tests/grayscale.png");
    expect(existsSync(outputPath)).toBe(true);

    // Verify file exists and has content
    const metadata = await sharp(outputPath).metadata();
    expect(metadata.format).toBe("png");
  });

  test("validates apply blur to photo", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-image-apply-blur-to-photo"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.success).toBe(true);

    // Verify actual file was created (relative to repo root)
    const outputPath = path.join(repoRoot, ".tmp/image-tests/blurred.png");
    expect(existsSync(outputPath)).toBe(true);
  });

  test("validates resize with cover fit", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-image-resize-with-cover-fit"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.success).toBe(true);
    expect(result.data.width).toBe(500);
    expect(result.data.height).toBe(500);

    // Verify actual dimensions (relative to repo root)
    const outputPath = path.join(
      repoRoot,
      ".tmp/image-tests/cover-500x500.png",
    );
    const metadata = await sharp(outputPath).metadata();
    expect(metadata.width).toBe(500);
    expect(metadata.height).toBe(500);
  });

  test("validates resize with contain fit", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-image-resize-with-contain-fit"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.success).toBe(true);

    // Verify file was created (relative to repo root)
    const outputPath = path.join(
      repoRoot,
      ".tmp/image-tests/contain-500x500.png",
    );
    expect(existsSync(outputPath)).toBe(true);
  });

  test("validates merge photo and thumbnail", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-image-merge-photo-and-thumbnail"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.success).toBe(true);

    // Verify merged file was created (relative to repo root)
    const outputPath = path.join(
      repoRoot,
      ".tmp/image-tests/merged-images.png",
    );
    expect(existsSync(outputPath)).toBe(true);

    // Verify the merged image has content
    const metadata = await sharp(outputPath).metadata();
    expect(metadata.format).toBe("png");
  });

  test("validates apply sharpen filter", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-image-apply-sharpen-filter"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.success).toBe(true);

    // Verify sharpened file was created (relative to repo root)
    const outputPath = path.join(repoRoot, ".tmp/image-tests/sharpened.png");
    expect(existsSync(outputPath)).toBe(true);

    // Verify the sharpened image has content
    const metadata = await sharp(outputPath).metadata();
    expect(metadata.format).toBe("png");
  });

  test("validates high quality JPEG", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-image-high-quality-JPEG"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.success).toBe(true);
    expect(result.data.format).toBe("jpeg");

    // Verify file was created (relative to repo root)
    const outputPath = path.join(repoRoot, ".tmp/image-tests/high-quality.jpg");
    expect(existsSync(outputPath)).toBe(true);
  });

  test("validates low quality JPEG", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-image-low-quality-JPEG"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.success).toBe(true);

    // Verify file was created and is smaller than high quality (relative to repo root)
    const lowQualityPath = path.join(
      repoRoot,
      ".tmp/image-tests/low-quality.jpg",
    );
    const highQualityPath = path.join(
      repoRoot,
      ".tmp/image-tests/high-quality.jpg",
    );
    expect(existsSync(lowQualityPath)).toBe(true);

    // Compare file sizes (low quality should be smaller)
    const fs = await import("fs/promises");
    const highQualityStats = await fs.stat(highQualityPath);
    const lowQualityStats = await fs.stat(lowQualityPath);
    expect(lowQualityStats.size).toBeLessThan(highQualityStats.size);
  });

  test("all smoke tests pass", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const logs = electronPage.locator('[data-testid="debug-logs"]');
    await expect(logs).toContainText("📊 Results: 10/10 passed", {
      timeout: 10000,
    });
  });
});
