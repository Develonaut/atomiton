/**
 * Image Composite Node Executable
 * Node.js implementation with image processing logic
 */

import type {
  NodeExecutable,
  NodeExecutionContext,
  NodeExecutionResult
} from '../../core/types/executable';
import { createNodeExecutable } from '../../core/factories/createNodeExecutable';
import type { ImageCompositeParameters } from '../../definitions/image-composite';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Types for image processing
type ImageInput = {
  path?: string;
  data?: Buffer | string;
  width?: number;
  height?: number;
};

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
function getInputValue<T>(context: NodeExecutionContext, key: string): T | undefined {
  return context.inputs?.[key] as T | undefined;
}

/**
 * Create a temporary file path
 */
function createTempFilePath(extension: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const fileName = `image-composite-${timestamp}-${random}.${extension}`;
  return path.join(os.tmpdir(), fileName);
}

/**
 * Validate image input
 */
function validateImageInput(input: unknown): ImageInput | null {
  if (!input) return null;

  if (typeof input === 'string') {
    return { path: input };
  }

  if (typeof input === 'object' && input !== null) {
    const obj = input as Record<string, unknown>;
    return {
      path: typeof obj.path === 'string' ? obj.path : undefined,
      data: obj.data instanceof Buffer || typeof obj.data === 'string' ? obj.data : undefined,
      width: typeof obj.width === 'number' ? obj.width : undefined,
      height: typeof obj.height === 'number' ? obj.height : undefined,
    };
  }

  return null;
}

/**
 * Check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
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
async function getImageMetadata(imagePath: string): Promise<{ width: number; height: number; format: string; size: number }> {
  try {
    const stats = await fs.promises.stat(imagePath);

    // Mock implementation - in a real scenario, you'd use a library like Sharp
    // to get actual image metadata
    const ext = path.extname(imagePath).toLowerCase();
    let format = 'unknown';

    switch (ext) {
      case '.png': format = 'png'; break;
      case '.jpg':
      case '.jpeg': format = 'jpeg'; break;
      case '.webp': format = 'webp'; break;
      case '.bmp': format = 'bmp'; break;
      case '.tiff':
      case '.tif': format = 'tiff'; break;
      default: format = 'unknown';
    }

    return {
      width: 1920, // Mock width
      height: 1080, // Mock height
      format,
      size: stats.size,
    };
  } catch (error) {
    throw new Error(`Failed to get image metadata: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Perform image composition (mock implementation)
 */
async function performImageComposition(
  operation: string,
  inputs: {
    baseImage?: ImageInput;
    overlayImage?: ImageInput;
    images?: ImageInput[];
  },
  config: ImageCompositeParameters,
  context: NodeExecutionContext
): Promise<string> {
  const outputPath = createTempFilePath(config.outputFormat);

  context.log?.info?.(`Performing ${operation} operation`, {
    operation,
    outputFormat: config.outputFormat,
    quality: config.quality,
    outputPath,
  });

  // Mock implementation - in a real scenario, you'd use a library like Sharp
  // for actual image processing

  switch (operation) {
    case 'overlay':
      if (!inputs.baseImage?.path || !inputs.overlayImage?.path) {
        throw new Error('Overlay operation requires both base and overlay images');
      }

      // Check if input files exist
      if (!(await fileExists(inputs.baseImage.path))) {
        throw new Error(`Base image file not found: ${inputs.baseImage.path}`);
      }
      if (!(await fileExists(inputs.overlayImage.path))) {
        throw new Error(`Overlay image file not found: ${inputs.overlayImage.path}`);
      }

      // Mock: copy base image to output (in real implementation, would composite)
      await fs.promises.copyFile(inputs.baseImage.path, outputPath);
      break;

    case 'merge':
      if (!inputs.images || inputs.images.length < 2) {
        throw new Error('Merge operation requires at least 2 images');
      }

      // Check if all input files exist
      for (const img of inputs.images) {
        if (img.path && !(await fileExists(img.path))) {
          throw new Error(`Image file not found: ${img.path}`);
        }
      }

      // Mock: copy first image to output (in real implementation, would merge all)
      const firstImage = inputs.images.find(img => img.path);
      if (firstImage?.path) {
        await fs.promises.copyFile(firstImage.path, outputPath);
      } else {
        throw new Error('No valid image paths found');
      }
      break;

    case 'composite':
    case 'blend':
    default:
      // Use base image if available, otherwise first image from array
      let sourceImage: ImageInput | undefined;

      if (inputs.baseImage?.path) {
        sourceImage = inputs.baseImage;
      } else if (inputs.images && inputs.images.length > 0) {
        sourceImage = inputs.images.find(img => img.path);
      }

      if (!sourceImage?.path) {
        throw new Error('No valid source image found');
      }

      if (!(await fileExists(sourceImage.path))) {
        throw new Error(`Source image file not found: ${sourceImage.path}`);
      }

      // Mock: copy source image to output (in real implementation, would process)
      await fs.promises.copyFile(sourceImage.path, outputPath);
      break;
  }

  // Verify output was created
  if (!(await fileExists(outputPath))) {
    throw new Error('Failed to create output image');
  }

  return outputPath;
}

/**
 * Image composite node executable
 */
export const imageCompositeExecutable: NodeExecutable<ImageCompositeParameters> = createNodeExecutable({
  async execute(
    context: NodeExecutionContext,
    config: ImageCompositeParameters,
  ): Promise<NodeExecutionResult> {
    try {
      // Get inputs
      const baseImageInput = getInputValue<unknown>(context, "baseImage");
      const overlayImageInput = getInputValue<unknown>(context, "overlayImage");
      const imagesInput = getInputValue<unknown[]>(context, "images");

      // Validate inputs
      const baseImage = validateImageInput(baseImageInput);
      const overlayImage = validateImageInput(overlayImageInput);
      const images = imagesInput?.map(validateImageInput).filter(Boolean) as ImageInput[] || [];

      context.log?.info?.(`Starting image composite operation`, {
        operation: config.operation,
        hasBaseImage: !!baseImage,
        hasOverlayImage: !!overlayImage,
        imageCount: images.length,
      });

      // Validate operation requirements
      if (config.operation === "overlay" && (!baseImage || !overlayImage)) {
        throw new Error("Overlay operation requires both baseImage and overlayImage");
      }

      if (config.operation === "merge" && images.length < 2) {
        throw new Error("Merge operation requires at least 2 images in the images array");
      }

      // Check if we have any valid images
      const hasValidInput = baseImage?.path || overlayImage?.path || images.some(img => img.path);
      if (!hasValidInput) {
        throw new Error("No valid image inputs provided");
      }

      // Perform image composition
      const outputPath = await performImageComposition(
        config.operation,
        { baseImage, overlayImage, images },
        config,
        context
      );

      // Get output metadata
      const metadata = await getImageMetadata(outputPath);

      // Apply width/height from config if specified
      const finalWidth = config.width || metadata.width;
      const finalHeight = config.height || metadata.height;

      const output: ImageCompositeOutput = {
        result: outputPath,
        imagePath: outputPath,
        width: finalWidth,
        height: finalHeight,
        format: config.outputFormat,
        size: metadata.size,
        success: true,
      };

      context.log?.info?.(`Image composite completed successfully`, {
        outputPath,
        width: finalWidth,
        height: finalHeight,
        format: config.outputFormat,
        size: metadata.size,
      });

      return {
        success: true,
        outputs: output,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      context.log?.error?.('Image composite operation failed', {
        error: errorMessage,
        config,
      });

      return {
        success: false,
        error: errorMessage,
        outputs: {
          result: '',
          imagePath: '',
          width: 0,
          height: 0,
          format: config.outputFormat,
          size: 0,
          success: false,
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