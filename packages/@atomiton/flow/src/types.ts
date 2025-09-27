import type { NodeDefinition } from "@atomiton/nodes/definitions";

/**
 * Current schema version for flows
 */
export const CURRENT_FLOW_VERSION = 1;

/**
 * Flow extends NodeDefinition with schema versioning
 * The 'version' field in NodeDefinition is for the node version
 * The 'schemaVersion' field tracks the flow schema structure version
 */
export type Flow = NodeDefinition & {
  schemaVersion?: number;
};

/**
 * Execution context passed through the flow
 */
export type ExecutionContext = {
  flowId: string;
  executionId: string;
  variables: Record<string, unknown>;
  input: unknown;
  output?: unknown;
  errors: ExecutionError[];
  startTime: Date;
  endTime?: Date;
  status: ExecutionStatus;
};

/**
 * Execution status
 */
export type ExecutionStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

/**
 * Execution error
 */
export type ExecutionError = {
  nodeId?: string;
  message: string;
  timestamp: Date;
  stack?: string;
};

/**
 * Result of executing a node or flow
 */
export type ExecutionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: ExecutionError;
  duration?: number;
};

/**
 * Function signature for node execution
 */
export type NodeExecutor<TInput = unknown, TOutput = unknown> = (
  input: TInput,
  context: ExecutionContext,
) => Promise<ExecutionResult<TOutput>> | ExecutionResult<TOutput>;

/**
 * Function signature for flow execution
 */
export type FlowExecutor<TInput = unknown, TOutput = unknown> = (
  flow: Flow,
  input: TInput,
  context?: Partial<ExecutionContext>,
) => Promise<ExecutionResult<TOutput>>;

/**
 * Type guard to check if a node is a flow
 */
export const isFlow = (node: NodeDefinition): boolean => {
  // A node is a flow if it has nodes
  return Boolean(node.nodes && node.nodes.length > 0);
};

/**
 * Validation result for flows
 */
export type ValidationResult = {
  valid: boolean;
  errors?: string[];
};

// Note: Import Node types directly from @atomiton/nodes/definitions when needed
