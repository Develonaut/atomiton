/**
 * Image Composite Schema
 * Runtime validation schema for image composite node
 */

import v from "@atomiton/validation";
import type { VInfer } from "@atomiton/validation";
import { baseSchema } from "#schemas/node";

/**
 * Image Composite specific schema (without base fields)
 * MVP: Core image composition only
 */
export const imageCompositeSchemaShape = {
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
