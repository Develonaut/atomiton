/**
 * YAML to Node Transformation
 *
 * Convert YAML string to Node data structure
 * Works for both atomic and composite nodes
 */

import { fromYaml as parseYaml } from "@atomiton/yaml";
import type { Node } from "../types";
import type { ValidationError } from "../validation/types";

export type TransformationOptions = {
  validateResult?: boolean;
  strict?: boolean;
};

export type TransformationResult<T> = {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
  warnings?: ValidationError[];
};

/**
 * Convert YAML string to Node data structure
 * Used when loading from storage for editing or execution
 */
export function fromYaml(yamlString: string): TransformationResult<Node> {
  const warnings: ValidationError[] = [];

  try {
    // Parse YAML to JSON
    const node = parseYaml(yamlString) as Node;

    // Basic structure check
    if (!node || typeof node !== "object") {
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

    // Basic required fields check
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

    // Type check
    if (node.type !== "atomic" && node.type !== "composite") {
      warnings.push({
        path: "type",
        message: `Unknown node type: ${node.type}. Expected 'atomic' or 'composite'`,
        code: "UNKNOWN_NODE_TYPE",
        data: { type: node.type },
      });
    }

    return {
      success: true,
      data: node,
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
