/**
 * Node Parameter Types
 * Field controls, configurations, and parameter definitions
 */

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
 * Node parameters structure (serializable)
 * Contains runtime parameter values as flat key-value pairs
 * Validation logic is in the schema registry
 */
export type NodeParameters = Record<string, unknown>;
