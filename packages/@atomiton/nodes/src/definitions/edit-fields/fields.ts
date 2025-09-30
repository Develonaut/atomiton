/**
 * Edit Fields Field Configuration
 * UI field configurations for edit fields node parameters
 */

import { createFieldsFromSchema } from "#core/utils/createFieldsFromSchema";
import { editFieldsSchema } from "#schemas/edit-fields";

/**
 * Field configuration for edit fields parameters
 *
 * Auto-derived from editFieldsSchema with selective overrides for:
 * - values: code editor with custom rows and placeholder
 */
export const editFieldsFields = createFieldsFromSchema(editFieldsSchema, {
  values: {
    controlType: "code",
    placeholder: "Add field",
    rows: 10,
  },
});
