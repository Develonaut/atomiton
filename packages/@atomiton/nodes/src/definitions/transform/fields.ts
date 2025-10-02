/**
 * Transform Field Configuration
 * UI field configurations for transform parameters
 * Enhanced with all transformation operations
 */

import { createFieldsFromSchema } from "#core/utils/createFieldsFromSchema";
import { transformSchema } from "#schemas/transform";

/**
 * Field configuration for transform parameters
 *
 * Auto-derived from transformSchema with selective overrides for:
 * - operation: enum with descriptive labels for all 11 operations
 * - transformFunction: code editor with custom placeholder and rows
 */
export const transformFields = createFieldsFromSchema(transformSchema, {
  operation: {
    options: [
      { value: "map", label: "Map" },
      { value: "filter", label: "Filter" },
      { value: "reduce", label: "Reduce" },
      { value: "sort", label: "Sort" },
      { value: "group", label: "Group" },
      { value: "flatten", label: "Flatten" },
      { value: "unique", label: "Unique" },
      { value: "reverse", label: "Reverse" },
      { value: "limit", label: "Limit" },
      { value: "skip", label: "Skip" },
      { value: "slice", label: "Slice" },
    ],
  },
  transformFunction: {
    controlType: "code",
    placeholder: "item => ({ ...item, processed: true })",
    rows: 5,
  },
});
