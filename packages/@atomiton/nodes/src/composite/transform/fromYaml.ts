import { fromYaml as parseYaml } from "@atomiton/yaml";
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
 * Convert YAML string to CompositeDefinition JSON
 * Used when loading from storage for editing or execution
 */
export function fromYaml(
  yamlString: string,
  options: TransformationOptions = {},
  validationContext?: CompositeValidationContext,
): TransformationResult<CompositeDefinition> {
  const opts = { ...DEFAULT_TRANSFORMATION_OPTIONS, ...options };
  const warnings: ValidationError[] = [];

  try {
    // Parse YAML to JSON
    const composite = parseYaml(yamlString) as CompositeDefinition;

    // Basic structure check
    if (!composite || typeof composite !== "object") {
      return {
        success: false,
        errors: [
          {
            path: "root",
            message: "Invalid YAML: must be an object",
            code: "INVALID_YAML_STRUCTURE",
          },
        ],
      };
    }

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

    return {
      success: true,
      data: composite,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to parse YAML";

    return {
      success: false,
      errors: [
        {
          path: "root",
          message: errorMessage,
          code: "YAML_PARSE_ERROR",
          data: { error, yamlString: yamlString.substring(0, 200) + "..." },
        },
      ],
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }
}
