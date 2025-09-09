/**
 * Image Composite Configuration
 *
 * Configuration for image composition and manipulation operations
 */

import { z } from "zod";
import { NodeConfig } from "../../base/NodeConfig";

/**
 * Image Composite specific configuration schema
 */
const imageCompositeSchema = {
  operation: z
    .enum(["composite", "overlay", "merge", "blend"])
    .default("composite")
    .describe("Image composition operation type"),

  outputFormat: z
    .enum(["png", "jpg", "webp", "bmp"])
    .default("png")
    .describe("Output image format"),

  quality: z
    .number()
    .min(1)
    .max(100)
    .default(90)
    .describe("Output image quality (1-100)"),

  width: z.number().positive().optional().describe("Output image width"),

  height: z.number().positive().optional().describe("Output image height"),

  preserveAspectRatio: z
    .boolean()
    .default(true)
    .describe("Whether to preserve aspect ratio"),

  backgroundColor: z
    .string()
    .default("#FFFFFF")
    .describe("Background color for composition"),
};

/**
 * Image Composite Configuration Class
 */
class ImageCompositeConfigClass extends NodeConfig<
  typeof imageCompositeSchema
> {
  constructor() {
    super(imageCompositeSchema, {
      operation: "composite" as const,
      outputFormat: "png" as const,
      quality: 90,
      preserveAspectRatio: true,
      backgroundColor: "#FFFFFF",
    });
  }
}

// Create singleton instance
export const imageCompositeConfig = new ImageCompositeConfigClass();

// Export for backward compatibility and external use
export const imageCompositeConfigSchema = imageCompositeConfig.schema;
export const defaultImageCompositeConfig = imageCompositeConfig.defaults;
export type ImageCompositeConfig = z.infer<typeof imageCompositeConfig.schema>;

// Input/Output schemas for external use
export const ImageCompositeInputSchema = z.object({
  baseImage: z.string().optional(),
  overlayImage: z.string().optional(),
  images: z.array(z.string()).optional(),
  position: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional(),
});

export type ImageCompositeInput = z.infer<typeof ImageCompositeInputSchema>;

export const ImageCompositeOutputSchema = z.object({
  imagePath: z.string(),
  width: z.number(),
  height: z.number(),
  format: z.string(),
  size: z.number(),
  success: z.boolean(),
});

export type ImageCompositeOutput = z.infer<typeof ImageCompositeOutputSchema>;
