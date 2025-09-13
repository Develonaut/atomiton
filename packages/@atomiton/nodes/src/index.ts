/**
 * @atomiton/nodes - Unified Node Package
 *
 * This package contains both atomic nodes (individual functionality) and
 * composite nodes under a unified INode interface.
 *
 * Mental Model: "If it can execute, it's a node" - whether atomic or composite.
 */

export { nodes } from "./api";
export type { NodesAPI } from "./api";
export { ExtendedNode } from "./ExtendedNode";
export type { ExtendedNodeConfig } from "./ExtendedNode";

export type {
  CompositeEdge,
  IAtomicNode,
  ICompositeNode,
  INode,
} from "./base/INode";

export type {
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
  NodePortDefinition,
  NodeType,
} from "./types";

export type {
  CompositeChildNode,
  CompositeDefinition,
  CompositeNodeDefinition,
  CompositeNodeSpec,
  CompositePosition,
  CompositeSettings,
  CompositeVariable,
} from "./composite";

export type {
  FieldConfig,
  FieldControlType,
  FormConfig,
} from "./base/NodeConfig";
