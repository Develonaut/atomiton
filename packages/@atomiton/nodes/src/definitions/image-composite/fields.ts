/**
 * Image Composite Field Configuration
 * UI field configurations for image composite parameters
 * MVP: Core image composition only
 */

import type { NodeFieldsConfig } from "#core/types/definition";

/**
 * Field configuration for image composite parameters
 */
export const imageCompositeFields: NodeFieldsConfig = {
  operation: {
    controlType: "select",
    label: "Operation",
    helpText: "Type of image composition",
    options: [
      { value: "overlay", label: "Overlay" },
      { value: "merge", label: "Merge" },
      { value: "composite", label: "Composite" },
      { value: "blend", label: "Blend" },
    ],
  },
  images: {
    controlType: "textarea",
    label: "Images",
    placeholder: '["/path/to/image1.png", "/path/to/image2.png"]',
    helpText: "Array of image paths or URLs",
    rows: 3,
    required: true,
  },
  output: {
    controlType: "text",
    label: "Output Path",
    placeholder: "/path/to/output.png",
    helpText: "Path for the composed image",
    required: true,
  },
  width: {
    controlType: "number",
    label: "Width (optional)",
    placeholder: "Auto",
    helpText: "Output width in pixels",
    min: 1,
  },
  height: {
    controlType: "number",
    label: "Height (optional)",
    placeholder: "Auto",
    helpText: "Output height in pixels",
    min: 1,
  },
  format: {
    controlType: "select",
    label: "Format",
    helpText: "Output image format",
    options: [
      { value: "png", label: "PNG" },
      { value: "jpeg", label: "JPEG" },
      { value: "webp", label: "WebP" },
    ],
  },
};
