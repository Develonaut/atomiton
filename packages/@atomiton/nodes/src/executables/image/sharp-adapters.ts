/**
 * Sharp Adapter Functions
 * Wrapper functions for Sharp library operations
 */

import sharp from "sharp";
import type { Sharp, Metadata, OverlayOptions } from "sharp";

export type SharpResizeOptions = {
  width?: number;
  height?: number;
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  position?: string;
};

export type SharpCompositeOptions = {
  blendMode?: string;
  gravity?: string;
  opacity?: number;
};

export type SharpOutputOptions = {
  format: "png" | "jpeg" | "webp";
  quality?: number;
};

export type SharpFilterOptions = {
  blur?: number;
  sharpen?: boolean;
  grayscale?: boolean;
};

/**
 * Get real image metadata using Sharp
 */
export async function getImageMetadata(imagePath: string): Promise<Metadata> {
  return await sharp(imagePath).metadata();
}

/**
 * Create a Sharp pipeline for image processing
 */
export function createImagePipeline(input: string | Buffer): Sharp {
  return sharp(input);
}

/**
 * Resize image with Sharp
 */
export function applyResize(
  pipeline: Sharp,
  options: SharpResizeOptions,
): Sharp {
  if (options.width || options.height) {
    pipeline = pipeline.resize(options.width, options.height, {
      fit: options.fit || "cover",
      position: options.position || "center",
    });
  }
  return pipeline;
}

/**
 * Apply composite/overlay with Sharp
 */
export function applyComposite(
  pipeline: Sharp,
  overlayPath: string,
  options: SharpCompositeOptions,
): Sharp {
  const compositeOptions: OverlayOptions = {
    input: overlayPath,
    blend: (options.blendMode || "over") as OverlayOptions["blend"],
  };

  if (options.gravity) {
    compositeOptions.gravity = options.gravity as OverlayOptions["gravity"];
  }

  return pipeline.composite([compositeOptions]);
}

/**
 * Apply multiple overlays
 */
export function applyMultipleComposites(
  pipeline: Sharp,
  overlays: Array<{ path: string; options: SharpCompositeOptions }>,
): Sharp {
  const composites: OverlayOptions[] = overlays.map(({ path, options }) => ({
    input: path,
    blend: (options.blendMode || "over") as OverlayOptions["blend"],
    gravity: options.gravity as OverlayOptions["gravity"] | undefined,
  }));

  return pipeline.composite(composites);
}

/**
 * Apply filters (blur, sharpen, grayscale)
 */
export function applyFilters(
  pipeline: Sharp,
  options: SharpFilterOptions,
): Sharp {
  if (options.blur && options.blur > 0) {
    pipeline = pipeline.blur(options.blur);
  }

  if (options.sharpen) {
    pipeline = pipeline.sharpen();
  }

  if (options.grayscale) {
    pipeline = pipeline.grayscale();
  }

  return pipeline;
}

/**
 * Apply output format and quality
 */
export function applyOutputFormat(
  pipeline: Sharp,
  options: SharpOutputOptions,
): Sharp {
  switch (options.format) {
    case "jpeg":
      return pipeline.jpeg({ quality: options.quality || 90 });
    case "png":
      return pipeline.png({ quality: options.quality || 90 });
    case "webp":
      return pipeline.webp({ quality: options.quality || 90 });
    default:
      return pipeline;
  }
}

/**
 * Execute pipeline and save to file
 */
export async function executePipeline(
  pipeline: Sharp,
  outputPath: string,
): Promise<void> {
  await pipeline.toFile(outputPath);
}
