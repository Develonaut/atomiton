/**
 * Node Executable Registry
 * Central registry for all node executables (Node.js environment)
 */

import type { NodeExecutable } from "#core/types/executable";

// Import all node executables
import codeExecutable from "#executables/code";
import groupExecutable from "#executables/group";
import csvReaderExecutable from "#executables/csv-reader";
import editFieldsExecutable from "#executables/edit-fields";
import fileSystemExecutable from "#executables/file-system";
import httpRequestExecutable from "#executables/http-request";
import imageCompositeExecutable from "#executables/image-composite";
import loopExecutable from "#executables/loop";
import parallelExecutable from "#executables/parallel";
import shellCommandExecutable from "#executables/shell-command";
import transformExecutable from "#executables/transform";

/**
 * Registry of all available node executables
 */
export const nodeExecutableRegistry = new Map<
  string,
  NodeExecutable<unknown>
>();

// Register all executables
nodeExecutableRegistry.set("code", codeExecutable as NodeExecutable<unknown>);
nodeExecutableRegistry.set(
  "parallel",
  parallelExecutable as NodeExecutable<unknown>,
);
nodeExecutableRegistry.set(
  "csv-reader",
  csvReaderExecutable as NodeExecutable<unknown>,
);
nodeExecutableRegistry.set("group", groupExecutable as NodeExecutable<unknown>);
nodeExecutableRegistry.set(
  "edit-fields",
  editFieldsExecutable as NodeExecutable<unknown>,
);
nodeExecutableRegistry.set(
  "image-composite",
  imageCompositeExecutable as NodeExecutable<unknown>,
);
nodeExecutableRegistry.set(
  "http-request",
  httpRequestExecutable as NodeExecutable<unknown>,
);
nodeExecutableRegistry.set(
  "file-system",
  fileSystemExecutable as NodeExecutable<unknown>,
);
nodeExecutableRegistry.set(
  "transform",
  transformExecutable as NodeExecutable<unknown>,
);
nodeExecutableRegistry.set(
  "shell-command",
  shellCommandExecutable as NodeExecutable<unknown>,
);
nodeExecutableRegistry.set("loop", loopExecutable as NodeExecutable<unknown>);

/**
 * Get a node executable by ID
 */
export function getNodeExecutable(
  nodeId: string,
): NodeExecutable<unknown> | undefined {
  return nodeExecutableRegistry.get(nodeId);
}

/**
 * Get all node executables
 */
export function getAllNodeExecutables(): NodeExecutable<unknown>[] {
  return Array.from(nodeExecutableRegistry.values());
}

/**
 * Check if a node executable exists
 */
export function hasNodeExecutable(id: string): boolean {
  return nodeExecutableRegistry.has(id);
}

/**
 * Get all node executable IDs
 */
export function getNodeExecutableIds(): string[] {
  return Array.from(nodeExecutableRegistry.keys());
}

// Export all executables for convenience
export {
  codeExecutable,
  csvReaderExecutable,
  editFieldsExecutable,
  fileSystemExecutable,
  groupExecutable,
  httpRequestExecutable,
  imageCompositeExecutable,
  loopExecutable,
  parallelExecutable,
  shellCommandExecutable,
  transformExecutable,
};
