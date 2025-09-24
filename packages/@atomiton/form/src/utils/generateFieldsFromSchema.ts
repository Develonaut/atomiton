import { mapZodTypeToControl } from "#mapZodTypeToControl";
import type {
    FieldConfig,
    FieldsMetadata,
    UIControlType,
    ZodSchema,
} from "#types";

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
  if (
    (schema as unknown as { _def?: { typeName?: string } })._def?.typeName !==
    "ZodObject"
  ) {
    throw new Error("Schema must be a ZodObject");
  }

  const shape = (
    schema as unknown as { _def: { shape: () => Record<string, unknown> } }
  )._def.shape();
  const fieldsArray: FieldConfig[] = [];

  for (const [fieldName, fieldSchema] of Object.entries(shape)) {
    const baseField = mapZodTypeToControl(fieldSchema as ZodSchema, fieldName);
    const fieldMetadata = fields[fieldName] || {};

    // Clean property merging - support both 'type' and legacy 'controlType'
    const field: FieldConfig = {
      ...baseField,
      type:
        ("type" in fieldMetadata && fieldMetadata.type) ||
        ("controlType" in fieldMetadata &&
          (fieldMetadata as { controlType?: UIControlType }).controlType) ||
        baseField.type,
      label:
        fieldMetadata.label ||
        fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
      placeholder: fieldMetadata.placeholder,
      helpText: fieldMetadata.helpText,
      // Merge options with metadata taking precedence
      options:
        ("options" in fieldMetadata ? fieldMetadata.options : undefined) ||
        ("options" in baseField ? baseField.options : undefined),
      // Merge numeric properties with metadata taking precedence
      min:
        ("min" in fieldMetadata ? fieldMetadata.min : undefined) ||
        ("min" in baseField ? baseField.min : undefined),
      max:
        ("max" in fieldMetadata ? fieldMetadata.max : undefined) ||
        ("max" in baseField ? baseField.max : undefined),
      step:
        ("step" in fieldMetadata ? fieldMetadata.step : undefined) ||
        ("step" in baseField ? baseField.step : undefined),
      required: fieldMetadata.required ?? baseField.required,
      disabled: fieldMetadata.disabled,
      group: fieldMetadata.group,
      order: fieldMetadata.order,
    } as FieldConfig;

    fieldsArray.push(field);
  }

  return fieldsArray;
}
