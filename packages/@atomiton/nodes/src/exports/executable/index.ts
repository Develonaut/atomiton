/**
 * @atomiton/nodes/executable - Node.js Runtime Exports
 *
 * This module provides Node.js runtime exports for executing nodes.
 * Only import from this module in Node.js environments.
 *
 * WHAT'S INCLUDED:
 * - Complete node execution logic with async operations
 * - Executable node interfaces and types
 * - File system operations (fs, fs/promises)
 * - Child process spawning capabilities
 * - HTTP request handling
 * - All Node.js-specific dependencies
 *
 * WHAT'S EXCLUDED:
 * - This export is NOT safe for browser environments
 * - Will cause build errors if imported in React/browser code
 * - Contains dynamic imports of Node.js built-in modules
 *
 * USAGE:
 * ```typescript
 * // Node.js environments only (Conductor, Electron main process)
 * import { nodes, createAtomicNode } from '@atomiton/nodes/executable';
 * ```
 */

// Execution types
export type {
  NodeExecutionContext,
  NodeExecutionResult,
  NodeExecutionStatus,
  NodeExecutionMode,
  NodeInputs,
  NodeOutputs,
  NodeParameters,
  NodeConfig,
  PortData,
  ExecutionMetadata,
  ExecutionResultMetadata,
} from "./execution-types";

// Executable interfaces
export type {
  IExecutableNode,
  IExecutableNode as INode, // Alias for backward compatibility
  IAtomicNode,
  ICompositeNode,
  CompositeEdge,
} from "../../interfaces/IExecutableNode";
export {
  isAtomicNode,
  isCompositeNode,
} from "../../interfaces/IExecutableNode";

// Composite types needed for execution
export type { CompositeDefinition } from "../../composite/types";

export type { INodeExecutable } from "../../interfaces/INodeExecutable";
export type { INodeMetadata } from "../../interfaces/INodeMetadata";
export type { INodeParameters } from "../../interfaces/INodeParameters";
// INodePorts is now defined in createCompositePorts
export type { INodePorts } from "../../composite/createCompositePorts";

// Factory functions for creating runtime nodes
export { createAtomicNode } from "../../atomic/createAtomicNode";
export { createCompositeNode } from "../../composite/createCompositeNode";

// Node collection for runtime execution
export { nodes } from "../../atomic/nodes";

// Individual node executables
export { codeExecutable } from "../../atomic/nodes/code/executable";
export { csvReaderExecutable } from "../../atomic/nodes/csv-reader/executable";
export { fileSystemExecutable } from "../../atomic/nodes/file-system/executable";
export { httpRequestExecutable } from "../../atomic/nodes/http-request/executable";
export { imageCompositeExecutable } from "../../atomic/nodes/image-composite/executable";
export { loopExecutable } from "../../atomic/nodes/loop/executable";
export { parallelExecutable } from "../../atomic/nodes/parallel/executable";
export { shellCommandExecutable } from "../../atomic/nodes/shell-command/executable";
export { transformExecutable } from "../../atomic/nodes/transform/executable";

// Utility functions for execution
export {
  createSuccessResult,
  createErrorResult,
  logNodeExecution,
  getInputValue,
  getAllInputValues,
  validateRequiredInputs,
} from "../../utils";
