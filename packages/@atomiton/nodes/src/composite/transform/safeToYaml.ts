import type {
  CompositeDefinition,
  CompositeValidationContext,
  TransformationOptions,
  TransformationResult,
} from "../types";
import { toYaml } from "./toYaml";

/**
 * Safely convert CompositeDefinition to YAML with comprehensive error handling
 */
export function safeToYaml(
  composite: CompositeDefinition,
  options: TransformationOptions = {},
  validationContext?: CompositeValidationContext,
): TransformationResult<string> {
  try {
    return toYaml(composite, options, validationContext);
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          path: "root",
          message:
            error instanceof Error
              ? error.message
              : "Unknown transformation error",
          code: "TRANSFORMATION_ERROR",
          data: error,
        },
      ],
    };
  }
}
