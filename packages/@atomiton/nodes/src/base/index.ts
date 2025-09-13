/**
 * Base Module Exports
 *
 * Centralized exports for all base functionality.
 * This provides a clean API for importing base types and classes.
 */

// Node base class and extended node
export { Node } from "./Node.js";
export { ExtendedNode } from "./ExtendedNode.js";
export type { ExtendedNodeConfig } from "./ExtendedNode.js";

// Node interfaces and type guards
export type {
  INode,
  IAtomicNode,
  ICompositeNode,
  CompositeEdge,
} from "./INode.js";
export { isAtomicNode, isCompositeNode } from "./INode.js";

// Node metadata interfaces and classes
export type { INodeMetadata } from "./INodeMetadata.js";
export { NodeMetadata } from "./NodeMetadata.js";

// Node configuration interfaces and classes
export type { INodeConfig } from "./INodeConfig.js";
export { NodeConfig } from "./NodeConfig.js";
export type {
  FieldConfig,
  FieldControlType,
  FormConfig,
  FieldsConfig,
} from "./NodeConfig.js";

// Node logic
export { NodeLogic } from "./NodeLogic.js";
