import { yaml } from "@atomiton/yaml";
import type {
  CompositeDefinition,
  CompositeValidationContext,
  TransformationOptions,
  TransformationResult,
  ValidationError,
} from "../types";
import { validateComposite } from "../validation/index";
import { DEFAULT_TRANSFORMATION_OPTIONS } from "./constants";

/**
 * Convert CompositeDefinition JSON to YAML string
 * Used when saving edited content back to storage
 */
export function toYaml(
  composite: CompositeDefinition,
  options: TransformationOptions = {},
  validationContext?: CompositeValidationContext,
): TransformationResult<string> {
  const opts = { ...DEFAULT_TRANSFORMATION_OPTIONS, ...options };
  const warnings: ValidationError[] = [];

  try {
    // Validate if requested
    if (opts.validateResult) {
      const validationResult = validateComposite(composite, validationContext);
      if (validationResult.warnings) {
        warnings.push(...validationResult.warnings);
      }

      // Don't proceed if there are validation errors
      if (validationResult.errors.length > 0) {
        return {
          success: false,
          errors: validationResult.errors,
          warnings: warnings.length > 0 ? warnings : undefined,
        };
      }
    }

    // Convert to YAML using @atomiton/yaml
    const yamlString = yaml.toYaml(composite);

    // Optionally format the output
    const finalYaml = opts.formatOutput
      ? yaml.prettify(yamlString)
      : yamlString;

    return {
      success: true,
      data: finalYaml,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to convert to YAML";

    return {
      success: false,
      errors: [
        {
          path: "root",
          message: errorMessage,
          code: "YAML_STRINGIFY_ERROR",
          data: { error, composite },
        },
      ],
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }
}
