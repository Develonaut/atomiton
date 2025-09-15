import type { ValidationError, ValidationResult } from "../types";
import { nodes } from "../../nodes";

/**
 * Get the list of available node types from the registry
 */
function getAvailableNodeTypes(): string[] {
  const nodeTypes: string[] = [];

  // Get node types from the nodes export
  for (const node of Object.values(nodes)) {
    if (node && typeof node === "object" && "metadata" in node) {
      const metadata = node.metadata as { id?: string };
      if (metadata && metadata.id) {
        nodeTypes.push(metadata.id);
      }
    }
  }

  // Always include composite type for blueprints
  if (!nodeTypes.includes("composite")) {
    nodeTypes.push("composite");
  }

  return nodeTypes;
}

/**
 * Custom error class for node type validation
 */
export class NodeTypeValidationError extends Error {
  constructor(
    public nodeType: string,
    public nodeId: string,
    public availableTypes: string[],
  ) {
    const suggestedType = findSuggestedType(nodeType, availableTypes);
    const suggestion = suggestedType ? ` Did you mean "${suggestedType}"?` : "";

    super(
      `Invalid node type "${nodeType}" for node "${nodeId}".${suggestion} ` +
        `Available types: ${availableTypes.join(", ")}`,
    );
    this.name = "NodeTypeValidationError";
  }
}

/**
 * Find a suggested node type based on similarity
 */
function findSuggestedType(
  invalidType: string,
  availableTypes: string[],
): string | null {
  // Check for camelCase to kebab-case conversion
  const kebabCase = invalidType
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();
  if (availableTypes.includes(kebabCase)) {
    return kebabCase;
  }

  // Check for common misspellings
  const lowerInvalid = invalidType.toLowerCase();
  for (const validType of availableTypes) {
    // Exact match (case-insensitive)
    if (validType.toLowerCase() === lowerInvalid) {
      return validType;
    }

    // Check if it's a pluralized version
    if (lowerInvalid === validType + "s" || lowerInvalid === validType + "es") {
      return validType;
    }
  }

  return null;
}

/**
 * Validate that all node types are available/registered
 * If availableNodeTypes is not provided, it will be auto-detected from the registry
 */
export function validateNodeTypes(
  nodes: Array<{ id: string; type: string }>,
  availableNodeTypes?: string[],
): ValidationResult {
  const errors: ValidationError[] = [];
  const availableTypes = availableNodeTypes || getAvailableNodeTypes();
  const availableTypesSet = new Set(availableTypes);

  nodes.forEach((node, index) => {
    if (!availableTypesSet.has(node.type)) {
      const suggestion = findSuggestedType(node.type, availableTypes);
      const suggestionText = suggestion ? ` Did you mean "${suggestion}"?` : "";

      errors.push({
        path: `nodes[${index}].type`,
        message: `Unknown node type: ${node.type}${suggestionText}`,
        code: "UNKNOWN_NODE_TYPE",
        data: {
          nodeId: node.id,
          nodeType: node.type,
          suggestedType: suggestion,
          availableTypes: availableTypes,
        },
      });
    }
  });

  return {
    success: errors.length === 0,
    errors,
  };
}

/**
 * Validate node types with throwing behavior for factory functions
 * Throws NodeTypeValidationError if validation fails
 */
export function validateNodeTypesStrict(
  nodes: Array<{ id: string; type: string }>,
): void {
  const availableTypes = getAvailableNodeTypes();
  const availableTypesSet = new Set(availableTypes);

  for (const node of nodes) {
    if (!availableTypesSet.has(node.type)) {
      throw new NodeTypeValidationError(node.type, node.id, availableTypes);
    }
  }
}
