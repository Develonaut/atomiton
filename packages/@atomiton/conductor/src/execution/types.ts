/**
 * Types for execution graph store and related modules
 */

import type { GraphNode } from "@atomiton/nodes/graph";

/**
 * Node execution states
 */
export type NodeExecutionState =
  | "pending"
  | "executing"
  | "completed"
  | "error"
  | "skipped";

/**
 * Node with execution state
 */
export type ExecutionGraphNode = GraphNode & {
  state: NodeExecutionState;
  progress: number; // 0-100
  message?: string;
  startTime?: number;
  endTime?: number;
  error?: string;
  nodes?: ExecutionGraphNode[]; // Recursive - child nodes with their own progress
};

/**
 * Execution graph state
 */
export type ExecutionGraphState = {
  nodes: Map<string, ExecutionGraphNode>;
  edges: Array<{ from: string; to: string }>;
  executionOrder: string[][];
  criticalPath: string[];
  totalWeight: number;
  maxParallelism: number;
  isExecuting: boolean;
  startTime: number | null;
  endTime: number | null;
  cachedProgress: number; // Cached weighted progress (0-100) - updated on state changes
};
