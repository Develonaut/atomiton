/**
 * Node Parameters Type Definitions
 *
 * Types related to node parameter schemas and validation
 */

import type { z } from "zod";

/**
 * Control types for form fields
 */
export type FieldControlType =
  | "text"
  | "number"
  | "boolean"
  | "select"
  | "code"
  | "file"
  | "color"
  | "range"
  | "textarea";

/**
 * Configuration for a single form field
 */
export type FieldConfig = {
  controlType: FieldControlType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  options?: Array<{ value: string; label: string }>;
};

/**
 * Collection of field configurations
 */
export type FieldsConfig = Record<string, FieldConfig>;

/**
 * Node parameters structure
 */
export type INodeParameters<T = Record<string, unknown>> = {
  /**
   * The Zod schema for parameter validation
   */
  schema: z.ZodType<T>;

  /**
   * Default parameter values
   */
  defaults: T;

  /**
   * UI field configurations for form rendering
   */
  fields: FieldsConfig;

  /**
   * Parse and validate a parameters object
   */
  parse(params: unknown): T;

  /**
   * Safely parse a parameters object
   */
  safeParse(params: unknown): z.SafeParseReturnType<unknown, T>;

  /**
   * Check if a parameters object is valid
   */
  isValid(params: unknown): boolean;

  /**
   * Merge partial parameters with defaults
   */
  withDefaults(partialParams?: Partial<T>): T;
};
