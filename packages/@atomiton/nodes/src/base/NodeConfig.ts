/**
 * Node Configuration Base Class
 *
 * Base configuration class that all node configs extend from.
 * Provides common configuration options and utilities.
 */

import { z } from "zod";
import type { INodeConfig } from "./INodeConfig";

/**
 * Base schema for common node configuration options
 */
const baseSchema = z.object({
  // Common execution settings
  enabled: z
    .boolean()
    .default(true)
    .describe("Whether this node is enabled for execution"),

  timeout: z
    .number()
    .positive()
    .default(30000)
    .describe("Maximum execution time in milliseconds"),

  retries: z
    .number()
    .int()
    .min(0)
    .default(1)
    .describe("Number of retry attempts on failure"),

  // Common metadata
  label: z.string().optional().describe("Custom label for this node instance"),

  description: z
    .string()
    .optional()
    .describe("Custom description for this node instance"),
});

type BaseSchemaShape = typeof baseSchema.shape;
type ExtendedSchema<T extends z.ZodRawShape> = z.ZodObject<BaseSchemaShape & T>;
type InferredType<T extends z.ZodRawShape> = z.infer<ExtendedSchema<T>>;

/**
 * Node Configuration Base Class
 *
 * All node configurations should extend this class to inherit
 * common configuration options and behavior.
 */
export class NodeConfig<T extends z.ZodRawShape = {}>
  implements INodeConfig<InferredType<T>>
{
  /**
   * The complete schema for this node's configuration
   * Exposed as ZodType to satisfy INodeConfig interface
   */
  public readonly schema: z.ZodType<InferredType<T>>;

  /**
   * Internal: The schema as ZodObject for accessing shape
   * @internal
   */
  readonly _schemaObject: ExtendedSchema<T>;

  /**
   * Default values for this node's configuration
   */
  public readonly defaults: InferredType<T>;

  /**
   * Constructor
   * @param nodeSchema - Node-specific schema to extend the base schema
   * @param nodeDefaults - Node-specific default values
   */
  constructor(nodeSchema: T, nodeDefaults?: Partial<z.infer<z.ZodObject<T>>>) {
    // Extend base schema with node-specific schema
    this._schemaObject = baseSchema.extend(nodeSchema) as ExtendedSchema<T>;
    this.schema = this._schemaObject as z.ZodType<InferredType<T>>;

    // Merge base defaults with node defaults
    this.defaults = {
      enabled: true,
      timeout: 30000,
      retries: 1,
      ...nodeDefaults,
    } as InferredType<T>;
  }

  /**
   * Parse and validate a configuration object
   */
  parse(config: unknown): InferredType<T> {
    return this.schema.parse(config);
  }

  /**
   * Safely parse a configuration object (returns success/error)
   */
  safeParse(config: unknown): z.SafeParseReturnType<unknown, InferredType<T>> {
    return this.schema.safeParse(config);
  }

  /**
   * Get the shape of the schema (for introspection)
   */
  getShape() {
    return this._schemaObject.shape;
  }

  /**
   * Check if a config object is valid
   */
  isValid(config: unknown): boolean {
    return this.safeParse(config).success;
  }

  /**
   * Merge partial config with defaults
   */
  withDefaults(partialConfig?: Partial<InferredType<T>>): InferredType<T> {
    return {
      ...this.defaults,
      ...partialConfig,
    };
  }
}

// Export type for the base config shape
export type NodeConfigBase = z.infer<typeof baseSchema>;
