import type { ValidationResult, ValidatorFunction } from "../types/index.js";

export function yupValidator(schema: any): ValidatorFunction {
  return async (value: unknown): Promise<ValidationResult> => {
    try {
      if (!schema || typeof schema.validate !== "function") {
        return { valid: false, error: "Invalid Yup schema" };
      }

      await schema.validate(value, { abortEarly: true });
      return { valid: true };
    } catch (error: any) {
      if (error && typeof error === "object" && "message" in error) {
        return { valid: false, error: error.message };
      }

      if (error && typeof error === "object" && "errors" in error) {
        const errors = error.errors as string[];
        return { valid: false, error: errors[0] || "Validation failed" };
      }

      return { valid: false, error: "Validation failed" };
    }
  };
}

export function yupObjectValidator(
  objectSchema: any,
): (values: Record<string, unknown>) => Promise<Record<string, string>> {
  return async (values: Record<string, unknown>) => {
    try {
      if (!objectSchema || typeof objectSchema.validate !== "function") {
        return { _form: "Invalid Yup schema" };
      }

      await objectSchema.validate(values, { abortEarly: false });
      return {};
    } catch (error: any) {
      const errors: Record<string, string> = {};

      if (error && typeof error === "object" && "inner" in error) {
        const innerErrors = error.inner as Array<{
          path?: string;
          message: string;
        }>;

        for (const err of innerErrors) {
          if (err.path && !errors[err.path]) {
            errors[err.path] = err.message;
          }
        }
      } else if (error && typeof error === "object" && "message" in error) {
        errors._form = error.message;
      } else {
        errors._form = "Validation failed";
      }

      return errors;
    }
  };
}
