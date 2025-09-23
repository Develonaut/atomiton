/**
 * Image Composite Field Configuration
 * UI field configurations for image composite parameters
 */

import type { NodeFieldsConfig } from "#core/types/definition";

/**
 * Field configuration for image composite parameters
 */
export const imageCompositeFields: NodeFieldsConfig = {
  operation: {
    controlType: "select",
    label      : "Operation",
    helpText   : "Type of image composition to perform",
    options    : [
      { value: "overlay", label: "Overlay - Place image on top" },
      { value: "merge", label: "Merge - Combine multiple images" },
      { value: "composite", label: "Composite - Advanced composition" },
      { value: "blend", label: "Blend - Mix images together" },
    ],
  },
  outputFormat: {
    controlType: "select",
    label      : "Output Format",
    helpText   : "Format for the output image",
    options    : [
      { value: "png", label: "PNG - Lossless with transparency" },
      { value: "jpeg", label: "JPEG - Compressed, no transparency" },
      { value: "webp", label: "WebP - Modern format" },
      { value: "bmp", label: "BMP - Uncompressed bitmap" },
      { value: "tiff", label: "TIFF - Professional format" },
    ],
  },
  quality: {
    controlType: "range",
    label      : "Quality",
    helpText   : "Output quality for lossy formats (1-100)",
    min        : 1,
    max        : 100,
    step       : 1,
  },
  width: {
    controlType: "number",
    label      : "Width (px)",
    placeholder: "Auto",
    helpText   : "Output image width in pixels",
    min        : 1,
  },
  height: {
    controlType: "number",
    label      : "Height (px)",
    placeholder: "Auto",
    helpText   : "Output image height in pixels",
    min        : 1,
  },
  position: {
    controlType: "select",
    label      : "Position",
    helpText   : "Position for overlay operations",
    options    : [
      { value: "center", label: "Center" },
      { value: "top", label: "Top" },
      { value: "bottom", label: "Bottom" },
      { value: "left", label: "Left" },
      { value: "right", label: "Right" },
      { value: "top-left", label: "Top Left" },
      { value: "top-right", label: "Top Right" },
      { value: "bottom-left", label: "Bottom Left" },
      { value: "bottom-right", label: "Bottom Right" },
    ],
  },
  opacity: {
    controlType: "range",
    label      : "Opacity",
    helpText   : "Opacity for overlay/blend operations",
    min        : 0,
    max        : 1,
    step       : 0.01,
  },
  blendMode: {
    controlType: "select",
    label      : "Blend Mode",
    helpText   : "How to blend images together",
    options    : [
      { value: "normal", label: "Normal" },
      { value: "multiply", label: "Multiply" },
      { value: "screen", label: "Screen" },
      { value: "overlay", label: "Overlay" },
      { value: "darken", label: "Darken" },
      { value: "lighten", label: "Lighten" },
      { value: "color-dodge", label: "Color Dodge" },
      { value: "color-burn", label: "Color Burn" },
    ],
  },
  backgroundColor: {
    controlType: "color",
    label      : "Background Color",
    helpText   : "Background color for composite operations",
  },
  maintainAspectRatio: {
    controlType: "boolean",
    label      : "Maintain Aspect Ratio",
    helpText   : "Keep aspect ratio when resizing",
  },
  padding: {
    controlType: "number",
    label      : "Padding (px)",
    helpText   : "Padding around images in pixels",
    min        : 0,
  },
};