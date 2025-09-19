import { nodes } from "../../atomic/nodes";
import type { ValidationError, ValidationResult } from "../types";

function getAvailableNodeTypes(): string[] {
  const nodeTypes: string[] = [];

  for (const node of Object.values(nodes)) {
    if (node && typeof node === "object" && "metadata" in node) {
      const metadata = node.metadata as { id?: string };
      if (metadata && metadata.id) {
        nodeTypes.push(metadata.id);
      }
    }
  }

  if (!nodeTypes.includes("composite")) {
    nodeTypes.push("composite");
  }

  return nodeTypes;
}

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

function findSuggestedType(
  invalidType: string,
  availableTypes: string[],
): string | null {
  const kebabCase = invalidType
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();
  if (availableTypes.includes(kebabCase)) {
    return kebabCase;
  }

  const lowerInvalid = invalidType.toLowerCase();
  for (const validType of availableTypes) {
    if (validType.toLowerCase() === lowerInvalid) {
      return validType;
    }

    if (lowerInvalid === validType + "s" || lowerInvalid === validType + "es") {
      return validType;
    }
  }

  return null;
}

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
