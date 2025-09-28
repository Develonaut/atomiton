/**
 * Node Executable Types
 *
 * Simple interface - just params in, result out.
 * All execution context and status types belong in @atomiton/conductor.
 */

/**
 * Simple Node Executable Interface
 * The target interface for node execution - just params in, result out
 * Using 'unknown' for better type safety - implementations must validate their inputs
 */
export interface SimpleNodeExecutable {
  execute(params: unknown): Promise<unknown>;
}

/**
 * @deprecated Will be moved to @atomiton/conductor. Use SimpleNodeExecutable for new implementations.
 */
export type NodeExecutionStatus =
  | "idle"
  | "running"
  | "success"
  | "error"
  | "cancelled";

/**
 * @deprecated Will be moved to @atomiton/conductor. Use SimpleNodeExecutable for new implementations.
 * Currently used in 79+ places - will be migrated gradually.
 */
export type NodeExecutionContext = {
  nodeId?: string;
  inputs?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  log?: {
    info?: (message: string, data?: unknown) => void;
    error?: (message: string, data?: unknown) => void;
    warn?: (message: string, data?: unknown) => void;
    debug?: (message: string, data?: unknown) => void;
  };
  [key: string]: unknown;
};

/**
 * @deprecated Will be moved to @atomiton/conductor. Use SimpleNodeExecutable for new implementations.
 * Currently used in 33+ places - will be migrated gradually.
 */
export type NodeExecutionResult = {
  success: boolean;
  outputs?: Record<string, unknown>;
  error?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Legacy node executable input with complex signature
 * @deprecated Use SimpleNodeExecutable for new implementations. This will be removed in next major version.
 */
export type NodeExecutableInput<T = unknown> = {
  execute: (
    context: NodeExecutionContext,
    config: T,
  ) => Promise<NodeExecutionResult>;
  validateConfig?: (config: unknown) => T;
  getValidatedParams?: (context: NodeExecutionContext) => T;
};

/**
 * Legacy node executable with generic configuration
 * @deprecated Use SimpleNodeExecutable for new implementations. This will be removed in next major version.
 */
export type NodeExecutable<T = unknown> = {
  execute: (
    context: NodeExecutionContext,
    config: T,
  ) => Promise<NodeExecutionResult>;
  getValidatedParams: (context: NodeExecutionContext) => T;
};
