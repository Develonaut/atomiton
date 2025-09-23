/**
 * Image Composite Node Definition
 * Browser-safe configuration for image composition node
 */

import v from '@atomiton/validation';
import type { VInfer } from '@atomiton/validation';
import type { NodeDefinition } from '../../core/types/definition';
import { createNodeDefinition } from '../../core/factories/createNodeDefinition';
import createNodeMetadata from '../../core/factories/createNodeMetadata';
import createNodeParameters from '../../core/factories/createNodeParameters';
import createNodePorts from '../../core/factories/createNodePorts';

// Parameter schema using validation library
const imageCompositeSchema = {
  operation: v
    .enum(["composite", "overlay", "merge", "blend"])
    .default("composite")
    .describe("Image composition operation type"),

  outputFormat: v
    .enum(["png", "jpg", "jpeg", "webp", "bmp", "tiff"])
    .default("png")
    .describe("Output image format"),

  quality: v
    .number()
    .min(1)
    .max(100)
    .default(90)
    .describe("Output image quality (1-100)"),

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

  preserveAspectRatio: v
    .boolean()
    .default(true)
    .describe("Whether to preserve aspect ratio when resizing"),

  backgroundColor: v
    .string()
    .default("#FFFFFF")
    .describe("Background color for composition (hex format)"),

  blendMode: v
    .enum(["normal", "multiply", "screen", "overlay", "soft-light", "hard-light"])
    .default("normal")
    .describe("Blend mode for image composition"),
};

/**
 * Image Composite node definition (browser-safe)
 */
export const imageCompositeDefinition: NodeDefinition = createNodeDefinition({
  type: "atomic",
  metadata: createNodeMetadata({
    id: "image-composite",
    name: "Image Composite",
    variant: "image-composite",
    version: "1.0.0",
    author: "Atomiton Core Team",
    description: "Composite and manipulate images",
    category: "media",
    icon: "image",
    keywords: [
      "image",
      "composite",
      "overlay",
      "merge",
      "blend",
      "process",
      "render",
      "media",
      "graphics",
      "manipulation",
    ],
    tags: ["image", "composite", "overlay", "merge", "process", "render", "media"],
    experimental: false,
    deprecated: false,
  }),
  parameters: createNodeParameters(
    imageCompositeSchema,
    {
      operation: "composite" as const,
      outputFormat: "png" as const,
      quality: 90,
      preserveAspectRatio: true,
      backgroundColor: "#FFFFFF",
      blendMode: "normal" as const,
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
          { value: "jpeg", label: "JPEG - Compressed format" },
          { value: "webp", label: "WebP - Modern format" },
          { value: "bmp", label: "BMP - Bitmap format" },
          { value: "tiff", label: "TIFF - High quality format" },
        ],
      },
      quality: {
        controlType: "range",
        label: "Image Quality",
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
      blendMode: {
        controlType: "select",
        label: "Blend Mode",
        helpText: "Blend mode for image composition",
        options: [
          { value: "normal", label: "Normal" },
          { value: "multiply", label: "Multiply" },
          { value: "screen", label: "Screen" },
          { value: "overlay", label: "Overlay" },
          { value: "soft-light", label: "Soft Light" },
          { value: "hard-light", label: "Hard Light" },
        ],
      },
    }
  ),
  ports: createNodePorts({
    input: [
      {
        id: "baseImage",
        name: "Base Image",
        dataType: "string",
        required: false,
        multiple: false,
        description: "Base image path or data",
      },
      {
        id: "overlayImage",
        name: "Overlay Image",
        dataType: "string",
        required: false,
        multiple: false,
        description: "Overlay image path or data",
      },
      {
        id: "images",
        name: "Images",
        dataType: "array",
        required: false,
        multiple: false,
        description: "Array of image paths or data",
      },
    ],
    output: [
      {
        id: "result",
        name: "Result",
        dataType: "string",
        required: true,
        multiple: false,
        description: "Output image path or data",
      },
      {
        id: "imagePath",
        name: "Image Path",
        dataType: "string",
        required: false,
        multiple: false,
        description: "Output image file path",
      },
      {
        id: "width",
        name: "Width",
        dataType: "number",
        required: false,
        multiple: false,
        description: "Output image width in pixels",
      },
      {
        id: "height",
        name: "Height",
        dataType: "number",
        required: false,
        multiple: false,
        description: "Output image height in pixels",
      },
      {
        id: "format",
        name: "Format",
        dataType: "string",
        required: false,
        multiple: false,
        description: "Output image format",
      },
      {
        id: "size",
        name: "Size",
        dataType: "number",
        required: false,
        multiple: false,
        description: "Output image file size in bytes",
      },
      {
        id: "success",
        name: "Success",
        dataType: "boolean",
        required: false,
        multiple: false,
        description: "Operation success status",
      },
    ],
  }),
});

export default imageCompositeDefinition;

// Export the parameter type for use in the executable
export type ImageCompositeParameters = VInfer<typeof imageCompositeDefinition.parameters.schema>;