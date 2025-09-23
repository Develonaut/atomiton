/**
 * Node Executable Registry
 * Central registry for all node executables (Node.js environment)
 */

import type { NodeExecutable } from "../core/types/executable";

// Import all node executables
import compositeExecutable from "./composite";
import csvReaderExecutable from "./csv-reader";
import fileSystemExecutable from "./file-system";
import httpRequestExecutable from "./http-request";
import imageCompositeExecutable from "./image-composite";
import loopExecutable from "./loop";
import parallelExecutable from "./parallel";
import shellCommandExecutable from "./shell-command";
import transformExecutable from "./transform";

/**
 * Registry of all available node executables
 */
export const nodeExecutableRegistry = new Map<string, NodeExecutable<unknown>>();

// Register all executables
nodeExecutableRegistry.set("parallel", parallelExecutable as NodeExecutable<unknown>);
nodeExecutableRegistry.set("csv-reader", csvReaderExecutable as NodeExecutable<unknown>);
nodeExecutableRegistry.set("composite", compositeExecutable as NodeExecutable<unknown>);
nodeExecutableRegistry.set("image-composite", imageCompositeExecutable as NodeExecutable<unknown>);
nodeExecutableRegistry.set("http-request", httpRequestExecutable as NodeExecutable<unknown>);
nodeExecutableRegistry.set("file-system", fileSystemExecutable as NodeExecutable<unknown>);
nodeExecutableRegistry.set("transform", transformExecutable as NodeExecutable<unknown>);
nodeExecutableRegistry.set("shell-command", shellCommandExecutable as NodeExecutable<unknown>);
nodeExecutableRegistry.set("loop", loopExecutable as NodeExecutable<unknown>);

/**
 * Get a node executable by ID
 */
export function getNodeExecutable(
  nodeId: string
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
  compositeExecutable,
  csvReaderExecutable,
  fileSystemExecutable,
  httpRequestExecutable,
  imageCompositeExecutable,
  loopExecutable,
  parallelExecutable,
  shellCommandExecutable,
  transformExecutable,
};
