import { z } from "zod";

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
  /** Default value */
  defaultValue?: unknown;
  /** Minimum value for number/range controls */
  min?: number;
  /** Maximum value for number/range controls */
  max?: number;
  /** Step size for number/range controls */
  step?: number;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Field grouping */
  group?: string;
  /** Sort order within group */
  order?: number;
}

export interface FieldConfig {
  name: string;
  type: UIControlType;
  label?: string;
  placeholder?: string;
  description?: string;
  helpText?: string;
  options?: Array<{ label: string; value: string | number | boolean }>;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  disabled?: boolean;
  group?: string;
  order?: number;
}

export interface FieldsMetadata {
  [fieldName: string]: UIFieldMetadata;
}

export type ZodSchema = z.ZodTypeAny;
