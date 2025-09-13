import { yaml } from "@atomiton/yaml";
import type {
  CompositeValidationContext,
  TransformationOptions,
  TransformationResult,
  ValidationError,
} from "../types";
import { fromYaml } from "./fromYaml";
import { toYaml } from "./toYaml";

/**
 * Test round-trip conversion (YAML -> JSON -> YAML) to ensure data integrity
 */
export function validateRoundTrip(
  originalYaml: string,
  options: TransformationOptions = {},
  validationContext?: CompositeValidationContext,
): TransformationResult<{
  original: string;
  converted: string;
  isEqual: boolean;
}> {
  const warnings: ValidationError[] = [];

  try {
    // Convert YAML to JSON
    const fromYamlResult = fromYaml(originalYaml, options, validationContext);
    if (!fromYamlResult.success || !fromYamlResult.data) {
      return {
        success: false,
        errors: fromYamlResult.errors || [],
        warnings: fromYamlResult.warnings,
      };
    }

    // Convert JSON back to YAML
    const toYamlResult = toYaml(
      fromYamlResult.data,
      options,
      validationContext,
    );
    if (!toYamlResult.success || !toYamlResult.data) {
      return {
        success: false,
        errors: toYamlResult.errors || [],
        warnings: toYamlResult.warnings,
      };
    }

    // Parse both YAML strings to compare semantic equality
    const originalParsed = yaml.fromYaml(originalYaml);
    const convertedParsed = yaml.fromYaml(toYamlResult.data);
    const isEqual =
      JSON.stringify(originalParsed) === JSON.stringify(convertedParsed);

    if (!isEqual) {
      warnings.push({
        path: "roundtrip",
        message: "Round-trip conversion produced semantically different result",
        code: "ROUNDTRIP_MISMATCH",
        data: { originalParsed, convertedParsed },
      });
    }

    return {
      success: true,
      data: {
        original: originalYaml,
        converted: toYamlResult.data,
        isEqual,
      },
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          path: "roundtrip",
          message:
            error instanceof Error
              ? error.message
              : "Round-trip validation failed",
          code: "ROUNDTRIP_ERROR",
          data: error,
        },
      ],
    };
  }
}
