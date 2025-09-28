/**
 * Node Executable Types
 *
 * Simple interface - just params in, result out.
 * All execution context and status types belong in @atomiton/conductor.
 */

/**
 * Node Executable Interface
 * The only interface needed for node execution
 */
export interface NodeExecutable {
  execute(params: any): Promise<any>;
}

// Legacy types for backward compatibility during migration
// These will be removed once all implementations are updated
export type NodeExecutionStatus = any;
export type NodeExecutionContext = any;
export type NodeExecutionResult = any;
export type NodeExecutableInput<T = any> = NodeExecutable;
export type NodeExecutable_LEGACY<T = any> = NodeExecutable;
