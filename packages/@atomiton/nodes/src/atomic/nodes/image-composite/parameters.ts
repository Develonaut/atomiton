/**
 * Image Composite Node Parameters
 *
 * Parameter schema for image composition and manipulation operations
 */

import { z } from "zod";
import { createAtomicParameters } from "../../createAtomicParameters";

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

export const imageCompositeParameters = createAtomicParameters(
  imageCompositeSchema,
  {
    operation: "composite" as const,
    outputFormat: "png" as const,
    quality: 90,
    preserveAspectRatio: true,
    backgroundColor: "#FFFFFF",
  },
  {
    operation: {
      controlType: "select",
      label: "Composite Operation",
      helpText: "Type of image composition operation to perform",
      options: [
        { value: "composite", label: "Composite - Layer images" },
        { value: "overlay", label: "Overlay - Blend images" },
        { value: "merge", label: "Merge - Combine images" },
        { value: "blend", label: "Blend - Mix images" },
      ],
    },
    outputFormat: {
      controlType: "select",
      label: "Output Format",
      helpText: "Output image file format",
      options: [
        { value: "png", label: "PNG - Lossless with transparency" },
        { value: "jpg", label: "JPG - Compressed format" },
        { value: "webp", label: "WebP - Modern format" },
        { value: "bmp", label: "BMP - Bitmap format" },
      ],
    },
    quality: {
      controlType: "range",
      label: "Image Quality",
      placeholder: "90",
      helpText: "Output image quality from 1 (lowest) to 100 (highest)",
      min: 1,
      max: 100,
      step: 1,
    },
    width: {
      controlType: "number",
      label: "Output Width",
      placeholder: "1920",
      helpText: "Output image width in pixels (optional)",
      min: 1,
    },
    height: {
      controlType: "number",
      label: "Output Height",
      placeholder: "1080",
      helpText: "Output image height in pixels (optional)",
      min: 1,
    },
    preserveAspectRatio: {
      controlType: "boolean",
      label: "Preserve Aspect Ratio",
      helpText: "Whether to preserve aspect ratio when resizing",
    },
    backgroundColor: {
      controlType: "color",
      label: "Background Color",
      placeholder: "#FFFFFF",
      helpText: "Background color for composition (hex format)",
    },
  },
);

export type ImageCompositeParameters = z.infer<
  typeof imageCompositeParameters.schema
>;
