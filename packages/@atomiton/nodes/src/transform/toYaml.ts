/**
 * Node to YAML Transformation
 *
 * Convert Node data structure to YAML string
 * Works for both atomic and composite nodes
 */

import { yaml } from "@atomiton/yaml";
import type { Node } from "../types";
import type { ValidationError } from "../validation/types";
import type { TransformationResult } from "./fromYaml";

/**
 * Convert Node data structure to YAML string
 * Used when saving to storage
 */
export function toYaml(
  node: Node,
  options: { pretty?: boolean } = {},
): TransformationResult<string> {
  const warnings: ValidationError[] = [];

  try {
    // Basic validation before conversion
    if (!node || typeof node !== "object") {
      return {
        success: false,
        errors: [
          {
            path: "root",
            message: "Invalid node: must be an object",
            code: "INVALID_NODE_STRUCTURE",
          },
        ],
      };
    }

    if (!node.id || !node.name || !node.type) {
      return {
        success: false,
        errors: [
          {
            path: "root",
            message: "Missing required fields: id, name, and type are required",
            code: "MISSING_REQUIRED_FIELDS",
            data: { id: node.id, name: node.name, type: node.type },
          },
        ],
      };
    }

    // Convert to YAML
    const yamlString = yaml.toYaml(node, {
      indent: options.pretty ? 2 : 2, // Default to 2 spaces
      lineWidth: options.pretty ? 80 : 120,
    });

    return {
      success: true,
      data: yamlString,
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
          code: "YAML_CONVERSION_ERROR",
          data: { error, node },
        },
      ],
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }
}
