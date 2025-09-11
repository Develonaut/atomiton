import type { z } from "zod";
import type { ValidatorFunction } from "../types/index.js";

export function zodValidator<T>(schema: z.ZodSchema<T>): ValidatorFunction {
  return async (value: unknown) => {
    try {
      await schema.parseAsync(value);
      return { valid: true };
    } catch (error) {
      if (error && typeof error === "object" && "errors" in error) {
        const zodError = error as z.ZodError;
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
