/**
 * File System Field Configuration
 * UI field configurations for file system parameters
 * MVP: Core file operations only
 */

import { createFieldsFromSchema } from "#core/utils/createFieldsFromSchema";
import { fileSystemSchema } from "#schemas/file-system";

/**
 * Field configuration for file system parameters
 *
 * Auto-derived from fileSystemSchema with selective overrides for:
 * - operation: enum with descriptive labels
 * - content: textarea with custom placeholder and rows
 */
export const fileSystemFields = createFieldsFromSchema(fileSystemSchema, {
  operation: {
    options: [
      { value: "read", label: "Read" },
      { value: "write", label: "Write" },
      { value: "list", label: "List" },
      { value: "exists", label: "Exists" },
      { value: "create", label: "Create" },
      { value: "delete", label: "Delete" },
      { value: "copy", label: "Copy" },
      { value: "move", label: "Move" },
    ],
  },
  content: {
    controlType: "textarea",
    placeholder: "Content to write",
    rows: 5,
  },
});
