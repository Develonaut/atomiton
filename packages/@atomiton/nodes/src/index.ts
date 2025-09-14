/**
 * @atomiton/nodes - Unified Node Package
 *
 * This package contains both atomic nodes (individual functionality) and
 * composite nodes under a unified INode interface.
 *
 * Mental Model: "If it can execute, it's a node" - whether atomic or composite.
 *
 * Usage:
 *   import nodes from '@atomiton/nodes';
 *
 *   const categories = nodes.getCategories();
 *   const node = nodes.getNode('csv-reader');
 */

import nodes from "./api";

export default nodes;
export type { NodesAPI } from "./api";

// Re-export base module types and classes
export { ExtendedNode, isAtomicNode, isCompositeNode } from "./base";

export type {
  ExtendedNodeConfig,
  CompositeEdge,
  IAtomicNode,
  ICompositeNode,
  INode,
  INodeMetadata,
  INodeConfig,
  FieldConfig,
  FieldControlType,
  FormConfig,
} from "./base";

// NodeType was removed with the registry cleanup
// TODO: Define NodeType properly when node system is reimplemented

// Export other types from types module
export type {
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
  NodePortDefinition,
} from "./types";

// Export composite types
export type {
  CompositeChildNode,
  CompositeDefinition,
  CompositeNodeDefinition,
  CompositeNodeSpec,
  CompositePosition,
  CompositeSettings,
  CompositeVariable,
  JsonCompositeDefinition,
} from "./composite";
