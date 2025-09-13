import type { CompositeNode } from "../CompositeNode";
import type { ValidationResult } from "../types";

export function validate(composite: CompositeNode): ValidationResult {
  const validation = composite.validate();
  return {
    success: validation.valid,
    data: validation.valid ? composite : undefined,
    errors: validation.errors.map((error) => ({
      path: composite.id,
      message: error,
      code: "VALIDATION_ERROR",
      data: { nodeId: composite.id },
    })),
    warnings: [],
  };
}
