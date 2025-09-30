/**
 * Image Composite Field Configuration
 * UI field configurations for image composite parameters
 * MVP: Core image composition only
 */

import { createFieldsFromSchema } from "#core/utils/createFieldsFromSchema";
import { imageCompositeSchema } from "#schemas/image-composite";

/**
 * Field configuration for image composite parameters
 *
 * Auto-derived from imageCompositeSchema with selective overrides for:
 * - operation: enum with descriptive labels
 * - images: textarea with custom placeholder and rows
 * - format: enum with descriptive labels
 */
export const imageCompositeFields = createFieldsFromSchema(
  imageCompositeSchema,
  {
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
  },
);
