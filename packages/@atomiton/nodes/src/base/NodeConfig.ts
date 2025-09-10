/**
 * Node Configuration Base Class
 *
 * Base configuration class that all node configs extend from.
 * Provides common configuration options and utilities.
 */

import { z } from "zod";
import type { INodeConfig } from "./INodeConfig";

/**
 * UI Control Types for form rendering
 */
export type UIControlType =
  | "text" // Text input
  | "number" // Number input
  | "boolean" // Checkbox/toggle
  | "select" // Dropdown selection
  | "textarea" // Multi-line text
  | "file" // File picker
  | "password" // Password input
  | "email" // Email input
  | "url" // URL input
  | "date" // Date picker
  | "datetime" // Date and time picker
  | "color" // Color picker
  | "range" // Range slider
  | "json"; // JSON editor

/**
 * UI metadata for individual fields
 */
export interface UIFieldMetadata {
  /** Type of form control to render */
  controlType?: UIControlType;
  /** Display label (defaults to field name) */
  label?: string;
  /** Placeholder text for inputs */
  placeholder?: string;
  /** Help text to display */
  helpText?: string;
  /** Options for select controls */
  options?: Array<{ value: string | number | boolean; label: string }>;
  /** Minimum value for number/range controls */
  min?: number;
  /** Maximum value for number/range controls */
  max?: number;
  /** Step increment for number/range controls */
  step?: number;
  /** Number of rows for textarea */
  rows?: number;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Whether field is read-only */
  readOnly?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Field grouping for layout */
  group?: string;
  /** Sort order within group */
  order?: number;
}

/**
 * Complete UI metadata for the node configuration
 */
export interface UIMetadata {
  /** Metadata for individual fields */
  fields?: Record<string, UIFieldMetadata>;
  /** Overall form layout preferences */
  layout?: {
    /** Group fields by category */
    groups?: Record<string, { label: string; order: number }>;
    /** Form layout style */
    style?: "standard" | "compact" | "grid";
  };
}

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
   * UI metadata for form rendering
   */
  public readonly uiMetadata?: UIMetadata;

  /**
   * Constructor
   * @param nodeSchema - Node-specific schema to extend the base schema
   * @param nodeDefaults - Node-specific default values
   * @param uiMetadata - Optional UI metadata for form rendering
   */
  constructor(
    nodeSchema: T,
    nodeDefaults?: Partial<z.infer<z.ZodObject<T>>>,
    uiMetadata?: UIMetadata,
  ) {
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

    // Store UI metadata if provided
    this.uiMetadata = uiMetadata;
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
