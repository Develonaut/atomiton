/**
 * Node Logic Interface
 *
 * Interface for node execution logic
 */

import type { NodeExecutionContext, NodeExecutionResult } from "../types";

/**
 * Node logic structure for executing business logic
 */
export type INodeLogic<TConfig = unknown> = {
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
