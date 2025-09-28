/**
 * Image Composite Operations
 * Extracted image processing logic
 */

import type { NodeExecutionContext } from "#core/utils/executable";
import type { ImageCompositeParameters } from "#schemas/image-composite";
import * as fs from "fs";
import * as path from "path";

// Types for image processing
export type ImageInput = {
  path?: string;
  data?: Buffer | string;
  width?: number;
  height?: number;
};

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get image metadata (mock implementation)
 */
export async function getImageMetadata(
  imagePath: string,
): Promise<{ width: number; height: number; format: string; size: number }> {
  try {
    const stats = await fs.promises.stat(imagePath);

    // Mock implementation - in a real scenario, you'd use a library like Sharp
    // to get actual image metadata
    const ext = path.extname(imagePath).toLowerCase();
    let format = "unknown";

    switch (ext) {
      case ".png":
        format = "png";
        break;
      case ".jpg":
      case ".jpeg":
        format = "jpeg";
        break;
      case ".webp":
        format = "webp";
        break;
      case ".bmp":
        format = "bmp";
        break;
      case ".tiff":
      case ".tif":
        format = "tiff";
        break;
      default:
        format = "unknown";
    }

    return {
      width: 1920, // Mock width
      height: 1080, // Mock height
      format,
      size: stats.size,
    };
  } catch (error) {
    throw new Error(
      `Failed to get image metadata: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Perform overlay operation
 */
async function performOverlay(
  baseImagePath: string,
  overlayImagePath: string,
  outputPath: string,
): Promise<void> {
  // Check if input files exist
  if (!(await fileExists(baseImagePath))) {
    throw new Error(`Base image file not found: ${baseImagePath}`);
  }
  if (!(await fileExists(overlayImagePath))) {
    throw new Error(`Overlay image file not found: ${overlayImagePath}`);
  }

  // Mock: copy base image to output (in real implementation, would composite)
  await fs.promises.copyFile(baseImagePath, outputPath);
}

/**
 * Perform merge operation
 */
async function performMerge(
  images: ImageInput[],
  outputPath: string,
): Promise<void> {
  if (!images || images.length < 2) {
    throw new Error("Merge operation requires at least 2 images");
  }

  // Check if all input files exist
  for (const img of images) {
    if (img.path && !(await fileExists(img.path))) {
      throw new Error(`Image file not found: ${img.path}`);
    }
  }

  // Mock: copy first image to output (in real implementation, would merge all)
  const firstImage = images.find((img) => img.path);
  if (firstImage?.path) {
    await fs.promises.copyFile(firstImage.path, outputPath);
  } else {
    throw new Error("No valid image paths found");
  }
}

/**
 * Perform default composite/blend operation
 */
async function performComposite(
  inputs: {
    baseImage?: ImageInput;
    images?: ImageInput[];
  },
  outputPath: string,
): Promise<void> {
  // Use base image if available, otherwise first image from array
  let sourceImage: ImageInput | undefined;

  if (inputs.baseImage?.path) {
    sourceImage = inputs.baseImage;
  } else if (inputs.images && inputs.images.length > 0) {
    sourceImage = inputs.images.find((img) => img.path);
  }

  if (!sourceImage?.path) {
    throw new Error("No valid source image found");
  }

  if (!(await fileExists(sourceImage.path))) {
    throw new Error(`Source image file not found: ${sourceImage.path}`);
  }

  // Mock: copy source image to output (in real implementation, would process)
  await fs.promises.copyFile(sourceImage.path, outputPath);
}

/**
 * Perform image composition (mock implementation)
 */
export async function performImageComposition(
  operation: string,
  inputs: {
    baseImage?: ImageInput;
    overlayImage?: ImageInput;
    images?: ImageInput[];
  },
  outputPath: string,
  config: ImageCompositeParameters,
  context: NodeExecutionContext,
): Promise<void> {
  context.log?.info?.(`Performing ${operation} operation`, {
    operation,
    outputFormat: config.outputFormat,
    quality: config.quality,
    outputPath,
  });

  // Mock implementation - in a real scenario, you'd use a library like Sharp
  // for actual image processing

  switch (operation) {
    case "overlay":
      if (!inputs.baseImage?.path || !inputs.overlayImage?.path) {
        throw new Error(
          "Overlay operation requires both base and overlay images",
        );
      }
      await performOverlay(
        inputs.baseImage.path,
        inputs.overlayImage.path,
        outputPath,
      );
      break;

    case "merge":
      if (!inputs.images) {
        throw new Error("Merge operation requires images array");
      }
      await performMerge(inputs.images, outputPath);
      break;

    case "composite":
    case "blend":
    default:
      await performComposite(inputs, outputPath);
      break;
  }

  // Verify output was created
  if (!(await fileExists(outputPath))) {
    throw new Error("Failed to create output image");
  }
}
