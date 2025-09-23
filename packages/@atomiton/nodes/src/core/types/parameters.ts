/**
 * Node Parameter Types
 * Field controls, configurations, and parameter definitions
 */

import type { VParseResult, VType } from "@atomiton/validation";

/**
 * UI control types for node parameter fields
 */
export type NodeFieldControlType =
  // Text inputs
  | "text" // Single-line text
  | "textarea" // Multi-line text
  | "password" // Password input
  | "email" // Email input
  | "url" // URL input

  // Numeric inputs
  | "number" // Number input
  | "range" // Range slider

  // Selection inputs
  | "boolean" // Checkbox/toggle
  | "select" // Dropdown selection

  // Date/Time inputs
  | "date" // Date picker
  | "datetime" // Date and time picker

  // Specialized inputs
  | "file" // File picker
  | "color" // Color picker

  // Code/Data inputs
  | "json" // JSON editor
  | "code" // Code editor with syntax highlighting
  | "markdown" // Markdown editor
  | "rich-text"; // Rich text editor

/**
 * Configuration for a single form field
 */
export type NodeFieldConfig = {
  // Core properties
  controlType: NodeFieldControlType;
  label: string;

  // Help & hints
  placeholder?: string;
  helpText?: string;

  // Validation
  required?: boolean;

  // Numeric constraints
  min?: number;
  max?: number;
  step?: number;

  // Text area configuration
  rows?: number;

  // Select options
  options?: Array<{
    value: string;
    label: string;
  }>;
};

/**
 * Collection of field configurations
 */
export type NodeFieldsConfig = Record<string, NodeFieldConfig>;

/**
 * Node parameters structure with validation and defaults
 */
export type NodeParameters<T = Record<string, unknown>> = {
  /** The Zod schema for parameter validation */
  schema: VType<T>;

  /** Default parameter values */
  defaults: T;

  /** UI field configurations for form rendering */
  fields: NodeFieldsConfig;

  /** Parse and validate a parameters object */
  parse(params: unknown): T;

  /** Safely parse a parameters object */
  safeParse(params: unknown): VParseResult<T>;

  /** Check if a parameters object is valid */
  isValid(params: unknown): boolean;

  /** Merge partial parameters with defaults */
  withDefaults(partialParams?: Partial<T>): T;
};
