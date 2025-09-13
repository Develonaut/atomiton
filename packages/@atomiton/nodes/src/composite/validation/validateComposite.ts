import { COMPOSITE_SCHEMA } from "../schema.js";
import type {
  CompositeDefinition,
  CompositeValidationContext,
  ValidationError,
  ValidationResult,
} from "../types.js";
import { validateCompositeSemantics } from "./validateCompositeSemantics.js";

/**
 * Validate a composite definition using Zod schema
 */
export function validateComposite(
  data: unknown,
  context?: CompositeValidationContext,
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  try {
    // First, validate with Zod schema for structure
    const parseResult = COMPOSITE_SCHEMA.safeParse(data);

    if (!parseResult.success) {
      const zodErrors = parseResult.error.errors.map(
        (err): ValidationError => ({
          path: err.path.join("."),
          message: err.message,
          code: err.code,
          data: err,
        }),
      );
      errors.push(...zodErrors);
    } else {
      // If schema validation passes, perform semantic validation
      const parsedData = parseResult.data as CompositeDefinition;
      const semanticResult = validateCompositeSemantics(parsedData, context);
      errors.push(...semanticResult.errors);
      warnings.push(...(semanticResult.warnings || []));
    }
  } catch (error) {
    errors.push({
      path: "root",
      message:
        error instanceof Error ? error.message : "Unknown validation error",
      code: "VALIDATION_ERROR",
      data: error,
    });
  }

  return {
    success: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
