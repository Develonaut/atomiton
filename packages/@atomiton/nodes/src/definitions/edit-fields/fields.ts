/**
 * Edit Fields Field Configuration
 * UI field configurations for edit fields node parameters
 */

import type { NodeFieldsConfig } from "#core/types/definition";

/**
 * Field configuration for edit fields parameters
 */
export const editFieldsFields: NodeFieldsConfig = {
  values: {
    controlType: "code",
    label: "Fields to Edit",
    placeholder: "Add field",
    helpText: "Define fields and their values to create or edit (JSON format)",
    rows: 10,
  },
  keepOnlySet: {
    controlType: "boolean",
    label: "Keep Only Edited Fields",
    helpText:
      "If enabled, only the fields defined above will be included in the output",
  },
};
