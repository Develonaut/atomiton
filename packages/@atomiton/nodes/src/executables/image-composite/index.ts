/**
 * Image Composite Node Executable
 * Node.js implementation with image processing logic
 */

import { createExecutable } from "#core/utils/executable";
import type { ImageCompositeParameters } from "#schemas/image-composite";
import {
  type ImageInput,
  getImageMetadata,
  performImageComposition,
} from "#executables/image-composite/operations";
import {
  createTempFilePath,
  validateImageInput,
} from "#executables/image-composite/utils";

export type ImageCompositeOutput = {
  result: string;
  imagePath: string;
  width: number;
  height: number;
  format: string;
  size: number;
  success: boolean;
};

/**
 * Image composite node executable
 */
export const imageCompositeExecutable =
  createExecutable<ImageCompositeParameters>(
    "image-composite",
    async ({ getInput, config, context }) => {
      // Get inputs using enhanced helper
      const baseImageInput = getInput<unknown>("baseImage");
      const overlayImageInput = getInput<unknown>("overlayImage");
      const imagesInput = getInput<unknown[]>("images");

      // Validate inputs
      const baseImage = validateImageInput(baseImageInput) || undefined;
      const overlayImage = validateImageInput(overlayImageInput) || undefined;
      const images =
        (imagesInput
          ?.map(validateImageInput)
          .filter(Boolean) as ImageInput[]) || [];

      context.log.info(`Starting image composite operation`, {
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

      // Create output path
      const outputPath = createTempFilePath(config.outputFormat as string);

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

      const output: ImageCompositeOutput = {
        result: outputPath,
        imagePath: outputPath,
        width: finalWidth,
        height: finalHeight,
        format: config.outputFormat as string,
        size: metadata.size,
        success: true,
      };

      context.log.info(`Image composite completed successfully`, {
        outputPath,
        width: finalWidth,
        height: finalHeight,
        format: config.outputFormat,
        size: metadata.size,
      });

      return output;
    },
  );

export default imageCompositeExecutable;
