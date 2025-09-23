/**
 * Factory function for creating node executable logic
 */

import type {
  NodeExecutable,
  NodeExecutableInput,
  NodeExecutionContext,
} from "#core/types/executable";

export function createNodeExecutable<TConfig = unknown>(
  input: NodeExecutableInput<TConfig>,
): NodeExecutable<TConfig> {
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

export default createNodeExecutable;
