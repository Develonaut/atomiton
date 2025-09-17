/**
 * IExecutableNode - Runtime interface for executable nodes
 *
 * This interface represents nodes that can be executed at runtime.
 * Both atomic nodes (CSV reader, HTTP request) and composite nodes (workflows)
 * implement this same interface, creating a powerful composition pattern.
 *
 * Mental Model: IExecutableNode → IAtomicNode (standalone) and ICompositeNode (orchestrated)
 */

import type { NodeType, NodePortDefinition } from "../types";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
} from "../exports/executable/execution-types";
import type { INodeParameters } from "./INodeParameters";
import type { INodeMetadata } from "./INodeMetadata";

export type IExecutableNode = {
  /**
   * Unique identifier for this node
   */
  readonly id: string;

  /**
   * Human-readable name
   */
  readonly name: string;

  /**
   * Base node type (atomic or composite)
   */
  readonly type: NodeType;

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
   * Node type is always atomic
   */
  type: "atomic";
} & IExecutableNode;

/**
 * Interface for composite nodes (nodes that orchestrate other nodes)
 * Composite nodes contain and coordinate the execution of child nodes
 */
export type ICompositeNode = {
  /**
   * Node type is always composite
   */
  type: "composite";

  /**
   * Get the child nodes that make up this composite
   */
  getChildNodes(): IExecutableNode[];

  /**
   * Get the execution flow/edges between child nodes
   */
  getExecutionFlow(): CompositeEdge[];

  /**
   * Add a child node to this composite
   */
  addChildNode(node: IExecutableNode): void;

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
  setChildNodes(nodes: IExecutableNode[]): void;
} & IExecutableNode;

/**
 * Execution flow edge for composite nodes
 * Compatible with visual editor edge format (matches React Flow Edge type)
 */
export type CompositeEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  data?: Record<string, unknown>;
  style?: Record<string, unknown>;
  // Additional React Flow edge properties
  animated?: boolean;
  hidden?: boolean;
  deletable?: boolean;
  selectable?: boolean;
};

/**
 * Type guard to check if a node is atomic
 */
export function isAtomicNode(node: IExecutableNode): node is IAtomicNode {
  return node.type === "atomic";
}

/**
 * Type guard to check if a node is composite
 */
export function isCompositeNode(node: IExecutableNode): node is ICompositeNode {
  return node.type === "composite";
}
