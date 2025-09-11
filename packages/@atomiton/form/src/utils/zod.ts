import type { ZodSchema, ZodError } from "zod";
import type { ValidationResult } from "../types/index.js";

export function zodValidator<T = unknown>(schema: ZodSchema<T>) {
  return async (value: unknown): Promise<ValidationResult> => {
    try {
      await schema.parseAsync(value);
      return { valid: true };
    } catch (error) {
      if (error && typeof error === "object" && "errors" in error) {
        const zodError = error as ZodError;
        return {
          valid: false,
          error: zodError.errors[0]?.message || "Validation failed",
        };
      }
      return {
        valid: false,
        error: "Unknown validation error",
      };
    }
  };
}
