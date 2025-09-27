/**
 * @atomiton/flow - Functional flow and node execution system
 */

// Type exports
export type {
  // Core flow types
  Flow,
  FlowMetadata,
  ValidationResult,

  // Execution types
  ExecutionContext,
  ExecutionError,
  ExecutionResult,
  ExecutionStatus,
  NodeExecutor,
  FlowExecutor,
} from "#types";

// Factory functions
export {
  createFlow,
  createEmptyFlow,
  createSequentialFlow,
  cloneFlow,
  cloneNode,
  cloneEdge,
  validateFlow,
  createExecutionContext,
  createExecutionResult,
} from "#factories";

// Type guards
export {
  isFlow,
  isNode,
  isEdge,
  isValidFlow,
  hasInputs,
  hasOutputs,
  isEmptyFlow,
  hasCycles,
  isEntryNode,
  isExitNode,
} from "#guards";

// Core functional utilities
export { compose, pipe, combineResults } from "#utils/functionalCore";

// Node operations
export {
  addNode,
  removeNode,
  updateNode,
  mapNodes,
  filterNodes,
  findNode,
  getNodeById,
} from "#utils/nodeOperations";

// Edge operations
export {
  addEdge,
  removeEdge,
  connectNodes,
  getIncomingEdges,
  getOutgoingEdges,
} from "#utils/edgeOperations";

// Flow operations
export {
  getConnectedNodes,
  clearEdges,
  clearNodes,
  transformFlow,
  getTopologicalOrder,
} from "#utils/flowOperations";
