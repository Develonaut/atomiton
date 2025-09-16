import type { YamlDocument, YamlError, ValidationSchema } from "../types.js";

export function createValidator<T = YamlDocument>(
  schema: (data: unknown) => data is T,
): ValidationSchema<T> {
  const errors: YamlError[] = [];

  return {
    validate: (data: unknown): data is T => {
      errors.length = 0;
      try {
        return schema(data);
      } catch (error) {
        errors.push({
          message: error instanceof Error ? error.message : String(error),
        });
        return false;
      }
    },
    errors,
  };
}

export function validateRequired(
  data: YamlDocument,
  requiredFields: string[],
): YamlError[] {
  const errors: YamlError[] = [];

  if (!data || typeof data !== "object") {
    errors.push({
      message: "Data must be an object",
    });
    return errors;
  }

  requiredFields.forEach((field) => {
    const path = field.split(".");
    let current: unknown = data;

    for (let i = 0; i < path.length; i++) {
      const key = path[i];
      if (current && typeof current === "object" && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        errors.push({
          message: `Required field "${field}" is missing`,
          path,
        });
        break;
      }
    }
  });

  return errors;
}

export function validateType(
  value: unknown,
  expectedType: "string" | "number" | "boolean" | "object" | "array",
): boolean {
  switch (expectedType) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number" && !isNaN(value);
    case "boolean":
      return typeof value === "boolean";
    case "object":
      return (
        value !== null && typeof value === "object" && !Array.isArray(value)
      );
    case "array":
      return Array.isArray(value);
    default:
      return false;
  }
}

export function validateEnum<T>(
  value: unknown,
  allowedValues: readonly T[],
): value is T {
  return allowedValues.includes(value as T);
}

export function validatePattern(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
}

export function validateRange(
  value: number,
  min?: number,
  max?: number,
): boolean {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

export function validateArrayLength(
  array: unknown[],
  minLength?: number,
  maxLength?: number,
): boolean {
  const length = array.length;
  if (minLength !== undefined && length < minLength) return false;
  if (maxLength !== undefined && length > maxLength) return false;
  return true;
}

export function validateSchema<T = YamlDocument>(
  data: unknown,
  schema: ValidationSchema<T>,
): YamlError[] {
  if (!schema.validate(data)) {
    return schema.errors || [{ message: "Validation failed" }];
  }
  return [];
}
