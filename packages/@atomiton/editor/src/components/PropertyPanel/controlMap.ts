/**
 * Control Map for Property Panel
 *
 * Maps Zod schema types to UI control components for dynamic property rendering
 * This acts like a routing system for property controls based on their data types
 */

import type { ComponentType } from "react";
import type { ZodType, ZodTypeAny } from "zod";

/**
 * Base props that all control components will receive
 */
export type ControlProps<T = any> = {
  value: T;
  onChange: (value: T) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  placeholder?: string;
};

/**
 * Extended control props for specific control types
 */
export type TextControlProps = {
  multiline?: boolean;
  maxLength?: number;
  minLength?: number;
} & ControlProps<string>;

export type NumberControlProps = {
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
} & ControlProps<number>;

export type SelectControlProps<T = string> = {
  options: Array<{
    label: string;
    value: T;
    disabled?: boolean;
  }>;
  multiple?: boolean;
} & ControlProps<T>;

export type SliderControlProps = {
  min: number;
  max: number;
  step?: number;
  marks?: Array<{ value: number; label?: string }>;
} & ControlProps<number>;

export type ColorControlProps = {
  format?: "hex" | "rgb" | "hsl";
  showAlpha?: boolean;
  presets?: string[];
} & ControlProps<string>;

export type FileControlProps = {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
} & ControlProps<string | File>;

export type ArrayControlProps<T = any> = {
  itemComponent?: ComponentType<ControlProps<T>>;
  addLabel?: string;
  removeLabel?: string;
  maxItems?: number;
  minItems?: number;
} & ControlProps<T[]>;

export type ObjectControlProps = {
  fields?: Record<string, ComponentType<ControlProps>>;
  collapsible?: boolean;
  defaultExpanded?: boolean;
} & ControlProps<Record<string, any>>;

/**
 * Control type definitions
 */
export type ControlType =
  | "text"
  | "textarea"
  | "number"
  | "slider"
  | "select"
  | "boolean"
  | "switch"
  | "checkbox"
  | "radio"
  | "color"
  | "date"
  | "time"
  | "datetime"
  | "file"
  | "url"
  | "email"
  | "password"
  | "json"
  | "code"
  | "markdown"
  | "array"
  | "object"
  | "custom";

/**
 * Control configuration
 */
export type ControlConfig = {
  type: ControlType;
  component?: ComponentType<any>;
  props?: Record<string, any>;
  validator?: (value: any) => boolean | string;
  formatter?: (value: any) => any;
  parser?: (value: any) => any;
};

/**
 * Schema type detection utilities
 */
export const SchemaDetectors = {
  isString: (schema: ZodTypeAny): boolean => {
    return schema._def.typeName === "ZodString";
  },

  isNumber: (schema: ZodTypeAny): boolean => {
    return schema._def.typeName === "ZodNumber";
  },

  isBoolean: (schema: ZodTypeAny): boolean => {
    return schema._def.typeName === "ZodBoolean";
  },

  isEnum: (schema: ZodTypeAny): boolean => {
    return schema._def.typeName === "ZodEnum";
  },

  isArray: (schema: ZodTypeAny): boolean => {
    return schema._def.typeName === "ZodArray";
  },

  isObject: (schema: ZodTypeAny): boolean => {
    return schema._def.typeName === "ZodObject";
  },

  isOptional: (schema: ZodTypeAny): boolean => {
    return schema._def.typeName === "ZodOptional";
  },

  isNullable: (schema: ZodTypeAny): boolean => {
    return schema._def.typeName === "ZodNullable";
  },

  isUnion: (schema: ZodTypeAny): boolean => {
    return schema._def.typeName === "ZodUnion";
  },

  isRecord: (schema: ZodTypeAny): boolean => {
    return schema._def.typeName === "ZodRecord";
  },
};

/**
 * Main control mapping configuration
 * Maps Zod schema types to appropriate UI controls
 */
export const CONTROL_MAP: Record<string, ControlConfig> = {
  // Text-based controls
  string: {
    type: "text",
    props: {
      type: "text",
    },
  },
  "string.url": {
    type: "url",
    props: {
      type: "url",
      placeholder: "https://example.com",
    },
    validator: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return "Must be a valid URL";
      }
    },
  },
  "string.email": {
    type: "email",
    props: {
      type: "email",
      placeholder: "user@example.com",
    },
  },
  "string.password": {
    type: "password",
    props: {
      type: "password",
    },
  },
  "string.multiline": {
    type: "textarea",
    props: {
      rows: 4,
    },
  },
  "string.json": {
    type: "json",
    props: {
      language: "json",
    },
    validator: (value: string) => {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return "Must be valid JSON";
      }
    },
  },
  "string.code": {
    type: "code",
    props: {
      language: "javascript",
    },
  },
  "string.markdown": {
    type: "markdown",
    props: {
      preview: true,
    },
  },

  // Number controls
  number: {
    type: "number",
    props: {
      type: "number",
      step: 1,
    },
  },
  "number.slider": {
    type: "slider",
    props: {
      min: 0,
      max: 100,
      step: 1,
    },
  },
  "number.float": {
    type: "number",
    props: {
      type: "number",
      step: 0.01,
      precision: 2,
    },
  },

  // Boolean controls
  boolean: {
    type: "switch",
    props: {},
  },
  "boolean.checkbox": {
    type: "checkbox",
    props: {},
  },

  // Selection controls
  enum: {
    type: "select",
    props: {
      multiple: false,
    },
  },
  "enum.radio": {
    type: "radio",
    props: {},
  },

  // Color control
  color: {
    type: "color",
    props: {
      format: "hex",
      showAlpha: true,
    },
  },

  // Date/Time controls
  date: {
    type: "date",
    props: {
      type: "date",
    },
  },
  time: {
    type: "time",
    props: {
      type: "time",
    },
  },
  datetime: {
    type: "datetime",
    props: {
      type: "datetime-local",
    },
  },

  // File control
  file: {
    type: "file",
    props: {
      accept: "*/*",
    },
  },

  // Complex types
  array: {
    type: "array",
    props: {
      addLabel: "Add Item",
      removeLabel: "Remove",
    },
  },
  object: {
    type: "object",
    props: {
      collapsible: true,
      defaultExpanded: false,
    },
  },
  record: {
    type: "object",
    props: {
      collapsible: true,
      defaultExpanded: false,
      keyEditable: true,
    },
  },
};

/**
 * Special property hints that can override default control selection
 * These are based on property names or descriptions
 */
export const PROPERTY_HINTS: Record<string, Partial<ControlConfig>> = {
  // Common property names
  password: { type: "password" },
  email: { type: "email" },
  url: { type: "url" },
  color: { type: "color" },
  backgroundColor: { type: "color" },
  borderColor: { type: "color" },
  fillColor: { type: "color" },
  strokeColor: { type: "color" },
  description: { type: "textarea" },
  content: { type: "textarea" },
  body: { type: "textarea" },
  message: { type: "textarea" },
  notes: { type: "textarea" },
  code: { type: "code" },
  script: { type: "code" },
  query: { type: "code" },
  json: { type: "json" },
  config: { type: "json" },
  settings: { type: "json" },
  metadata: { type: "json" },
  markdown: { type: "markdown" },
  readme: { type: "markdown" },
  opacity: { type: "slider", props: { min: 0, max: 1, step: 0.01 } },
  alpha: { type: "slider", props: { min: 0, max: 1, step: 0.01 } },
  rotation: { type: "slider", props: { min: 0, max: 360, step: 1 } },
  angle: { type: "slider", props: { min: 0, max: 360, step: 1 } },
  scale: { type: "slider", props: { min: 0, max: 10, step: 0.1 } },
  zoom: { type: "slider", props: { min: 0.1, max: 10, step: 0.1 } },
  duration: { type: "number", props: { min: 0, step: 100 } },
  delay: { type: "number", props: { min: 0, step: 100 } },
  timeout: { type: "number", props: { min: 0, step: 1000 } },
  port: { type: "number", props: { min: 1, max: 65535, step: 1 } },
  enabled: { type: "switch" },
  disabled: { type: "switch" },
  visible: { type: "switch" },
  hidden: { type: "switch" },
  active: { type: "switch" },
  selected: { type: "switch" },
  checked: { type: "checkbox" },
};

/**
 * Function to determine the appropriate control for a Zod schema
 */
export function getControlForSchema(
  schema: ZodTypeAny,
  propertyName?: string,
  hints?: Partial<ControlConfig>,
): ControlConfig {
  // Check property name hints first
  if (propertyName && PROPERTY_HINTS[propertyName]) {
    return { ...PROPERTY_HINTS[propertyName], ...hints };
  }

  // Check for custom hints
  if (hints?.type) {
    return hints as ControlConfig;
  }

  // Detect schema type and return appropriate control
  if (SchemaDetectors.isString(schema)) {
    // Check for specific string validations
    const checks = (schema as any)._def.checks || [];
    for (const check of checks) {
      if (check.kind === "url") return CONTROL_MAP["string.url"];
      if (check.kind === "email") return CONTROL_MAP["string.email"];
    }
    return CONTROL_MAP["string"];
  }

  if (SchemaDetectors.isNumber(schema)) {
    // Check for min/max to suggest slider
    const checks = (schema as any)._def.checks || [];
    const hasMin = checks.some((c: any) => c.kind === "min");
    const hasMax = checks.some((c: any) => c.kind === "max");
    if (hasMin && hasMax) {
      return CONTROL_MAP["number.slider"];
    }
    return CONTROL_MAP["number"];
  }

  if (SchemaDetectors.isBoolean(schema)) {
    return CONTROL_MAP["boolean"];
  }

  if (SchemaDetectors.isEnum(schema)) {
    const values = (schema as any)._def.values;
    if (values.length <= 3) {
      return CONTROL_MAP["enum.radio"];
    }
    return CONTROL_MAP["enum"];
  }

  if (SchemaDetectors.isArray(schema)) {
    return CONTROL_MAP["array"];
  }

  if (SchemaDetectors.isObject(schema)) {
    return CONTROL_MAP["object"];
  }

  if (SchemaDetectors.isRecord(schema)) {
    return CONTROL_MAP["record"];
  }

  // Default fallback
  return { type: "custom" };
}

/**
 * Registry for custom control components
 */
export class ControlRegistry {
  private controls: Map<ControlType, ComponentType<any>> = new Map();

  register(type: ControlType, component: ComponentType<any>) {
    this.controls.set(type, component);
  }

  get(type: ControlType): ComponentType<any> | undefined {
    return this.controls.get(type);
  }

  has(type: ControlType): boolean {
    return this.controls.has(type);
  }
}

// Create a global registry instance
export const controlRegistry = new ControlRegistry();
