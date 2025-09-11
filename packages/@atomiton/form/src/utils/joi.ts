import type { ValidatorFunction } from "../types/index.js";

// Joi schema interface - simplified to avoid direct dependency
interface JoiSchema {
  validate(
    value: any,
    options?: { abortEarly?: boolean },
  ): {
    error?: JoiValidationError;
    value: any;
  };
}

interface JoiValidationError {
  message: string;
  details?: Array<{
    message: string;
    path: (string | number)[];
  }>;
}

export function joiValidator(schema: JoiSchema): ValidatorFunction {
  return async (value: unknown) => {
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
    } catch (error) {
      if (error && typeof error === "object" && "message" in error) {
        return { valid: false, error: (error as Error).message };
      }
      return { valid: false, error: "Validation failed" };
    }
  };
}

export function joiObjectValidator(objectSchema: JoiSchema) {
  return async (values: Record<string, any>) => {
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
    } catch (error) {
      const errors: Record<string, string> = {};

      if (error && typeof error === "object" && "message" in error) {
        errors._form = (error as Error).message;
      } else {
        errors._form = "Validation failed";
      }

      return errors;
    }
  };
}
