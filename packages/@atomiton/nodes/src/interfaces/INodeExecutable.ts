/**
 * INodeExecutable - Interface for node execution logic
 *
 * This interface defines how nodes execute their business logic.
 * Both atomic and composite nodes implement this interface to provide
 * their specific execution behavior.
 */

import type { NodeExecutionContext, NodeExecutionResult } from "../types";

/**
 * Node executable structure for executing business logic
 */
export type INodeExecutable<TConfig = unknown> = {
  /**
   * Execute the node's business logic
   */
  execute: (
    context: NodeExecutionContext,
    config: TConfig,
  ) => Promise<NodeExecutionResult>;

  /**
   * Get validated parameters from the execution context
   */
  getValidatedParams: (context: NodeExecutionContext) => TConfig;
};
