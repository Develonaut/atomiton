import { toYaml as stringifyYaml, prettify } from "@atomiton/yaml";
import type { Node } from "../../types";
import type {
  CompositeDefinition,
  CompositeValidationContext,
  CompositeVariable,
  TransformationOptions,
  TransformationResult,
  ValidationError,
} from "../types";
import { validateComposite } from "../validation/index";
import { DEFAULT_TRANSFORMATION_OPTIONS } from "./constants";
import {
  transformToCompositeEdges,
  transformToCompositeNodeSpecs,
} from "./transformers";
import { isRecord, safeObject, safeString } from "./typeGuards";

/**
 * Convert CompositeDefinition JSON to YAML string
 * Intelligently picks only the properties that belong in a CompositeDefinition
 * and ignores any extra properties (like React Flow props)
 */
export function toYaml(
  composite: unknown,
  options: TransformationOptions = {},
  validationContext?: CompositeValidationContext,
): TransformationResult<string> {
  // Default to no validation for resilience - let caller opt-in to validation
  const opts = {
    ...DEFAULT_TRANSFORMATION_OPTIONS,
    validateResult: false, // Override default to be resilient
    ...options,
  };
  const warnings: ValidationError[] = [];

  try {
    // Validate input is an object-like structure
    if (!isRecord(composite)) {
      return {
        success: false,
        errors: [
          {
            path: "root",
            message: "Input must be an object",
            code: "INVALID_INPUT_TYPE",
            data: { composite, type: typeof composite },
          },
        ],
      };
    }

    // Extract required fields with safe type checking
    const id = safeString(composite.id);
    const name = safeString(composite.name);

    if (!id || !name) {
      return {
        success: false,
        errors: [
          {
            path: "root",
            message:
              "Missing required fields: id and name must be non-empty strings",
            code: "MISSING_REQUIRED_FIELDS",
            data: { id, name },
          },
        ],
      };
    }

    // Build the clean composite with type safety
    const type = safeString(composite.type, "composite");
    const category = safeString(composite.category, "user");

    // Create default metadata if none provided
    const defaultMetadata = {
      source: "user" as const,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    };
    const metadata = safeObject(composite.metadata, defaultMetadata);

    // Transform nodes and edges using type-safe transformers
    const nodes = transformToCompositeNodeSpecs(composite.nodes);
    const edges = transformToCompositeEdges(composite.edges);

    // Build the clean composite definition
    const cleanComposite: CompositeDefinition = {
      id,
      name,
      type,
      category,
      metadata,
      nodes,
      edges,
    };

    // Add optional fields only if they exist and are valid
    if (composite.description && typeof composite.description === "string") {
      cleanComposite.description = composite.description;
    }

    if (composite.version && typeof composite.version === "string") {
      cleanComposite.version = composite.version;
    }

    if (composite.inputPorts) {
      cleanComposite.inputPorts = composite.inputPorts as Node["inputPorts"];
    }

    if (composite.outputPorts) {
      cleanComposite.outputPorts = composite.outputPorts as Node["outputPorts"];
    }

    if (composite.variables) {
      cleanComposite.variables = safeObject(composite.variables) as Record<
        string,
        CompositeVariable
      >;
    }

    if (composite.settings) {
      cleanComposite.settings = safeObject(composite.settings);
    }

    // Validate if requested
    if (opts.validateResult) {
      const validationResult = validateComposite(
        cleanComposite,
        validationContext,
      );
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
    const yamlString = stringifyYaml(cleanComposite, { indent: 2 });

    // Optionally format the output
    const finalYaml = opts.formatOutput ? prettify(yamlString) : yamlString;

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
