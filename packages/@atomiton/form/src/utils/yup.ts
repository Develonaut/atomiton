import type { ValidatorFunction } from "../types/index.js";

// Yup schema interface - simplified to avoid direct dependency
interface YupSchema {
  validate(value: any, options?: { abortEarly?: boolean }): Promise<any>;
}

interface YupValidationError {
  message: string;
  path?: string;
  inner?: YupValidationError[];
  errors?: string[];
}

export function yupValidator(schema: YupSchema): ValidatorFunction {
  return async (value: unknown) => {
    try {
      if (!schema || typeof schema.validate !== "function") {
        return { valid: false, error: "Invalid Yup schema" };
      }

      await schema.validate(value, { abortEarly: true });
      return { valid: true };
    } catch (error) {
      if (error && typeof error === "object" && "message" in error) {
        return { valid: false, error: (error as YupValidationError).message };
      }

      if (error && typeof error === "object" && "errors" in error) {
        const errors = (error as YupValidationError).errors;
        return { valid: false, error: errors?.[0] || "Validation failed" };
      }

      return { valid: false, error: "Validation failed" };
    }
  };
}

export function yupObjectValidator(objectSchema: YupSchema) {
  return async (values: Record<string, any>) => {
    try {
      if (!objectSchema || typeof objectSchema.validate !== "function") {
        return { _form: "Invalid Yup schema" };
      }

      await objectSchema.validate(values, { abortEarly: false });
      return {};
    } catch (error) {
      const errors: Record<string, string> = {};

      if (error && typeof error === "object" && "inner" in error) {
        const innerErrors = (error as YupValidationError).inner;
        for (const err of innerErrors || []) {
          if (err.path && !errors[err.path]) {
            errors[err.path] = err.message;
          }
        }
      } else if (error && typeof error === "object" && "message" in error) {
        errors._form = (error as YupValidationError).message;
      } else {
        errors._form = "Validation failed";
      }

      return errors;
    }
  };
}
