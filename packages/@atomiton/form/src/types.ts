import type { ZodType } from "@atomiton/validation";

export type AtomitonFieldValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined;
export type AtomitonFieldValues = Record<string, AtomitonFieldValue>;

export type UIControlType =
  | "text" // Text input
  | "textarea" // Multi-line text
  | "number" // Number input
  | "boolean" // Checkbox
  | "select" // Select dropdown
  | "file" // File picker
  | "email" // Email input
  | "password" // Password input
  | "tel" // Phone input
  | "url" // URL input
  | "date" // Date picker
  | "datetime" // Date and time picker
  | "color" // Color picker
  | "range" // Range slider
  | "json"; // JSON editor

/**
 * Base field configuration shared by all field types
 */
export type BaseFieldConfig = {
  /** Field name (auto-generated from schema) */
  name: string;
  /** Type of form control to render */
  type: UIControlType;
  /** Display label (defaults to field name) */
  label?: string;
  /** Placeholder text for inputs */
  placeholder?: string;
  /** Help text to display below the field */
  helpText?: string;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Field grouping for layout */
  group?: string;
  /** Sort order within group */
  order?: number;
};

/**
 * Configuration for select fields
 */
export type SelectFieldConfig = {
  type: "select";
  /** Options for select controls */
  options: Array<{ value: string | number | boolean; label: string }>;
} & BaseFieldConfig;

/**
 * Configuration for numeric fields (number and range)
 */
export type NumberFieldConfig = {
  type: "number" | "range";
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step size */
  step?: number;
} & BaseFieldConfig;

/**
 * Union type for all field configurations
 * This replaces both UIFieldMetadata and the old FieldConfig
 */
export type FieldConfig =
  | BaseFieldConfig
  | SelectFieldConfig
  | NumberFieldConfig;

/**
 * Metadata for fields that can be provided to customize field generation
 * Maps field names to their configuration
 */
export type FieldsMetadata = {
  [fieldName: string]: Partial<Omit<FieldConfig, "name">>;
};

/**
 * Legacy type alias for backwards compatibility
 * @deprecated Use FieldConfig instead
 */
export type UIFieldMetadata = Partial<Omit<FieldConfig, "name">>;

export type ZodSchema = ZodType;
