/**
 * Loop Field Configuration
 * UI field configurations for loop parameters
 * MVP: Core loop types only
 */

import { createFieldsFromSchema } from "#core/utils/createFieldsFromSchema";
import { loopSchema } from "#schemas/loop";

/**
 * Field configuration for loop parameters
 *
 * Auto-derived from loopSchema with selective overrides for:
 * - loopType: enum with descriptive labels
 * - array: textarea with custom placeholder and rows
 * - condition: code editor with custom placeholder and rows
 */
export const loopFields = createFieldsFromSchema(loopSchema, {
  loopType: {
    options: [
      { value: "forEach", label: "For Each" },
      { value: "times", label: "Times" },
      { value: "while", label: "While" },
    ],
  },
  array: {
    controlType: "textarea",
    placeholder: "[1, 2, 3, 4, 5]",
    rows: 3,
  },
  condition: {
    controlType: "code",
    placeholder: "iteration < 100",
    rows: 3,
  },
});
