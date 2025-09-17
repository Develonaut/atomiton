/**
 * Factory function for creating node executable logic
 */

import type {
  NodeExecutionContext,
  NodeExecutionResult,
} from "../exports/executable/execution-types";
import type { INodeExecutable } from "../interfaces/INodeExecutable";

export type NodeExecutableInput<TConfig = unknown> = {
  execute: (
    context: NodeExecutionContext,
    config: TConfig,
  ) => Promise<NodeExecutionResult>;
  validateConfig?: (config: unknown) => TConfig;
  getValidatedParams?: (context: NodeExecutionContext) => TConfig;
};

export function createAtomicExecutable<TConfig = unknown>(
  input: NodeExecutableInput<TConfig>,
): INodeExecutable<TConfig> {
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
