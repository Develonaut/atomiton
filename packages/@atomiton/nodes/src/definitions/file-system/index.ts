/**
 * File System Node Definition
 * Browser-safe configuration for file system operations node
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import type { NodeDefinition } from "#core/types/definition";
import { fileSystemFields } from "#definitions/file-system/fields";
import {
  fileSystemInputPorts,
  fileSystemOutputPorts,
} from "#definitions/file-system/ports";
import {
  fileSystemDefaults,
  fileSystemSchema,
} from "#definitions/file-system/schema";
import type { VInfer } from "@atomiton/validation";
import v from "@atomiton/validation";

/**
 * File System node definition (browser-safe)
 */
export const fileSystemDefinition: NodeDefinition = createNodeDefinition({
  metadata: createNodeMetadata({
    id: "file-system",
    name: "File System",
    type: "file-system",
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
    fileSystemDefaults,
    fileSystemFields,
  ),
  inputPorts: fileSystemInputPorts,
  outputPorts: fileSystemOutputPorts,
});

export default fileSystemDefinition;

// Create the full schema with base parameters
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fullFileSystemSchema = v.object({
  ...fileSystemSchema,
  enabled: v.boolean().default(true),
  timeout: v.number().positive().default(30000),
  retries: v.number().int().min(0).default(1),
  label: v.string().optional(),
  description: v.string().optional(),
});

// Export the parameter type for use in the executable
export type FileSystemParameters = VInfer<typeof fullFileSystemSchema>;
