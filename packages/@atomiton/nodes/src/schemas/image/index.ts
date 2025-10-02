/**
 * Image Schema
 * Runtime validation schema for image node
 */

import v from "@atomiton/validation";
import type { VInfer } from "@atomiton/validation";
import { baseSchema } from "#schemas/node";

/**
 * Image specific schema (without base fields)
 * MVP: Core image processing and composition
 */
export const imageSchemaShape = {
  operation: v
    .enum(["overlay", "merge", "composite", "blend"])
    .default("overlay")
    .describe("Type of image composition operation"),

  images: v
    .array(v.string())
    .min(1)
    .describe("Array of image paths or URLs to composite"),

  output: v.string().describe("Output path for the composed image"),

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

  format: v
    .enum(["png", "jpeg", "webp"])
    .default("png")
    .describe("Output image format"),

  quality: v
    .number()
    .min(1)
    .max(100)
    .default(90)
    .optional()
    .describe("Output image quality (1-100)"),

  fit: v
    .enum(["cover", "contain", "fill", "inside", "outside"])
    .default("cover")
    .optional()
    .describe("How the image should be resized to fit dimensions"),

  position: v
    .enum([
      "center",
      "top",
      "right",
      "bottom",
      "left",
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
    ])
    .default("center")
    .optional()
    .describe("Position for overlay or gravity for resize"),

  blendMode: v
    .enum([
      "clear",
      "source",
      "over",
      "in",
      "out",
      "atop",
      "dest",
      "dest-over",
      "dest-in",
      "dest-out",
      "dest-atop",
      "xor",
      "add",
      "saturate",
      "multiply",
      "screen",
      "overlay",
      "darken",
      "lighten",
      "color-dodge",
      "color-burn",
      "hard-light",
      "soft-light",
      "difference",
      "exclusion",
    ])
    .default("over")
    .optional()
    .describe("Blend mode for composite operations"),

  opacity: v
    .number()
    .min(0)
    .max(1)
    .default(1)
    .optional()
    .describe("Opacity for overlay operations (0-1)"),

  blur: v
    .number()
    .min(0)
    .max(100)
    .optional()
    .describe("Gaussian blur sigma (0-100)"),

  sharpen: v.boolean().optional().describe("Apply sharpening filter"),

  grayscale: v.boolean().optional().describe("Convert to grayscale"),
};

/**
 * Full Image schema including base fields
 */
export const imageSchema = baseSchema.extend(imageSchemaShape);

/**
 * Type for Image parameters
 */
export type ImageParameters = VInfer<typeof imageSchema>;

/**
 * Default export for registry
 */
export default imageSchemaShape;
