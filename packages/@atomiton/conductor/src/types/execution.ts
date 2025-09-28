/**
 * Conductor Execution Types
 *
 * Builds on the NodeExecutable from @atomiton/nodes,
 * adding richer execution context and orchestration capabilities.
 */

import type { NodeExecutable } from "@atomiton/nodes/executables";

/**
 * Conductor's rich execution context
 * Adds orchestration metadata beyond simple parameter passing
 */
export type ConductorExecutionContext = {
  nodeId: string;
  executionId: string;
  variables: Record<string, unknown>;
  input?: unknown;
  parentContext?: ConductorExecutionContext;
};

/**
 * Enhanced execution result with orchestration metadata
 */
export type ExecutionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: ExecutionError;
  /** Execution duration in milliseconds */
  duration?: number;
  executedNodes?: string[];
  context?: ConductorExecutionContext;
};

/**
 * Execution error with detailed tracking
 */
export type ExecutionError = {
  nodeId: string;
  message: string;
  code?: string;
  timestamp: Date;
  stack?: string;
};

/**
 * Execution status for tracking node state
 */
export type ExecutionStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

/**
 * Node executor factory function type - provides access to node executables
 * This should be injected as a dependency to avoid dynamic imports
 */
export type NodeExecutorFactory = {
  getNodeExecutable(nodeType: string): NodeExecutable | undefined;
};
