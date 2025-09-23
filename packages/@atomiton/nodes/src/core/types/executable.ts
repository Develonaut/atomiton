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
 * Node execution context
 *
 * Runtime context passed to node execute functions
 */
export type NodeExecutionContext = {
  /** Node instance ID */
  nodeId: string;

  /** Input data from connected ports */
  inputs: Record<string, unknown>;

  /** Node parameters */
  parameters?: Record<string, unknown>;

  /** Workspace root directory */
  workspaceRoot?: string;

  /** Execution metadata */
  metadata?: Record<string, unknown>;

  /** Logging functions */
  log?: {
    debug?: (message: string, data?: unknown) => void;
    info?: (message: string, data?: unknown) => void;
    warn?: (message: string, data?: unknown) => void;
    error?: (message: string, data?: unknown) => void;
  };

  /** Abort signal for cancellation */
  signal?: AbortSignal;

  /** Execution start time */
  startTime?: Date;

  /** Progress reporting function */
  reportProgress?: (progress: number, message?: string) => void;

  /** Execution limits */
  limits?: {
    maxExecutionTimeMs?: number;
    maxMemoryMB?: number;
  };
};

/**
 * Result of executing a node
 */
export type NodeExecutionResult = {
  /** Whether execution succeeded */
  success: boolean;

  /** Output values for output ports */
  outputs?: Record<string, unknown>;

  /** Error message if execution failed */
  error?: string;

  /** Execution metadata */
  metadata?: Record<string, unknown>;
};

/**
 * Node executable input structure
 */
export type NodeExecutableInput<TConfig = unknown> = {
  execute: (
    context: NodeExecutionContext,
    config: TConfig,
  ) => Promise<NodeExecutionResult>;

  validateConfig?: (config: unknown) => TConfig;

  getValidatedParams?: (context: NodeExecutionContext) => TConfig;
};

/**
 * Node Executable
 *
 * Defines the runtime execution logic for a node
 */
export type NodeExecutable<TConfig = unknown> = {
  /** Execute the node's business logic */
  execute: (
    context: NodeExecutionContext,
    config: TConfig,
  ) => Promise<NodeExecutionResult>;

  /** Get validated parameters from the execution context */
  getValidatedParams: (context: NodeExecutionContext) => TConfig;
};
