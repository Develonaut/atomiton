import { z } from "zod";
import type { FieldConfig, FieldsMetadata, ZodSchema } from "../types.js";
import { mapZodTypeToControl } from "./mapZodTypeToControl.js";

/**
 * Generates field configurations from a Zod object schema
 * @param schema - The Zod object schema to analyze
 * @param fields - Optional UI metadata to merge with inferred field configurations
 * @returns Array of field configurations ready for form rendering
 */
export function generateFieldsFromSchema(
  schema: ZodSchema,
  fields: FieldsMetadata = {},
): FieldConfig[] {
  if ((schema as any)._def?.typeName !== "ZodObject") {
    throw new Error("Schema must be a ZodObject");
  }

  const shape = (schema as any)._def.shape();
  const fieldsArray: FieldConfig[] = [];

  for (const [fieldName, fieldSchema] of Object.entries(shape)) {
    const baseField = mapZodTypeToControl(fieldSchema as ZodSchema, fieldName);
    const fieldMetadata = fields[fieldName] || {};

    const field: FieldConfig = {
      ...baseField,
      type: fieldMetadata.controlType || baseField.type,
      label:
        fieldMetadata.label ||
        fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
      placeholder: fieldMetadata.placeholder,
      helpText: fieldMetadata.helpText,
      options: fieldMetadata.options || baseField.options,
      min: fieldMetadata.min || baseField.min,
      max: fieldMetadata.max || baseField.max,
      step: fieldMetadata.step || baseField.step,
      required: fieldMetadata.required ?? baseField.required,
      disabled: fieldMetadata.disabled,
      group: fieldMetadata.group,
      order: fieldMetadata.order,
    };

    fieldsArray.push(field);
  }

  return fieldsArray;
}
