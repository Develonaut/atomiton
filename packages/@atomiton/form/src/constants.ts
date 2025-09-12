import type { UIControlType } from "./types.js";

/**
 * Zod type name to control type mapping
 * Used in mapZodTypeToControl for cleaner type inference
 */
export const ZOD_TYPE_TO_CONTROL_MAP: Record<string, UIControlType> = {
  ZodString: "text",
  ZodNumber: "number",
  ZodBoolean: "boolean",
  ZodEnum: "select",
  ZodDate: "date",
} as const;

/**
 * String validation check to control type mapping
 * For ZodString with specific validation checks
 */
export const STRING_CHECK_TO_CONTROL_MAP: Record<string, UIControlType> = {
  email: "email",
  url: "url",
} as const;

/**
 * Default field property extractors
 * Clean utilities for extracting field properties with fallbacks
 */
export const FIELD_PROPERTY_EXTRACTORS = {
  /**
   * Extract options from field config with proper typing
   */
  extractOptions: (
    fieldConfig: any,
  ): Array<{ label: string; value: string | number | boolean }> => {
    return ("options" in fieldConfig ? fieldConfig.options : []) as Array<{
      label: string;
      value: string | number | boolean;
    }>;
  },

  /**
   * Extract numeric properties (min, max, step) with proper fallbacks
   */
  extractNumericProps: (fieldConfig: any) => ({
    min: "min" in fieldConfig ? fieldConfig.min : undefined,
    max: "max" in fieldConfig ? fieldConfig.max : undefined,
    step: "step" in fieldConfig ? fieldConfig.step : undefined,
  }),

  /**
   * Extract base field properties with clean defaults
   */
  extractBaseProps: (fieldName: string, fieldConfig: any) => ({
    label: fieldConfig.label || fieldName,
    placeholder: fieldConfig.placeholder || "",
    helpText: fieldConfig.helpText || "",
    disabled: Boolean(fieldConfig.disabled),
  }),
} as const;
