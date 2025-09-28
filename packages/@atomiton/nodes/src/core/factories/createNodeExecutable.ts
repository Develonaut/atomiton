/**
 * Factory function for creating node executable logic
 */

import type {
  NodeExecutable,
  NodeExecutableInput,
  NodeExecutionContext,
  SimpleNodeExecutable
} from "#core/types/executable";

/**
 * Creates a simple node executable
 * This is the preferred way to create new node executables
 *
 * @param executable - Simple executable with just execute(params) function
 * @returns The executable ready to use
 *
 * @example
 * ```typescript
 * const myExecutable = createSimpleNodeExecutable({
 *   async execute(params) {
 *     // Validate and handle params
 *     return result;
 *   }
 * });
 * ```
 */
export function createSimpleNodeExecutable(
  executable: SimpleNodeExecutable
): SimpleNodeExecutable {
  return executable;
}

/**
 * Creates a node executable with legacy complex signature
 *
 * @deprecated Use createSimpleNodeExecutable instead. This will be removed in next major version.
 * @param input - Legacy executable input with context and config
 * @returns Legacy node executable
 */
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
