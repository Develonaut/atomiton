/**
 * Node Executable Types
 *
 * Simple interface - just params in, result out.
 * All execution context and status types belong in @atomiton/conductor.
 */

/**
 * Node Executable Interface
 * Simple interface for node execution - just params in, result out
 * Using 'unknown' for better type safety - implementations must validate their inputs
 */
export type NodeExecutable = {
  execute(params: unknown): Promise<unknown>;
};
