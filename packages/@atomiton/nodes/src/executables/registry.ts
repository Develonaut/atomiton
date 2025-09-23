/**
 * Node Executable Registry
 * Central registry for all node executables (Node.js environment)
 */

import type { NodeExecutable } from '../core/types/executable';

// Import all node executables
import parallelExecutable from './parallel';
import csvReaderExecutable from './csv-reader';
import compositeExecutable from './composite';
import imageCompositeExecutable from './image-composite';
import httpRequestExecutable from './http-request';
import fileSystemExecutable from './file-system';
import transformExecutable from './transform';
import shellCommandExecutable from './shell-command';
import loopExecutable from './loop';

/**
 * Registry of all available node executables
 */
export const nodeExecutableRegistry: Map<string, NodeExecutable<any>> = new Map([
  ['parallel', parallelExecutable],
  ['csv-reader', csvReaderExecutable],
  ['composite', compositeExecutable],
  ['image-composite', imageCompositeExecutable],
  ['http-request', httpRequestExecutable],
  ['file-system', fileSystemExecutable],
  ['transform', transformExecutable],
  ['shell-command', shellCommandExecutable],
  ['loop', loopExecutable],
]);

/**
 * Get a node executable by ID
 */
export function getNodeExecutable(nodeId: string): NodeExecutable<any> | undefined {
  return nodeExecutableRegistry.get(nodeId);
}

/**
 * Get all node executables
 */
export function getAllNodeExecutables(): NodeExecutable<any>[] {
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
  parallelExecutable,
  csvReaderExecutable,
  compositeExecutable,
  imageCompositeExecutable,
  httpRequestExecutable,
  fileSystemExecutable,
  transformExecutable,
  shellCommandExecutable,
  loopExecutable,
};