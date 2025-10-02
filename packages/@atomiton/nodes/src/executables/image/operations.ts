/**
 * Image Operations
 * Real image processing using Sharp library
 */

import type { NodeExecutionContext } from "#core/utils/executable";
import {
  applyComposite,
  applyFilters,
  applyMultipleComposites,
  applyOutputFormat,
  applyResize,
  createImagePipeline,
  executePipeline,
  getImageMetadata as getSharpMetadata,
} from "#executables/image/sharp-adapters";
import type { ImageParameters } from "#schemas/image";
import type { ImageInput } from "#executables/image/utils";
import * as fs from "fs";

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
 * Get image metadata using Sharp
 */
export async function getImageMetadata(
  imagePath: string,
): Promise<{ width: number; height: number; format: string; size: number }> {
  try {
    const stats = await fs.promises.stat(imagePath);
    const metadata = await getSharpMetadata(imagePath);

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || "unknown",
      size: stats.size,
    };
  } catch (error) {
    throw new Error(
      `Failed to get image metadata: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Perform overlay operation using Sharp
 */
async function performOverlay(
  baseImagePath: string,
  overlayImagePath: string,
  outputPath: string,
  config: ImageParameters,
  context: NodeExecutionContext,
): Promise<void> {
  // Check if input files exist
  if (!(await fileExists(baseImagePath))) {
    throw new Error(`Base image file not found: ${baseImagePath}`);
  }
  if (!(await fileExists(overlayImagePath))) {
    throw new Error(`Overlay image file not found: ${overlayImagePath}`);
  }

  context.log?.info?.("Processing overlay operation", {
    base: baseImagePath,
    overlay: overlayImagePath,
    output: outputPath,
  });

  // Create Sharp pipeline
  let pipeline = createImagePipeline(baseImagePath);

  type ConfigWithExtras = ImageParameters & {
    fit?: "cover" | "contain" | "fill" | "inside" | "outside";
    position?: string;
    blendMode?: string;
    opacity?: number;
    blur?: number;
    sharpen?: boolean;
    grayscale?: boolean;
    quality?: number;
  };
  const configExt = config as ConfigWithExtras;

  // Apply resize if dimensions specified
  if (config.width || config.height) {
    pipeline = applyResize(pipeline, {
      width: config.width as number | undefined,
      height: config.height as number | undefined,
      fit: configExt.fit || "cover",
      position: configExt.position || "center",
    });
  }

  // Apply composite/overlay
  pipeline = applyComposite(pipeline, overlayImagePath, {
    blendMode: configExt.blendMode || "over",
    gravity: configExt.position || "center",
    opacity: configExt.opacity,
  });

  // Apply filters if specified
  pipeline = applyFilters(pipeline, {
    blur: configExt.blur,
    sharpen: configExt.sharpen,
    grayscale: configExt.grayscale,
  });

  // Apply output format
  pipeline = applyOutputFormat(pipeline, {
    format: config.format as "png" | "jpeg" | "webp",
    quality: configExt.quality || 90,
  });

  // Execute pipeline
  await executePipeline(pipeline, outputPath);
}

/**
 * Perform merge operation using Sharp
 */
async function performMerge(
  images: ImageInput[],
  outputPath: string,
  config: ImageParameters,
  context: NodeExecutionContext,
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

  context.log?.info?.("Processing merge operation", {
    imageCount: images.length,
    output: outputPath,
  });

  // Use first image as base
  const baseImage = images[0];
  if (!baseImage.path) {
    throw new Error("First image must have a path");
  }

  type ConfigWithExtras = ImageParameters & {
    fit?: "cover" | "contain" | "fill" | "inside" | "outside";
    position?: string;
    blendMode?: string;
    opacity?: number;
    blur?: number;
    sharpen?: boolean;
    grayscale?: boolean;
    quality?: number;
  };
  const configExt = config as ConfigWithExtras;

  // Create Sharp pipeline with base image
  let pipeline = createImagePipeline(baseImage.path);

  // Apply resize if dimensions specified
  if (config.width || config.height) {
    pipeline = applyResize(pipeline, {
      width: config.width as number | undefined,
      height: config.height as number | undefined,
      fit: configExt.fit || "cover",
      position: configExt.position || "center",
    });
  }

  // Overlay remaining images
  const overlays = images.slice(1).map((img) => ({
    path: img.path!,
    options: {
      blendMode: configExt.blendMode || "over",
      gravity: configExt.position || "center",
    },
  }));

  pipeline = applyMultipleComposites(pipeline, overlays);

  // Apply filters
  pipeline = applyFilters(pipeline, {
    blur: configExt.blur,
    sharpen: configExt.sharpen,
    grayscale: configExt.grayscale,
  });

  // Apply output format
  pipeline = applyOutputFormat(pipeline, {
    format: config.format as "png" | "jpeg" | "webp",
    quality: configExt.quality || 90,
  });

  // Execute pipeline
  await executePipeline(pipeline, outputPath);
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
  config: ImageParameters,
  context: NodeExecutionContext,
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

  context.log?.info?.("Processing composite operation", {
    source: sourceImage.path,
    output: outputPath,
  });

  type ConfigWithExtras = ImageParameters & {
    fit?: "cover" | "contain" | "fill" | "inside" | "outside";
    position?: string;
    blendMode?: string;
    opacity?: number;
    blur?: number;
    sharpen?: boolean;
    grayscale?: boolean;
    quality?: number;
  };
  const configExt = config as ConfigWithExtras;

  // Create Sharp pipeline
  let pipeline = createImagePipeline(sourceImage.path);

  // Apply resize if dimensions specified
  if (config.width || config.height) {
    pipeline = applyResize(pipeline, {
      width: config.width as number | undefined,
      height: config.height as number | undefined,
      fit: configExt.fit || "cover",
      position: configExt.position || "center",
    });
  }

  // Apply filters
  pipeline = applyFilters(pipeline, {
    blur: configExt.blur,
    sharpen: configExt.sharpen,
    grayscale: configExt.grayscale,
  });

  // Apply output format
  pipeline = applyOutputFormat(pipeline, {
    format: config.format as "png" | "jpeg" | "webp",
    quality: configExt.quality || 90,
  });

  // Execute pipeline
  await executePipeline(pipeline, outputPath);
}

/**
 * Perform image composition using Sharp
 */
export async function performImageComposition(
  operation: string,
  inputs: {
    baseImage?: ImageInput;
    overlayImage?: ImageInput;
    images?: ImageInput[];
  },
  outputPath: string,
  config: ImageParameters,
  context: NodeExecutionContext,
): Promise<void> {
  type ConfigWithExtras = ImageParameters & {
    quality?: number;
  };
  const configExt = config as ConfigWithExtras;

  context.log?.info?.(`Performing ${operation} operation`, {
    operation,
    outputFormat: config.format,
    quality: configExt.quality || 90,
    outputPath,
  });

  try {
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
          config,
          context,
        );
        break;

      case "merge":
        if (!inputs.images || inputs.images.length < 2) {
          throw new Error("Merge operation requires at least 2 images");
        }
        await performMerge(inputs.images, outputPath, config, context);
        break;

      case "composite":
      case "blend":
      default:
        await performComposite(inputs, outputPath, config, context);
        break;
    }

    // Verify output was created
    if (!(await fileExists(outputPath))) {
      throw new Error("Failed to create output image");
    }

    context.log?.info?.("Image processing completed successfully", {
      outputPath,
    });
  } catch (error) {
    // Enhanced error handling
    if (error instanceof Error) {
      if (error.message.includes("unsupported image format")) {
        throw new Error(
          `Unsupported image format. Supported: JPEG, PNG, WebP, AVIF, TIFF`,
        );
      } else if (error.message.includes("libvips")) {
        throw new Error(`Image processing failed: ${error.message}`);
      } else {
        throw error;
      }
    }
    throw new Error(`Image processing error: ${String(error)}`);
  }
}
