/**
 * Node Logic Type Definitions
 *
 * Types related to node logic implementation and execution
 */

import type { NodeExecutionContext, NodeExecutionResult } from "../types";

/**
 * Node Logic Interface - Pure business logic, no UI concerns
 * This contains all the execution logic for a node
 */
export interface INodeLogic<TConfig = Record<string, unknown>> {
  /** Execute the node's business logic */
  execute(
    context: NodeExecutionContext,
    config: TConfig,
  ): Promise<NodeExecutionResult>;

  /** Validate node configuration */
  validateConfig?(config: unknown): config is TConfig;

  /** Get default configuration values */
  getDefaultConfig?(): Partial<TConfig>;

  /** Custom validation logic for inputs */
  validateInputs?(inputs: Record<string, unknown>): boolean;
}
