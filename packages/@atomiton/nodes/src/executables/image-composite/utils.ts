/**
 * Image Composite Utilities
 * Helper functions for image processing
 */

import * as os from "os";
import * as path from "path";

/**
 * Create a temporary file path
 */
export function createTempFilePath(extension: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const fileName = `image-composite-${timestamp}-${random}.${extension}`;
  return path.join(os.tmpdir(), fileName);
}

/**
 * Validate image input
 */
export function validateImageInput(input: unknown): ImageInput | null {
  if (!input) return null;

  if (typeof input === "string") {
    return { path: input };
  }

  if (typeof input === "object" && input !== null) {
    const obj = input as Record<string, unknown>;
    return {
      path: typeof obj.path === "string" ? obj.path : undefined,
      data:
        obj.data instanceof Buffer || typeof obj.data === "string"
          ? obj.data
          : undefined,
      width: typeof obj.width === "number" ? obj.width : undefined,
      height: typeof obj.height === "number" ? obj.height : undefined,
    };
  }

  return null;
}

// Type for image input
export type ImageInput = {
  path?: string;
  data?: Buffer | string;
  width?: number;
  height?: number;
};
