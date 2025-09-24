/**
 * Image Composite Schema
 * Runtime validation schema for image composite node
 */

import v from "@atomiton/validation";
import type { VInfer } from "@atomiton/validation";
import { baseSchema } from "#schemas/node";

/**
 * Image Composite specific schema (without base fields)
 */
export const imageCompositeSchemaShape = {
  operation: v
    .enum(["overlay", "merge", "composite", "blend"])
    .default("overlay")
    .describe("Type of image composition operation"),

  outputFormat: v
    .enum(["png", "jpeg", "webp", "bmp", "tiff"])
    .default("png")
    .describe("Output image format"),

  quality: v
    .number()
    .min(1)
    .max(100)
    .default(90)
    .describe("Output quality for lossy formats (1-100)"),

  width: v
    .number()
    .positive()
    .optional()
    .describe("Output image width in pixels"),

  height: v
    .number()
    .positive()
    .optional()
    .describe("Output image height in pixels"),

  position: v
    .enum([
      "center",
      "top",
      "bottom",
      "left",
      "right",
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
    ])
    .default("center")
    .describe("Position for overlay operations"),

  opacity: v
    .number()
    .min(0)
    .max(1)
    .default(1)
    .describe("Opacity for overlay/blend operations"),

  blendMode: v
    .enum([
      "normal",
      "multiply",
      "screen",
      "overlay",
      "darken",
      "lighten",
      "color-dodge",
      "color-burn",
    ])
    .default("normal")
    .describe("Blend mode for composition"),

  backgroundColor: v
    .string()
    .default("transparent")
    .describe("Background color for composite operations"),

  maintainAspectRatio: v
    .boolean()
    .default(true)
    .describe("Maintain aspect ratio when resizing"),

  padding: v
    .number()
    .min(0)
    .default(0)
    .describe("Padding around images in pixels"),
};

/**
 * Full Image Composite schema including base fields
 */
export const imageCompositeSchema = baseSchema.extend(
  imageCompositeSchemaShape,
);

/**
 * Type for Image Composite parameters
 */
export type ImageCompositeParameters = VInfer<typeof imageCompositeSchema>;

/**
 * Default export for registry
 */
export default imageCompositeSchemaShape;
