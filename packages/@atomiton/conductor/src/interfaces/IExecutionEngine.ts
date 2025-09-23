import type {
  CompositeDefinition,
  NodeExecutionContext,
} from "@atomiton/nodes/executables";

/**
 * Execution request with input data
 */
export type ExecutionRequest = {
  compositeId: string;
  inputs?: Record<string, unknown>;
  config?: ExecutionConfig;
  context?: Partial<NodeExecutionContext>;
};

/**
 * Execution configuration options
 */
export type ExecutionConfig = {
  timeout?: number;
  maxMemory?: number;
  maxRetries?: number;
  parallel?: boolean;
  debugMode?: boolean;
  errorStrategy?: "fail" | "continue" | "retry";
};

/**
 * Execution result with outputs and metrics
 */
export type ExecutionResult = {
  executionId: string;
  compositeId: string;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
  outputs?: Record<string, unknown>;
  error?: ExecutionError;
  metrics?: ExecutionMetrics;
  nodeResults?: Map<string, NodeExecutionState>;
};

/**
 * Execution status enumeration
 */
export type ExecutionStatus =
  | "pending"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

/**
 * Execution error details
 */
export type ExecutionError = {
  message: string;
  code?: string;
  nodeId?: string;
  stack?: string;
  cause?: Error;
};

/**
 * Execution performance metrics
 */
export type ExecutionMetrics = {
  executionTimeMs: number;
  memoryUsedMB?: number;
  nodesExecuted: number;
  nodesSkipped?: number;
  nodesFailed?: number;
};

/**
 * Node execution state tracking
 */
export type NodeExecutionState = {
  nodeId: string;
  status: ExecutionStatus;
  startTime?: Date;
  endTime?: Date;
  outputs?: Record<string, unknown>;
  error?: ExecutionError;
  retryCount?: number;
};

/**
 * Main execution engine interface
 * Orchestrates Blueprint and node execution
 */
export type IExecutionEngine = {
  /**
   * Execute a Blueprint with given inputs
   */
  execute(request: ExecutionRequest): Promise<ExecutionResult>;

  /**
   * Execute a Composite directly (for nested execution)
   */
  executeComposite(
    composite: CompositeDefinition,
    context: NodeExecutionContext,
  ): Promise<ExecutionResult>;

  /**
   * Pause a running execution
   */
  pause(executionId: string): Promise<void>;

  /**
   * Resume a paused execution
   */
  resume(executionId: string): Promise<void>;

  /**
   * Cancel a running or paused execution
   */
  cancel(executionId: string): Promise<void>;

  /**
   * Get execution status and results
   */
  getExecution(executionId: string): Promise<ExecutionResult | null>;

  /**
   * List all executions
   */
  listExecutions(filter?: {
    status?: ExecutionStatus;
    compositeId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ExecutionResult[]>;

  /**
   * Clean up completed executions
   */
  cleanup(before?: Date): Promise<number>;
};
