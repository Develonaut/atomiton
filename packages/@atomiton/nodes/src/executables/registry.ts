/**
 * Node Executable Registry
 * Central registry for all node executables (Node.js environment)
 */

import type { NodeExecutable } from "#core/types/executable";

// Import all node executables
import groupExecutable from "#executables/group";
import editFieldsExecutable from "#executables/edit-fields";
import fileSystemExecutable from "#executables/file-system";
import httpRequestExecutable from "#executables/http-request";
import imageExecutable from "#executables/image";
import loopExecutable from "#executables/loop";
import parallelExecutable from "#executables/parallel";
import shellCommandExecutable from "#executables/shell-command";
import spreadsheetExecutable from "#executables/spreadsheet";
import transformExecutable from "#executables/transform";

/**
 * Registry of all available node executables
 */
export const nodeExecutableRegistry = new Map<string, NodeExecutable>();

// Register all executables
nodeExecutableRegistry.set("parallel", parallelExecutable);
nodeExecutableRegistry.set("group", groupExecutable);
nodeExecutableRegistry.set("edit-fields", editFieldsExecutable);
nodeExecutableRegistry.set("image", imageExecutable);
nodeExecutableRegistry.set("http-request", httpRequestExecutable);
nodeExecutableRegistry.set("file-system", fileSystemExecutable);
nodeExecutableRegistry.set("transform", transformExecutable);
nodeExecutableRegistry.set("shell-command", shellCommandExecutable);
nodeExecutableRegistry.set("spreadsheet", spreadsheetExecutable);
nodeExecutableRegistry.set("loop", loopExecutable);

/**
 * Get a node executable by ID
 */
export function getNodeExecutable(nodeId: string): NodeExecutable | undefined {
  return nodeExecutableRegistry.get(nodeId);
}

/**
 * Get all node executables
 */
export function getAllNodeExecutables(): NodeExecutable[] {
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
  editFieldsExecutable,
  fileSystemExecutable,
  groupExecutable,
  httpRequestExecutable,
  imageExecutable,
  loopExecutable,
  parallelExecutable,
  shellCommandExecutable,
  spreadsheetExecutable,
  transformExecutable,
};
