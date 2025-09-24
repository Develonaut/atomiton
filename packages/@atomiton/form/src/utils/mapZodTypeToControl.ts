import {
  STRING_CHECK_TO_CONTROL_MAP,
  ZOD_TYPE_TO_CONTROL_MAP,
} from "#constants";
import type { FieldConfig, UIControlType, ZodSchema } from "#types";

/**
 * Maps a Zod schema type to a form control configuration
 * @param schema - The Zod schema to analyze
 * @param fieldName - The name of the field
 * @returns Field configuration with inferred control type
 */
export function mapZodTypeToControl(
  schema: ZodSchema,
  fieldName: string,
): Partial<FieldConfig> & { name: string; type: UIControlType } {
  const baseField = {
    name: fieldName,
    type: "text" as UIControlType,
    required: !(
      (schema as unknown as { _def?: { typeName?: string } })._def?.typeName ===
        "ZodOptional" ||
      (schema as unknown as { _def?: { typeName?: string } })._def?.typeName ===
        "ZodNullable"
    ),
  };

  const typeName = (schema as unknown as { _def?: { typeName?: string } })._def
    ?.typeName;

  // Use static mapping for basic type conversion
  const mappedType = typeName ? ZOD_TYPE_TO_CONTROL_MAP[typeName] : undefined;

  if (mappedType) {
    baseField.type = mappedType;
  }

  // Handle special cases that need additional processing
  switch (typeName) {
    case "ZodString": {
      const checks =
        (schema as unknown as { _def: { checks?: Array<{ kind: string }> } })
          ._def.checks || [];

      // Check for special string validation types
      for (const check of checks) {
        const mappedControlType = STRING_CHECK_TO_CONTROL_MAP[check.kind];
        if (mappedControlType) {
          return { ...baseField, type: mappedControlType };
        }
      }
      return baseField;
    }

    case "ZodNumber": {
      const checks =
        (
          schema as unknown as {
            _def: { checks?: Array<{ kind: string; value?: number }> };
          }
        )._def.checks || [];
      const minCheck = checks.find(
        (check: { kind: string; value?: number }) => check.kind === "min",
      );
      const maxCheck = checks.find(
        (check: { kind: string; value?: number }) => check.kind === "max",
      );

      return {
        ...baseField,
        type: "number",
        min: minCheck?.value,
        max: maxCheck?.value,
      };
    }

    case "ZodEnum": {
      const values = (
        schema as unknown as { _def: { values: Array<string | number> } }
      )._def.values;
      return {
        ...baseField,
        type: "select",
        options: values.map((value: string | number) => ({
          label: String(value),
          value,
        })),
      };
    }
  }

  if (typeName === "ZodOptional") {
    const result = mapZodTypeToControl(
      (schema as unknown as { _def: { innerType: ZodSchema } })._def.innerType,
      fieldName,
    );
    return { ...result, required: false };
  }

  if (typeName === "ZodNullable") {
    const result = mapZodTypeToControl(
      (schema as unknown as { _def: { innerType: ZodSchema } })._def.innerType,
      fieldName,
    );
    return { ...result, required: false };
  }

  return baseField;
}
