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
  /**
   * Input data passed to nodes via edges
   * - Keys are handle names (defaults to "default")
   * - Values are outputs from source nodes
   * @example { default: 5, customHandle: { value: 42 } }
   */
  input?: Record<string, unknown>;
  parentContext?: ConductorExecutionContext;
  /**
   * Slow-motion delay in milliseconds for progress visualization (for development/debugging)
   * Total delay per node = slowMo * 2 (two progress steps)
   * - 0 = instant (no delays)
   * - 50 = normal (100ms per node)
   * - 250 = slow (500ms per node)
   * - 1000 = slower (2s per node)
   * - 2500 = very slow (5s per node)
   * - 7500 = super slow (15s per node)
   */
  slowMo?: number;
  /**
   * Debug options for simulating various execution scenarios
   */
  debug?: {
    /**
     * Simulate an error on a specific node
     */
    simulateError?: {
      /** Node ID to fail on (or 'random' for a random node) */
      nodeId: string | "random";
      /** Type of error to simulate */
      errorType:
        | "generic"
        | "timeout"
        | "network"
        | "validation"
        | "permission";
      /** Custom error message (optional) */
      message?: string;
      /** Delay in ms before throwing error (simulates mid-execution failure) */
      delayMs?: number;
    };
    /**
     * Simulate a long-running node
     */
    simulateLongRunning?: {
      /** Node ID to delay (or 'random' for a random node) */
      nodeId: string | "random";
      /** Delay in milliseconds */
      delayMs: number;
    };
  };
};

/**
 * Execution trace event - captures individual events during execution
 */
export type ExecutionTraceEvent = {
  timestamp: number;
  type: "started" | "progress" | "state-change" | "completed" | "error";
  data: unknown;
};

/**
 * Node execution trace - captures execution history for a single node
 */
export type NodeExecutionTrace = {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  state: string; // NodeExecutionState from executionGraphStore
  progress: number;
  events: ExecutionTraceEvent[];
  childTraces?: NodeExecutionTrace[]; // For group nodes
};

/**
 * Complete execution trace - captures full execution history
 */
export type ExecutionTrace = {
  executionId: string;
  rootNodeId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  config: {
    slowMo?: number;
    // ... other config
  };
  events: ExecutionTraceEvent[];
  nodes: NodeExecutionTrace[];
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
  /** Execution trace - complete history of all events and node states */
  trace?: ExecutionTrace;
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
