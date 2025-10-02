/**
 * Image Sharp Integration Tests
 * Tests real image processing using Sharp library
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import os from "os";
import {
  getImageMetadata,
  performImageComposition,
} from "#executables/image/operations";

const TEST_OUTPUT_DIR = path.join(os.tmpdir(), "atomiton-test-image");

// Helper to create test images
async function createTestImage(
  filename: string,
  width: number,
  height: number,
  color: { r: number; g: number; b: number; alpha: number },
): Promise<string> {
  const outputPath = path.join(TEST_OUTPUT_DIR, filename);
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: color,
    },
  })
    .png()
    .toFile(outputPath);
  return outputPath;
}

// Mock context
const mockContext = {
  log: {
    info: () => {},
    error: () => {},
    warn: () => {},
    debug: () => {},
  },
  nodeId: "test-node",
  executionId: "test-execution",
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  store: {} as any,
  metadata: {},
  inputs: {},
  parameters: {},
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
} as any;

beforeAll(async () => {
  // Create test output directory
  await fs.mkdir(TEST_OUTPUT_DIR, { recursive: true });

  // Create test fixture images
  await createTestImage("test-base.png", 800, 600, {
    r: 255,
    g: 100,
    b: 100,
    alpha: 1,
  });
  await createTestImage("test-overlay.png", 200, 200, {
    r: 100,
    g: 100,
    b: 255,
    alpha: 0.5,
  });
});

afterAll(async () => {
  // Cleanup test outputs
  await fs.rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
});

describe("Image Composite Sharp Integration", () => {
  describe("getImageMetadata", () => {
    it("should return real image dimensions", async () => {
      const imagePath = path.join(TEST_OUTPUT_DIR, "test-base.png");

      const metadata = await getImageMetadata(imagePath);

      expect(metadata.width).toBe(800);
      expect(metadata.height).toBe(600);
      expect(metadata.format).toBe("png");
      expect(metadata.size).toBeGreaterThan(0);
    });

    it("should handle different image formats", async () => {
      // Create a JPEG image
      const jpegPath = path.join(TEST_OUTPUT_DIR, "test.jpg");
      await sharp({
        create: {
          width: 400,
          height: 300,
          channels: 3,
          background: { r: 255, g: 0, b: 0 },
        },
      })
        .jpeg()
        .toFile(jpegPath);

      const metadata = await getImageMetadata(jpegPath);

      expect(metadata.width).toBe(400);
      expect(metadata.height).toBe(300);
      expect(metadata.format).toBe("jpeg");
    });
  });

  describe("performImageComposition - Resize", () => {
    it("should resize image to specified dimensions", async () => {
      const inputPath = path.join(TEST_OUTPUT_DIR, "test-base.png");
      const outputPath = path.join(TEST_OUTPUT_DIR, "resized.jpg");

      await performImageComposition(
        "composite",
        { images: [{ path: inputPath }] },
        outputPath,
        {
          operation: "composite",
          images: [inputPath],
          output: outputPath,
          width: 400,
          height: 300,
          format: "jpeg",
        },
        mockContext,
      );

      // Verify actual file
      const metadata = await sharp(outputPath).metadata();
      expect(metadata.width).toBe(400);
      expect(metadata.height).toBe(300);
      expect(metadata.format).toBe("jpeg");
    });
  });

  describe("performImageComposition - Format Conversion", () => {
    it("should convert PNG to WebP", async () => {
      const inputPath = path.join(TEST_OUTPUT_DIR, "test-base.png");
      const outputPath = path.join(TEST_OUTPUT_DIR, "converted.webp");

      await performImageComposition(
        "composite",
        { images: [{ path: inputPath }] },
        outputPath,
        {
          operation: "composite",
          images: [inputPath],
          output: outputPath,
          format: "webp",
          quality: 85,
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        } as any,
        mockContext,
      );

      const metadata = await sharp(outputPath).metadata();
      expect(metadata.format).toBe("webp");
    });
  });

  describe("performImageComposition - Overlay", () => {
    it("should overlay image on base", async () => {
      const basePath = path.join(TEST_OUTPUT_DIR, "test-base.png");
      const overlayPath = path.join(TEST_OUTPUT_DIR, "test-overlay.png");
      const outputPath = path.join(TEST_OUTPUT_DIR, "overlayed.png");

      await performImageComposition(
        "overlay",
        {
          baseImage: { path: basePath },
          overlayImage: { path: overlayPath },
        },
        outputPath,
        {
          operation: "overlay",
          images: [],
          output: outputPath,
          format: "png",
        },
        mockContext,
      );

      // Verify output exists and has content
      const stats = await fs.stat(outputPath);
      expect(stats.size).toBeGreaterThan(0);

      const metadata = await sharp(outputPath).metadata();
      expect(metadata.format).toBe("png");
    });
  });

  describe("performImageComposition - Merge", () => {
    it("should merge multiple images", async () => {
      const image1Path = path.join(TEST_OUTPUT_DIR, "test-base.png");
      const image2Path = path.join(TEST_OUTPUT_DIR, "test-overlay.png");
      const outputPath = path.join(TEST_OUTPUT_DIR, "merged.png");

      await performImageComposition(
        "merge",
        {
          images: [{ path: image1Path }, { path: image2Path }],
        },
        outputPath,
        {
          operation: "merge",
          images: [image1Path, image2Path],
          output: outputPath,
          format: "png",
        },
        mockContext,
      );

      // Verify output exists
      const stats = await fs.stat(outputPath);
      expect(stats.size).toBeGreaterThan(0);
    });
  });

  describe("performImageComposition - Quality", () => {
    it("should apply quality setting", async () => {
      const inputPath = path.join(TEST_OUTPUT_DIR, "test-base.png");
      const highQualityPath = path.join(TEST_OUTPUT_DIR, "high-quality.jpg");
      const lowQualityPath = path.join(TEST_OUTPUT_DIR, "low-quality.jpg");

      // High quality
      await performImageComposition(
        "composite",
        { images: [{ path: inputPath }] },
        highQualityPath,
        {
          operation: "composite",
          images: [inputPath],
          output: highQualityPath,
          format: "jpeg",
          quality: 95,
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        } as any,
        mockContext,
      );

      // Low quality
      await performImageComposition(
        "composite",
        { images: [{ path: inputPath }] },
        lowQualityPath,
        {
          operation: "composite",
          images: [inputPath],
          output: lowQualityPath,
          format: "jpeg",
          quality: 50,
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        } as any,
        mockContext,
      );

      // High quality should have larger file size
      const highStats = await fs.stat(highQualityPath);
      const lowStats = await fs.stat(lowQualityPath);

      expect(highStats.size).toBeGreaterThan(lowStats.size);
    });
  });

  describe("performImageComposition - Filters", () => {
    it("should apply grayscale filter", async () => {
      const inputPath = path.join(TEST_OUTPUT_DIR, "test-base.png");
      const outputPath = path.join(TEST_OUTPUT_DIR, "grayscale.png");

      await performImageComposition(
        "composite",
        { images: [{ path: inputPath }] },
        outputPath,
        {
          operation: "composite",
          images: [inputPath],
          output: outputPath,
          format: "png",
          grayscale: true,
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        } as any,
        mockContext,
      );

      const stats = await fs.stat(outputPath);
      expect(stats.size).toBeGreaterThan(0);

      const metadata = await sharp(outputPath).metadata();
      expect(metadata.format).toBe("png");
    });

    it("should apply blur filter", async () => {
      const inputPath = path.join(TEST_OUTPUT_DIR, "test-base.png");
      const outputPath = path.join(TEST_OUTPUT_DIR, "blurred.png");

      await performImageComposition(
        "composite",
        { images: [{ path: inputPath }] },
        outputPath,
        {
          operation: "composite",
          images: [inputPath],
          output: outputPath,
          format: "png",
          blur: 5,
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        } as any,
        mockContext,
      );

      const stats = await fs.stat(outputPath);
      expect(stats.size).toBeGreaterThan(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle missing input file", async () => {
      const outputPath = path.join(TEST_OUTPUT_DIR, "should-fail.png");

      await expect(
        performImageComposition(
          "composite",
          { images: [{ path: "/nonexistent/file.png" }] },
          outputPath,
          {
            operation: "composite",
            images: ["/nonexistent/file.png"],
            output: outputPath,
            format: "png",
          },
          mockContext,
        ),
      ).rejects.toThrow();
    });
  });
});
