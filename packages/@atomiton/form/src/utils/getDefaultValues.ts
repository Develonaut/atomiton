import type { ZodSchema } from "../types.js";

export function getDefaultValues(schema: ZodSchema): Record<string, any> {
  if ((schema as any)._def?.typeName !== "ZodObject") {
    return {};
  }

  const shape = (schema as any)._def.shape();
  const defaults: Record<string, any> = {};

  for (const [fieldName, fieldSchema] of Object.entries(shape)) {
    const field = fieldSchema as ZodSchema;
    const typeName = (field as any)._def?.typeName;

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
