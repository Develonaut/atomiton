/**
 * File System Field Configuration
 * UI field configurations for file system parameters
 * MVP: Core file operations only
 */

import type { NodeFieldsConfig } from "#core/types/definition";

/**
 * Field configuration for file system parameters
 */
export const fileSystemFields: NodeFieldsConfig = {
  operation: {
    controlType: "select",
    label: "Operation",
    helpText: "File system operation",
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
  path: {
    controlType: "text",
    label: "Path",
    placeholder: "/path/to/file",
    helpText: "File or directory path",
    required: true,
  },
  content: {
    controlType: "textarea",
    label: "Content (for write)",
    placeholder: "Content to write",
    helpText: "Content for write operations",
    rows: 5,
  },
  recursive: {
    controlType: "boolean",
    label: "Recursive (for list)",
    helpText: "List directories recursively",
  },
};
