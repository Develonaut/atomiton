/**
 * Image Composite Schema
 * Parameter validation schema for image composite node
 */

import v from "@atomiton/validation";

/**
 * Image composite parameter schema
 */
export const imageCompositeSchema = {
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
 * Default values for image composite parameters
 */
export const imageCompositeDefaults = {
  operation: "overlay" as const,
  outputFormat: "png" as const,
  quality: 90,
  position: "center" as const,
  opacity: 1,
  blendMode: "normal" as const,
  backgroundColor: "transparent",
  maintainAspectRatio: true,
  padding: 0,
};
