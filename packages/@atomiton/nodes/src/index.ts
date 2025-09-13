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

import nodes from "./api.js";

export default nodes;
export type { NodesAPI } from "./api.js";
export { ExtendedNode } from "./ExtendedNode.js";
export type { ExtendedNodeConfig } from "./ExtendedNode.js";

export type {
  CompositeEdge,
  IAtomicNode,
  ICompositeNode,
  INode,
} from "./base/INode.js";

export type {
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
  NodePortDefinition,
  NodeType,
} from "./types.js";

export type {
  CompositeChildNode,
  CompositeDefinition,
  CompositeNodeDefinition,
  CompositeNodeSpec,
  CompositePosition,
  CompositeSettings,
  CompositeVariable,
  JsonCompositeDefinition,
} from "./composite/index.js";

export type {
  FieldConfig,
  FieldControlType,
  FormConfig,
} from "./base/NodeConfig.js";
