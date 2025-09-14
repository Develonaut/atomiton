import type { ZodSchema } from "../types";

export function getDefaultValues(schema: ZodSchema): Record<string, unknown> {
  if (
    (schema as unknown as { _def?: { typeName?: string } })._def?.typeName !==
    "ZodObject"
  ) {
    return {};
  }

  const shape = (
    schema as unknown as { _def: { shape: () => Record<string, unknown> } }
  )._def.shape();
  const defaults: Record<string, unknown> = {};

  for (const [fieldName, fieldSchema] of Object.entries(shape)) {
    const field = fieldSchema as ZodSchema;
    const typeName = (field as unknown as { _def?: { typeName?: string } })._def
      ?.typeName;

    if (typeName === "ZodOptional" || typeName === "ZodNullable") {
      defaults[fieldName] = undefined;
    } else if (typeName === "ZodString") {
      defaults[fieldName] = "";
    } else if (typeName === "ZodNumber") {
      defaults[fieldName] = 0;
    } else if (typeName === "ZodBoolean") {
      defaults[fieldName] = false;
    } else if (typeName === "ZodDate") {
      defaults[fieldName] = undefined;
    } else {
      defaults[fieldName] = undefined;
    }
  }

  return defaults;
}
