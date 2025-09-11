import type { ValidationResult, ValidatorFunction } from "../types/index.js";

export function joiValidator(schema: any): ValidatorFunction {
  return async (value: unknown): Promise<ValidationResult> => {
    try {
      if (!schema || typeof schema.validate !== "function") {
        return { valid: false, error: "Invalid Joi schema" };
      }

      const result = schema.validate(value, { abortEarly: true });

      if (result.error) {
        const firstError = result.error.details?.[0];
        return {
          valid: false,
          error: firstError?.message || "Validation failed",
        };
      }

      return { valid: true };
    } catch (error: any) {
      if (error && typeof error === "object" && "message" in error) {
        return { valid: false, error: error.message };
      }

      return { valid: false, error: "Validation failed" };
    }
  };
}

export function joiObjectValidator(
  objectSchema: any,
): (values: Record<string, unknown>) => Promise<Record<string, string>> {
  return async (values: Record<string, unknown>) => {
    try {
      if (!objectSchema || typeof objectSchema.validate !== "function") {
        return { _form: "Invalid Joi schema" };
      }

      const result = objectSchema.validate(values, { abortEarly: false });

      if (result.error) {
        const errors: Record<string, string> = {};

        if (result.error.details) {
          for (const detail of result.error.details) {
            const path = detail.path.join(".");
            if (path && !errors[path]) {
              errors[path] = detail.message;
            }
          }
        } else {
          errors._form = result.error.message || "Validation failed";
        }

        return errors;
      }

      return {};
    } catch (error: any) {
      const errors: Record<string, string> = {};

      if (error && typeof error === "object" && "message" in error) {
        errors._form = error.message;
      } else {
        errors._form = "Validation failed";
      }

      return errors;
    }
  };
}
