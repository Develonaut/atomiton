/**
 * Transform Field Configuration
 * UI field configurations for transform parameters
 * MVP: Core transformation operations only
 */

import { createFieldsFromSchema } from "#core/utils/createFieldsFromSchema";
import { transformSchema } from "#schemas/transform";

/**
 * Field configuration for transform parameters
 *
 * Auto-derived from transformSchema with selective overrides for:
 * - operation: enum with descriptive labels
 * - transformFunction: code editor with custom placeholder and rows
 */
export const transformFields = createFieldsFromSchema(transformSchema, {
  operation: {
    options: [
      { value: "map", label: "Map" },
      { value: "filter", label: "Filter" },
      { value: "sort", label: "Sort" },
      { value: "flatten", label: "Flatten" },
    ],
  },
  transformFunction: {
    controlType: "code",
    placeholder: "item => ({ ...item, processed: true })",
    rows: 5,
  },
});
