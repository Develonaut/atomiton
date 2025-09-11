/**
 * Node Configuration Type Definitions
 *
 * Types related to node configuration schemas and validation
 */

import type { z } from "zod";

/**
 * Node configuration structure
 */
export type INodeConfig<T = Record<string, unknown>> = {
  /**
   * The Zod schema for configuration validation
   */
  schema: z.ZodType<T>;

  /**
   * Default configuration values
   */
  defaults: T;

  /**
   * Parse and validate a configuration object
   */
  parse(config: unknown): T;

  /**
   * Safely parse a configuration object
   */
  safeParse(config: unknown): z.SafeParseReturnType<unknown, T>;

  /**
   * Check if a config object is valid
   */
  isValid(config: unknown): boolean;

  /**
   * Merge partial config with defaults
   */
  withDefaults(partialConfig?: Partial<T>): T;
};
