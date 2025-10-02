/**
 * Image Field Configuration
 * UI field configurations for image parameters
 * MVP: Core image composition only
 */

import { createFieldsFromSchema } from "#core/utils/createFieldsFromSchema";
import { imageSchema } from "#schemas/image";

/**
 * Field configuration for image parameters
 *
 * Auto-derived from imageSchema with selective overrides for:
 * - operation: enum with descriptive labels
 * - images: textarea with custom placeholder and rows
 * - format: enum with descriptive labels
 */
export const imageFields = createFieldsFromSchema(imageSchema, {
  operation: {
    options: [
      { value: "overlay", label: "Overlay" },
      { value: "merge", label: "Merge" },
      { value: "composite", label: "Composite" },
      { value: "blend", label: "Blend" },
    ],
  },
  images: {
    controlType: "textarea",
    placeholder: '["/path/to/image1.png", "/path/to/image2.png"]',
    rows: 3,
  },
  format: {
    options: [
      { value: "png", label: "PNG" },
      { value: "jpeg", label: "JPEG" },
      { value: "webp", label: "WebP" },
    ],
  },
  quality: {
    controlType: "number",
    min: 1,
    max: 100,
  },
  fit: {
    options: [
      { value: "cover", label: "Cover" },
      { value: "contain", label: "Contain" },
      { value: "fill", label: "Fill" },
      { value: "inside", label: "Inside" },
      { value: "outside", label: "Outside" },
    ],
  },
  position: {
    options: [
      { value: "center", label: "Center" },
      { value: "top", label: "Top" },
      { value: "right", label: "Right" },
      { value: "bottom", label: "Bottom" },
      { value: "left", label: "Left" },
      { value: "top-left", label: "Top Left" },
      { value: "top-right", label: "Top Right" },
      { value: "bottom-left", label: "Bottom Left" },
      { value: "bottom-right", label: "Bottom Right" },
    ],
  },
  blendMode: {
    options: [
      { value: "over", label: "Normal" },
      { value: "multiply", label: "Multiply" },
      { value: "screen", label: "Screen" },
      { value: "overlay", label: "Overlay" },
      { value: "darken", label: "Darken" },
      { value: "lighten", label: "Lighten" },
      { value: "color-dodge", label: "Color Dodge" },
      { value: "color-burn", label: "Color Burn" },
      { value: "hard-light", label: "Hard Light" },
      { value: "soft-light", label: "Soft Light" },
      { value: "difference", label: "Difference" },
      { value: "exclusion", label: "Exclusion" },
    ],
  },
  opacity: {
    controlType: "number",
    min: 0,
    max: 1,
    step: 0.1,
  },
  blur: {
    controlType: "number",
    min: 0,
    max: 100,
  },
  sharpen: {
    controlType: "boolean",
  },
  grayscale: {
    controlType: "boolean",
  },
});
