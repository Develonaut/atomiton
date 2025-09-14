/**
 * Factory function for creating type-safe node logic
 */

import type { NodeExecutionContext, NodeExecutionResult } from "../types";
import type { INodeLogic } from "./INodeLogic";

export type NodeLogicInput<TConfig = unknown> = {
  execute: (
    context: NodeExecutionContext,
    config: TConfig,
  ) => Promise<NodeExecutionResult>;
  validateConfig?: (config: unknown) => TConfig;
  getValidatedParams?: (context: NodeExecutionContext) => TConfig;
};

export function createNodeLogic<TConfig = unknown>(
  input: NodeLogicInput<TConfig>,
): INodeLogic<TConfig> {
  return {
    execute: input.execute,

    getValidatedParams:
      input.getValidatedParams ||
      ((context: NodeExecutionContext) => {
        const params = context.parameters || {};
        if (input.validateConfig) {
          return input.validateConfig(params);
        }
        return params as TConfig;
      }),
  };
}
