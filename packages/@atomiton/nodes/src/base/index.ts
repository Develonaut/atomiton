/**
 * Base Module Exports
 *
 * Centralized exports for all base functionality.
 * This provides a clean API for importing base types and classes.
 */

// Factory functions for node creation
export { createNode } from "./createNode";
export type { NodeInput } from "./createNode";

export { createNodeParameters } from "./createNodeParameters";
export type { NodeParametersInput } from "./createNodeParameters";

export { createNodeMetadata } from "./createNodeMetadata";
export type { NodeMetadataInput } from "./createNodeMetadata";

export { createNodeLogic } from "./createNodeLogic";
export type { NodeLogicInput } from "./createNodeLogic";

export { createNodePorts } from "./createNodePorts";
export type { NodePortsInput, INodePorts } from "./createNodePorts";

// Concrete type definitions
export type {
  NodeCategory,
  NodeIcon,
  NodeRuntime,
  PortType,
  PortDataType,
  NodeStatus,
  NodeExecutionMode,
  FieldControlType,
} from "./types";

// Node interfaces and type guards
export type {
  INode,
  IAtomicNode,
  ICompositeNode,
  CompositeEdge,
} from "./INode";
export { isAtomicNode, isCompositeNode } from "./INode";

// Node metadata interfaces
export type { INodeMetadata } from "./INodeMetadata";

// Node parameters interfaces
export type {
  INodeParameters,
  FieldConfig,
  FieldsConfig,
} from "./INodeParameters";

// Node logic interfaces
export type { INodeLogic } from "./INodeLogic";
