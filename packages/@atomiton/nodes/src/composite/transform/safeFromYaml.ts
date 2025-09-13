import type {
  CompositeDefinition,
  CompositeValidationContext,
  TransformationOptions,
  TransformationResult,
} from "../types";
import { fromYaml } from "./fromYaml";

/**
 * Safely convert YAML string to CompositeDefinition with comprehensive error handling
 */
export function safeFromYaml(
  yamlString: string,
  options: TransformationOptions = {},
  validationContext?: CompositeValidationContext,
): TransformationResult<CompositeDefinition> {
  try {
    return fromYaml(yamlString, options, validationContext);
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
