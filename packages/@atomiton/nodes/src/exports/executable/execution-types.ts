/**
 * Execution and Runtime Types
 *
 * Types related to node execution, runtime contexts, and results.
 * These types are used when nodes are actually executed.
 */

/**
 * Node execution status
 */
export type NodeExecutionStatus =
  | "idle"
  | "running"
  | "success"
  | "error"
  | "warning"
  | "cancelled"
  | "timeout";

/**
 * Node execution trigger modes
 */
export type NodeExecutionMode =
  | "manual" // User triggered
  | "automatic" // Triggered by input changes
  | "scheduled" // Time-based trigger
  | "webhook"; // External trigger

/**
 * Port data values for node inputs/outputs
 */
export type PortData = unknown;

/**
 * Node parameters for execution
 */
export type NodeParameters = {
  [parameterName: string]: PortData;
};

/**
 * Node inputs from connected ports
 */
export type NodeInputs = {
  [portName: string]: PortData;
};

/**
 * Node outputs to connected ports
 */
export type NodeOutputs = {
  [portName: string]: PortData;
};

/**
 * Execution context metadata
 */
export type ExecutionMetadata = {
  /** Execution run ID */
  runId?: string;
  /** Parent execution ID for composite nodes */
  parentExecutionId?: string;
  /** Debug information */
  debug?: boolean;
  /** Custom execution metadata */
  [key: string]: unknown;
};

/**
 * Execution result metadata
 */
export type ExecutionResultMetadata = {
  /** Node type that produced this result */
  nodeType?: string;
  /** Node instance ID */
  nodeId?: string;
  /** Execution timestamp */
  executedAt?: string;
  /** Execution duration in milliseconds */
  duration?: number;
  /** Cache key for result caching */
  cacheKey?: string;
  /** Custom result metadata */
  [key: string]: unknown;
};

/**
 * Node execution context passed to execute functions
 */
export type NodeExecutionContext = {
  /** Node instance ID */
  nodeId: string;

  /** Composite ID for context */
  compositeId?: string;

  /** Input data from connected ports */
  inputs: NodeInputs;

  /** Node parameters */
  parameters?: NodeParameters;

  /** Workspace root directory */
  workspaceRoot?: string;

  /** Execution metadata */
  metadata?: ExecutionMetadata;

  /** Logging functions */
  log?: {
    debug?: (message: string, data?: unknown) => void;
    info?: (message: string, data?: unknown) => void;
    warn?: (message: string, data?: unknown) => void;
    error?: (message: string, data?: unknown) => void;
  };

  /** Abort signal for cancellation */
  signal?: AbortSignal;
};

/**
 * Result of executing a node
 */
export type NodeExecutionResult = {
  /** Whether execution succeeded */
  success: boolean;

  /** Output values for output ports */
  outputs?: NodeOutputs;

  /** Error message if execution failed */
  error?: string;

  /** Execution metadata */
  metadata?: ExecutionResultMetadata;
};

/**
 * Logging data for debug/info/warn/error
 */
export type LogData = {
  [key: string]: unknown;
};

/**
 * Node configuration parameters
 */
export type NodeConfig = {
  [configKey: string]: PortData;
};

/**
 * JSON Schema for node configuration UI
 */
export type NodeConfigSchema = {
  type?: string;
  properties?: Record<string, unknown>;
  required?: string[];
  [key: string]: unknown;
};
