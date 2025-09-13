import { yaml } from "@atomiton/yaml";
import { validateBlueprint } from "./validation.js";
import type {
  BlueprintDefinition,
  TransformationOptions,
  TransformationResult,
  ValidationError,
  BlueprintValidationContext,
} from "./types.js";

/**
 * Blueprint Transformation Utilities
 *
 * Handles conversion between YAML storage format and JSON runtime format
 * using the @atomiton/yaml package for all YAML operations.
 */

// ==========================
// Default Options
// ==========================

const DEFAULT_TRANSFORMATION_OPTIONS: Required<TransformationOptions> = {
  preserveComments: true,
  formatOutput: true,
  validateResult: true,
};

// ==========================
// YAML to JSON Transformations
// ==========================

/**
 * Convert YAML string to BlueprintDefinition JSON
 * Used when loading from storage for editing or execution
 */
export function fromYaml(
  yamlString: string,
  options: TransformationOptions = {},
  validationContext?: BlueprintValidationContext,
): TransformationResult<BlueprintDefinition> {
  const opts = { ...DEFAULT_TRANSFORMATION_OPTIONS, ...options };
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  try {
    // Parse YAML to object using @atomiton/yaml
    const parsed = yaml.fromYaml<BlueprintDefinition>(yamlString);

    // Validate if requested
    if (opts.validateResult) {
      const validationResult = validateBlueprint(parsed, validationContext);
      errors.push(...validationResult.errors);
      if (validationResult.warnings) {
        warnings.push(...validationResult.warnings);
      }
    }

    // Return result
    return {
      success: errors.length === 0,
      data: parsed,
      errors: errors.length > 0 ? errors : undefined,
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
          data: { error, yamlString },
        },
      ],
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }
}

/**
 * Safely convert YAML string to BlueprintDefinition with comprehensive error handling
 */
export function safeFromYaml(
  yamlString: string,
  options: TransformationOptions = {},
  validationContext?: BlueprintValidationContext,
): TransformationResult<BlueprintDefinition> {
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

// ==========================
// JSON to YAML Transformations
// ==========================

/**
 * Convert BlueprintDefinition JSON to YAML string
 * Used when saving edited content back to storage
 */
export function toYaml(
  blueprint: BlueprintDefinition,
  options: TransformationOptions = {},
  validationContext?: BlueprintValidationContext,
): TransformationResult<string> {
  const opts = { ...DEFAULT_TRANSFORMATION_OPTIONS, ...options };
  const warnings: ValidationError[] = [];

  try {
    // Validate if requested
    if (opts.validateResult) {
      const validationResult = validateBlueprint(blueprint, validationContext);
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
    const yamlOptions = {
      indent: opts.formatOutput ? 2 : undefined,
      lineWidth: opts.formatOutput ? 80 : undefined,
    };

    const yamlString = yaml.toYaml(blueprint, yamlOptions);

    // Format if requested
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
          data: { error, blueprint },
        },
      ],
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }
}

/**
 * Safely convert BlueprintDefinition to YAML with comprehensive error handling
 */
export function safeToYaml(
  blueprint: BlueprintDefinition,
  options: TransformationOptions = {},
  validationContext?: BlueprintValidationContext,
): TransformationResult<string> {
  try {
    return toYaml(blueprint, options, validationContext);
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

// ==========================
// Round-trip Validation
// ==========================

/**
 * Test round-trip conversion (YAML -> JSON -> YAML) to ensure data integrity
 */
export function validateRoundTrip(
  originalYaml: string,
  options: TransformationOptions = {},
  validationContext?: BlueprintValidationContext,
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

// ==========================
// Utility Functions
// ==========================

/**
 * Normalize a blueprint by converting to YAML and back to JSON
 * This ensures consistent formatting and removes any parsing artifacts
 */
export function normalizeBlueprint(
  blueprint: BlueprintDefinition,
  options: TransformationOptions = {},
): TransformationResult<BlueprintDefinition> {
  const yamlResult = toYaml(blueprint, options);
  if (!yamlResult.success || !yamlResult.data) {
    return {
      success: false,
      errors: yamlResult.errors,
      warnings: yamlResult.warnings,
    };
  }

  return fromYaml(yamlResult.data, options);
}

/**
 * Check if a string is valid YAML that can be converted to a blueprint
 */
export function isValidBlueprintYaml(
  yamlString: string,
  validationContext?: BlueprintValidationContext,
): boolean {
  try {
    const result = fromYaml(
      yamlString,
      { validateResult: true },
      validationContext,
    );
    return result.success;
  } catch {
    return false;
  }
}

/**
 * Extract metadata from a YAML string without full parsing
 * Useful for quick file identification and cataloging
 */
export function extractBlueprintMetadata(yamlString: string): {
  id?: string;
  name?: string;
  version?: string;
  created?: string;
  modified?: string;
} | null {
  try {
    const parsed = yaml.fromYaml<Record<string, unknown>>(yamlString);

    return {
      id: typeof parsed?.id === "string" ? parsed.id : undefined,
      name: typeof parsed?.name === "string" ? parsed.name : undefined,
      version: typeof parsed?.version === "string" ? parsed.version : undefined,
      created:
        typeof parsed?.metadata === "object" &&
        parsed.metadata &&
        typeof (parsed.metadata as Record<string, unknown>).created === "string"
          ? ((parsed.metadata as Record<string, unknown>).created as string)
          : undefined,
      modified:
        typeof parsed?.metadata === "object" &&
        parsed.metadata &&
        typeof (parsed.metadata as Record<string, unknown>).modified ===
          "string"
          ? ((parsed.metadata as Record<string, unknown>).modified as string)
          : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Migrate blueprint to current schema version
 * This function can be extended to handle schema version migrations
 */
export function migrateBlueprintVersion(
  blueprint: unknown,
  _targetVersion = "1.0.0",
): TransformationResult<BlueprintDefinition> {
  // For now, we only support version 1.0.0
  // Future versions would implement migration logic here

  const validationResult = validateBlueprint(blueprint);

  if (validationResult.success) {
    return {
      success: true,
      data: blueprint as BlueprintDefinition,
      warnings: validationResult.warnings,
    };
  }

  return {
    success: false,
    errors: validationResult.errors,
    warnings: validationResult.warnings,
  };
}
