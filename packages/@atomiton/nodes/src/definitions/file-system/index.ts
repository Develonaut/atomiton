/**
 * File System Node Definition
 * Browser-safe configuration for file system operations node
 */

import v from '@atomiton/validation';
import type { VInfer } from '@atomiton/validation';
import type { NodeDefinition } from '../../core/types/definition';
import { createNodeDefinition } from '../../core/factories/createNodeDefinition';
import createNodeMetadata from '../../core/factories/createNodeMetadata';
import createNodeParameters from '../../core/factories/createNodeParameters';
import createNodePorts from '../../core/factories/createNodePorts';

// Parameter schema using validation library
const fileSystemSchema = {
  operation: v
    .enum(["read", "write", "create", "list", "delete", "copy", "move", "exists"])
    .default("read")
    .describe("File system operation to perform"),

  path: v
    .string()
    .min(1, "Path is required")
    .describe("File or directory path"),

  content: v
    .string()
    .optional()
    .describe("Content to write to file"),

  encoding: v
    .enum(["utf8", "base64", "binary", "ascii", "hex"])
    .default("utf8")
    .describe("File encoding for read/write operations"),

  createDirectories: v
    .boolean()
    .default(false)
    .describe("Create parent directories if they don't exist"),

  overwrite: v
    .boolean()
    .default(false)
    .describe("Overwrite existing files"),

  recursive: v
    .boolean()
    .default(false)
    .describe("Perform recursive operations on directories"),
};

/**
 * File System node definition (browser-safe)
 */
export const fileSystemDefinition: NodeDefinition = createNodeDefinition({
  type: "atomic",
  metadata: createNodeMetadata({
    id: "file-system",
    name: "File System",
    variant: "file-system",
    version: "1.0.0",
    author: "Atomiton Core Team",
    description: "File system operations (read, write, manage directories)",
    category: "io",
    icon: "folder",
    keywords: [
      "file",
      "filesystem",
      "read",
      "write",
      "directory",
      "folder",
      "io",
      "disk",
      "storage",
      "copy",
      "move",
      "delete",
    ],
    tags: ["file", "filesystem", "io", "storage", "disk"],
    experimental: false,
    deprecated: false,
  }),
  parameters: createNodeParameters(
    fileSystemSchema,
    {
      operation: "read" as const,
      path: "",
      encoding: "utf8" as const,
      createDirectories: false,
      overwrite: false,
      recursive: false,
    },
    {
      operation: {
        controlType: "select",
        label: "Operation",
        helpText: "File system operation to perform",
        options: [
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
        label: "File Path",
        placeholder: "/path/to/file",
        helpText: "Path to the file or directory",
      },
      content: {
        controlType: "textarea",
        label: "File Content",
        placeholder: "Content to write to file",
        helpText: "Content for write operations",
        rows: 5,
      },
      encoding: {
        controlType: "select",
        label: "Encoding",
        helpText: "File encoding for read/write operations",
        options: [
          { value: "utf8", label: "UTF-8 - Standard text encoding" },
          { value: "base64", label: "Base64 - Binary data encoding" },
          { value: "binary", label: "Binary - Raw binary data" },
          { value: "ascii", label: "ASCII - Basic text encoding" },
          { value: "hex", label: "Hex - Hexadecimal encoding" },
        ],
      },
      createDirectories: {
        controlType: "boolean",
        label: "Create Parent Directories",
        helpText: "Automatically create parent directories if they don't exist",
      },
      overwrite: {
        controlType: "boolean",
        label: "Overwrite Existing",
        helpText: "Overwrite existing files when writing",
      },
      recursive: {
        controlType: "boolean",
        label: "Recursive",
        helpText: "Perform recursive operations on directories",
      },
    }
  ),
  ports: createNodePorts({
    input: [
      {
        id: "path",
        name: "Path",
        dataType: "string",
        required: false,
        multiple: false,
        description: "File or directory path (overrides parameter)",
      },
      {
        id: "content",
        name: "Content",
        dataType: "string",
        required: false,
        multiple: false,
        description: "Content to write to file (overrides parameter)",
      },
      {
        id: "targetPath",
        name: "Target Path",
        dataType: "string",
        required: false,
        multiple: false,
        description: "Target path for copy/move operations",
      },
    ],
    output: [
      {
        id: "result",
        name: "Result",
        dataType: "any",
        required: true,
        multiple: false,
        description: "Operation result data",
      },
      {
        id: "content",
        name: "Content",
        dataType: "string",
        required: false,
        multiple: false,
        description: "File content (for read operations)",
      },
      {
        id: "files",
        name: "Files",
        dataType: "array",
        required: false,
        multiple: false,
        description: "List of files in directory (for list operations)",
      },
      {
        id: "exists",
        name: "Exists",
        dataType: "boolean",
        required: false,
        multiple: false,
        description: "Whether the file/directory exists",
      },
      {
        id: "success",
        name: "Success",
        dataType: "boolean",
        required: false,
        multiple: false,
        description: "Whether the operation was successful",
      },
      {
        id: "path",
        name: "Path",
        dataType: "string",
        required: false,
        multiple: false,
        description: "The processed file or directory path",
      },
      {
        id: "size",
        name: "Size",
        dataType: "number",
        required: false,
        multiple: false,
        description: "File size in bytes",
      },
      {
        id: "modified",
        name: "Modified",
        dataType: "string",
        required: false,
        multiple: false,
        description: "Last modified timestamp",
      },
    ],
  }),
});

export default fileSystemDefinition;

// Export the parameter type for use in the executable
export type FileSystemParameters = VInfer<typeof fileSystemDefinition.parameters.schema>;