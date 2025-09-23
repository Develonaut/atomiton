/**
 * File System Field Configuration
 * UI field configurations for file system parameters
 */

import type { NodeFieldsConfig } from "#core/types/definition";

/**
 * Field configuration for file system parameters
 */
export const fileSystemFields: NodeFieldsConfig = {
  operation: {
    controlType: "select",
    label      : "Operation",
    helpText   : "File system operation to perform",
    options    : [
      { value: "read", label: "Read File - Read file contents" },
      { value: "write", label: "Write File - Write content to file" },
      { value: "create", label: "Create - Create file or directory" },
      { value: "list", label: "List Directory - List directory contents" },
      { value: "delete", label: "Delete - Remove file or directory" },
      { value: "copy", label: "Copy - Copy file or directory" },
      { value: "move", label: "Move - Move/rename file or directory" },
      { value: "exists", label: "Exists - Check if file/directory exists" },
    ],
  },
  path: {
    controlType: "file",
    label      : "File Path",
    placeholder: "/path/to/file",
    helpText   : "Path to the file or directory",
  },
  content: {
    controlType: "textarea",
    label      : "File Content",
    placeholder: "Content to write to file",
    helpText   : "Content for write operations",
    rows       : 5,
  },
  encoding: {
    controlType: "select",
    label      : "Encoding",
    helpText   : "File encoding for read/write operations",
    options    : [
      { value: "utf8", label: "UTF-8 - Standard text encoding" },
      { value: "base64", label: "Base64 - Binary data encoding" },
      { value: "binary", label: "Binary - Raw binary data" },
      { value: "ascii", label: "ASCII - Basic text encoding" },
      { value: "hex", label: "Hex - Hexadecimal encoding" },
    ],
  },
  createDirectories: {
    controlType: "boolean",
    label      : "Create Parent Directories",
    helpText   : "Automatically create parent directories if they don't exist",
  },
  overwrite: {
    controlType: "boolean",
    label      : "Overwrite Existing",
    helpText   : "Overwrite existing files when writing",
  },
  recursive: {
    controlType: "boolean",
    label      : "Recursive",
    helpText   : "Perform recursive operations on directories",
  },
  targetPath: {
    controlType: "text",
    label      : "Target Path",
    placeholder: "/path/to/target",
    helpText   : "Destination path for copy/move operations",
  },
  fileFilter: {
    controlType: "text",
    label      : "File Filter",
    placeholder: ".*\\.txt$",
    helpText   : "Regular expression to filter files",
  },
  fullPaths: {
    controlType: "boolean",
    label      : "Full Paths",
    helpText   : "Return full paths in list operation",
  },
};
