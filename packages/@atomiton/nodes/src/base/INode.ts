/**
 * INode - Unified interface for all nodes
 *
 * This interface represents the core abstraction: "All things are nodes"
 * Both atomic nodes (CSV reader, HTTP request) and composite nodes (workflows)
 * implement this same interface, creating a powerful composition pattern.
 *
 * Mental Model: INode → IAtomicNode (standalone) and ICompositeNode (combinations)
 */

import type {
  NodeExecutionContext,
  NodeExecutionResult,
  NodePortDefinition,
} from "../types";
import type { INodeParameters } from "./INodeParameters";
import type { INodeMetadata } from "./INodeMetadata";

export type INode = {
  /**
   * Unique identifier for this node
   */
  readonly id: string;

  /**
   * Human-readable name
   */
  readonly name: string;

  /**
   * Type identifier (e.g., "csv-reader", "composite", "http-request")
   */
  readonly type: string;

  /**
   * Metadata about this node
   */
  metadata: INodeMetadata;

  /**
   * Parameters schema, defaults, and field definitions for this node
   */
  parameters: INodeParameters;

  /**
   * Input port definitions
   */
  inputPorts: NodePortDefinition[];

  /**
   * Output port definitions
   */
  outputPorts: NodePortDefinition[];

  /**
   * Execute this node with the given context
   * This is the core method - whether atomic or composite, everything executes the same way
   */
  execute(context: NodeExecutionContext): Promise<NodeExecutionResult>;

  /**
   * Validate this node's configuration and structure
   */
  validate(): { valid: boolean; errors: string[] };

  /**
   * Whether this is a composite node (true) or atomic node (false)
   */
  isComposite: boolean;

  /**
   * Dispose of resources used by this node
   */
  dispose(): void;
};

/**
 * Interface for atomic nodes (leaf nodes that do actual work)
 * Atomic nodes are the building blocks that perform specific tasks
 */
export type IAtomicNode = {
  /**
   * Atomic nodes are never composite
   */
  isComposite: false;
} & INode;

/**
 * Interface for composite nodes (nodes that orchestrate other nodes)
 * Composite nodes contain and coordinate the execution of child nodes
 */
export type ICompositeNode = {
  /**
   * Composite nodes are always composite
   */
  isComposite: true;

  /**
   * Get the child nodes that make up this composite
   */
  getChildNodes(): INode[];

  /**
   * Get the execution flow/edges between child nodes
   */
  getExecutionFlow(): CompositeEdge[];

  /**
   * Add a child node to this composite
   */
  addChildNode(node: INode): void;

  /**
   * Remove a child node from this composite
   */
  removeChildNode(nodeId: string): boolean;

  /**
   * Connect two child nodes in the execution flow
   */
  connectNodes(sourceId: string, targetId: string, edge: CompositeEdge): void;

  /**
   * Set all child nodes at once (for initialization)
   */
  setChildNodes(nodes: INode[]): void;
} & INode;

/**
 * Execution flow edge for composite nodes
 */
export type CompositeEdge = {
  id: string;
  source: {
    nodeId: string;
    portId: string;
  };
  target: {
    nodeId: string;
    portId: string;
  };
  data?: Record<string, unknown>;
};

/**
 * Type guard to check if a node is atomic
 */
export function isAtomicNode(node: INode): node is IAtomicNode {
  return !node.isComposite;
}

/**
 * Type guard to check if a node is composite
 */
export function isCompositeNode(node: INode): node is ICompositeNode {
  return node.isComposite;
}
