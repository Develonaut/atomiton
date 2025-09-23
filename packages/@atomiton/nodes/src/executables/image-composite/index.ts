/**
 * Image Composite Node Executable
 * Node.js implementation with image processing logic
 */

import { createNodeExecutable } from "#core/factories/createNodeExecutable";
import type {
  NodeExecutable,
  NodeExecutionContext,
  NodeExecutionResult,
} from "#core/types/executable";
import type { ImageCompositeParameters } from "#definitions/image-composite";
import {
  type ImageInput,
  getImageMetadata,
  performImageComposition,
} from "./operations";
import { createTempFilePath, validateImageInput } from "./utils";

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
 * Get input value safely
 */
function getInputValue<T>(
  context: NodeExecutionContext,
  key: string
): T | undefined {
  return context.inputs?.[key] as T | undefined;
}

/**
 * Image composite node executable
 */
export const imageCompositeExecutable: NodeExecutable<ImageCompositeParameters> =
  createNodeExecutable({
    async execute(
      context: NodeExecutionContext,
      config: ImageCompositeParameters
    ): Promise<NodeExecutionResult> {
      try {
        // Get inputs
        const baseImageInput = getInputValue<unknown>(context, "baseImage");
        const overlayImageInput = getInputValue<unknown>(
          context,
          "overlayImage"
        );
        const imagesInput = getInputValue<unknown[]>(context, "images");

        // Validate inputs
        const baseImage = validateImageInput(baseImageInput) || undefined;
        const overlayImage = validateImageInput(overlayImageInput) || undefined;
        const images =
          (imagesInput
            ?.map(validateImageInput)
            .filter(Boolean) as ImageInput[]) || [];

        context.log?.info?.(`Starting image composite operation`, {
          operation      : config.operation,
          hasBaseImage   : !!baseImage,
          hasOverlayImage: !!overlayImage,
          imageCount     : images.length,
        });

        // Validate operation requirements
        if (config.operation === "overlay" && (!baseImage || !overlayImage)) {
          throw new Error(
            "Overlay operation requires both baseImage and overlayImage"
          );
        }

        if (config.operation === "merge" && images.length < 2) {
          throw new Error(
            "Merge operation requires at least 2 images in the images array"
          );
        }

        // Check if we have any valid images
        const hasValidInput =
          baseImage?.path ||
          overlayImage?.path ||
          images.some((img) => img.path);
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
          context
        );

        // Get output metadata
        const metadata = await getImageMetadata(outputPath);

        // Apply width/height from config if specified
        const finalWidth = (config.width as number) || metadata.width;
        const finalHeight = (config.height as number) || metadata.height;

        const output: ImageCompositeOutput = {
          result   : outputPath,
          imagePath: outputPath,
          width    : finalWidth,
          height   : finalHeight,
          format   : config.outputFormat as string,
          size     : metadata.size,
          success  : true,
        };

        context.log?.info?.(`Image composite completed successfully`, {
          outputPath,
          width : finalWidth,
          height: finalHeight,
          format: config.outputFormat,
          size  : metadata.size,
        });

        return {
          success: true,
          outputs: output,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        context.log?.error?.("Image composite operation failed", {
          error: errorMessage,
          config,
        });

        return {
          success: false,
          error  : errorMessage,
          outputs: {
            result   : "",
            imagePath: "",
            width    : 0,
            height   : 0,
            format   : config.outputFormat,
            size     : 0,
            success  : false,
          },
        };
      }
    },

    validateConfig(config: unknown): ImageCompositeParameters {
      // In a real implementation, this would validate using the schema
      // For now, just cast it
      return config as ImageCompositeParameters;
    },
  });

export default imageCompositeExecutable;