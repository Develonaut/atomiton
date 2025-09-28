/**
 * Conductor Execution Types
 *
 * Builds on the simple NodeExecutable from @atomiton/nodes,
 * adding richer execution context and orchestration capabilities.
 */

import type { SimpleNodeExecutable } from '@atomiton/nodes/executables';

/**
 * Conductor's rich execution context
 * Adds orchestration metadata beyond simple parameter passing
 */
export type ExecutionContext = {
  nodeId: string;
  executionId: string;
  variables: Record<string, unknown>;
  input?: unknown;
  parentContext?: ExecutionContext;
}

/**
 * Enhanced execution result with orchestration metadata
 */
export type ExecutionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: ExecutionError;
  duration?: number;
  executedNodes?: string[];
  context?: ExecutionContext;
}

/**
 * Execution error with detailed tracking
 */
export type ExecutionError = {
  nodeId: string;
  message: string;
  code?: string;
  timestamp: Date;
  stack?: string;
}

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
 * Re-export the simple interface for convenience
 */
export type { SimpleNodeExecutable };
