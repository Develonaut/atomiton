/**
 * Group Types
 * Type definitions for group node execution
 */

import type {
  NodeExecutionContext,
  NodeExecutionResult,
} from "#core/types/executable";

/**
 * Executable node definition
 */
export type ExecutableNode = {
  id: string;
  name: string;
  execute: (context: NodeExecutionContext) => Promise<NodeExecutionResult>;
};

/**
 * Node edge connection
 */
export type NodeEdge = {
  id: string;
  source: string;
  target: string;
  sourcePort?: string;
  targetPort?: string;
};

/**
 * Group graph structure
 */
export type GroupGraph = {
  nodes: ExecutableNode[];
  edges: NodeEdge[];
};

/**
 * Execution metadata
 */
export type ExecutionMetadata = {
  executedAt: string;
  nodeId: string;
  nodeType: string;
  childNodesExecuted: number;
  totalExecutionTime: number;
  failedNode?: string;
};