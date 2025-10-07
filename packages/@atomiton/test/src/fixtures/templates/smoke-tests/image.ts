/**
 * Image Node Smoke Tests
 * Covers resize, format conversion, overlay, merge, and filter operations
 */

export type SmokeTest = {
  name: string;
  config: Record<string, unknown>;
};

// Path to test data files
const repoRoot = import.meta.env.VITE_REPO_ROOT || "../..";
const testImagePath = `${repoRoot}/apps/e2e/test-data/images/sample-photo.png`;
const thumbnailPath = `${repoRoot}/apps/e2e/test-data/images/sample-thumbnail.png`;
const outputDir = "./.tmp/image-tests";

export const imageSmokeTests: SmokeTest[] = [
  {
    name: "resize photo to 400x300",
    config: {
      operation: "composite",
      images: [testImagePath],
      output: `${outputDir}/resized-400x300.jpg`,
      width: 400,
      height: 300,
      format: "jpeg",
      quality: 90,
    },
  },
  {
    name: "convert photo to WebP",
    config: {
      operation: "composite",
      images: [testImagePath],
      output: `${outputDir}/converted.webp`,
      format: "webp",
      quality: 85,
    },
  },
  {
    name: "apply grayscale to photo",
    config: {
      operation: "composite",
      images: [testImagePath],
      output: `${outputDir}/grayscale.png`,
      format: "png",
      grayscale: true,
    },
  },
  {
    name: "apply blur to photo",
    config: {
      operation: "composite",
      images: [testImagePath],
      output: `${outputDir}/blurred.png`,
      format: "png",
      blur: 10,
    },
  },
  {
    name: "resize with cover fit",
    config: {
      operation: "composite",
      images: [testImagePath],
      output: `${outputDir}/cover-500x500.png`,
      width: 500,
      height: 500,
      format: "png",
      fit: "cover",
    },
  },
  {
    name: "resize with contain fit",
    config: {
      operation: "composite",
      images: [testImagePath],
      output: `${outputDir}/contain-500x500.png`,
      width: 500,
      height: 500,
      format: "png",
      fit: "contain",
    },
  },
  {
    name: "merge photo and thumbnail",
    config: {
      operation: "merge",
      images: [testImagePath, thumbnailPath],
      output: `${outputDir}/merged-images.png`,
      format: "png",
    },
  },
  {
    name: "apply sharpen filter",
    config: {
      operation: "composite",
      images: [testImagePath],
      output: `${outputDir}/sharpened.png`,
      format: "png",
      sharpen: true,
    },
  },
  {
    name: "high quality JPEG",
    config: {
      operation: "composite",
      images: [testImagePath],
      output: `${outputDir}/high-quality.jpg`,
      format: "jpeg",
      quality: 95,
    },
  },
  {
    name: "low quality JPEG",
    config: {
      operation: "composite",
      images: [testImagePath],
      output: `${outputDir}/low-quality.jpg`,
      format: "jpeg",
      quality: 50,
    },
  },
];
