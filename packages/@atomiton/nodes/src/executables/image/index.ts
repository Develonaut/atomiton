/**
 * Image Node Executable
 * Node.js implementation with image processing logic
 */

import { createExecutable } from "#core/utils/executable";
import type { ImageParameters } from "#schemas/image";
import {
  getImageMetadata,
  performImageComposition,
} from "#executables/image/operations";
import {
  type ImageInput,
  createTempFilePath,
  validateImageInput,
} from "#executables/image/utils";

export type ImageOutput = {
  result: string;
  imagePath: string;
  width: number;
  height: number;
  format: string;
  size: number;
  success: boolean;
};

/**
 * Image node executable
 */
export const imageExecutable = createExecutable<ImageParameters>(
  "image",
  async ({ getInput, config, context }) => {
    // Get inputs using enhanced helper
    const baseImageInput = getInput<unknown>("baseImage");
    const overlayImageInput = getInput<unknown>("overlayImage");
    const imagesInput = getInput<unknown[]>("images");

    // Validate inputs
    const baseImage = validateImageInput(baseImageInput) || undefined;
    const overlayImage = validateImageInput(overlayImageInput) || undefined;
    const images =
      (imagesInput?.map(validateImageInput).filter(Boolean) as ImageInput[]) ||
      [];

    context.log.info(`Starting image operation`, {
      operation: config.operation,
      hasBaseImage: !!baseImage,
      hasOverlayImage: !!overlayImage,
      imageCount: images.length,
    });

    // Validate operation requirements
    if (config.operation === "overlay" && (!baseImage || !overlayImage)) {
      throw new Error(
        "Overlay operation requires both baseImage and overlayImage",
      );
    }

    if (config.operation === "merge" && images.length < 2) {
      throw new Error(
        "Merge operation requires at least 2 images in the images array",
      );
    }

    // Check if we have any valid images
    const hasValidInput =
      baseImage?.path || overlayImage?.path || images.some((img) => img.path);
    if (!hasValidInput) {
      throw new Error("No valid image inputs provided");
    }

    // Use configured output path or create temp file
    const outputPath =
      (config.output as string | undefined) ||
      createTempFilePath(config.format as string);

    // Ensure output directory exists if using configured path
    if (config.output) {
      const fs = await import("fs/promises");
      const path = await import("path");
      const outputDir = path.dirname(config.output as string);
      await fs.mkdir(outputDir, { recursive: true });
    }

    // Perform image composition
    await performImageComposition(
      config.operation as string,
      { baseImage, overlayImage, images },
      outputPath,
      config,
      context,
    );

    // Get output metadata
    const metadata = await getImageMetadata(outputPath);

    // Apply width/height from config if specified
    const finalWidth = (config.width as number) || metadata.width;
    const finalHeight = (config.height as number) || metadata.height;

    const output: ImageOutput = {
      result: outputPath,
      imagePath: outputPath,
      width: finalWidth,
      height: finalHeight,
      format: config.format as string,
      size: metadata.size,
      success: true,
    };

    context.log.info(`Image operation completed successfully`, {
      outputPath,
      width: finalWidth,
      height: finalHeight,
      format: config.format,
      size: metadata.size,
    });

    return output;
  },
);

export default imageExecutable;
