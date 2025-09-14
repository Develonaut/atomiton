/**
 * Base Module Exports
 *
 * Centralized exports for all base functionality.
 * This provides a clean API for importing base types and classes.
 */

// Node base class and extended node
export { Node } from "./Node";
export { ExtendedNode } from "./ExtendedNode";
export type { ExtendedNodeConfig } from "./ExtendedNode";

// Node interfaces and type guards
export type {
  INode,
  IAtomicNode,
  ICompositeNode,
  CompositeEdge,
} from "./INode";
export { isAtomicNode, isCompositeNode } from "./INode";

// Node metadata interfaces and classes
export type { INodeMetadata } from "./INodeMetadata";
export { NodeMetadata } from "./NodeMetadata";

// Node configuration interfaces and classes
export type { INodeConfig } from "./INodeConfig";
export { NodeConfig } from "./NodeConfig";
export type {
  FieldConfig,
  FieldControlType,
  FormConfig,
  FieldsConfig,
} from "./NodeConfig";

// Node logic
export { NodeLogic } from "./NodeLogic";
