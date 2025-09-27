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

/**
 * Default values for file system parameters
 */
export const fileSystemDefaults = {
  operation: "read" as const,
  path: "",
  encoding: "utf8" as const,
  createDirectories: false,
  overwrite: false,
  recursive: false,
  fullPaths: false,
};

/**
 * File System node definition (browser-safe)
 */
export const fileSystemDefinition: NodeDefinition = createNodeDefinition({
  type: "file-system",
  version: "1.0.0",
  metadata: createNodeMetadata({
    id: "file-system",
    name: "File System",
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
  parameters: createNodeParameters(fileSystemDefaults, fileSystemFields),
  inputPorts: fileSystemInputPorts,
  outputPorts: fileSystemOutputPorts,
});

export default fileSystemDefinition;
