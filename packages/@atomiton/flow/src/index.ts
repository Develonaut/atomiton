/**
 * @atomiton/flow - Functional flow and node execution system
 */

// Type exports
export type {
  Edge,
  EdgeMarker,
  CreateEdgeOptions,
  // Factory option types
  CreateFlowOptions,
  CreateNodeOptions,
  // Core types
  Executable,
  ExecutableMetadata,
  // Execution types
  ExecutionContext,
  ExecutionError,
  ExecutionResult,
  ExecutionStatus,
  Flow,
  FlowExecutor,
  FlowMetadata,
  FlowNode,
  NodeExecutor,
  PortDefinition,
  Position,
} from "#types";

// Factory functions
export {
  cloneEdge,
  cloneFlow,
  cloneNode,
  createEdge,
  createEmptyFlow,
  createFlow,
  createFlowFromNodes,
  createNode,
  createSequentialFlow,
} from "#factories";

// Type guards
export {
  hasCycles,
  hasInputs,
  hasOutputs,
  isEdge,
  isEmptyFlow,
  isEntryNode,
  isExecutable,
  isExitNode,
  isFlow,
  isNode,
  isValidFlow,
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
