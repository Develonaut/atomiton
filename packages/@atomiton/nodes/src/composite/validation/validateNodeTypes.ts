import type {
  CompositeNodeSpec,
  ValidationError,
  ValidationResult,
} from "../types";

/**
 * Validate that all node types are available/registered
 */
export function validateNodeTypes(
  nodes: CompositeNodeSpec[],
  availableNodeTypes: string[],
): ValidationResult {
  const errors: ValidationError[] = [];
  const availableTypesSet = new Set(availableNodeTypes);

  nodes.forEach((node, index) => {
    if (!availableTypesSet.has(node.type)) {
      errors.push({
        path: `nodes[${index}].type`,
        message: `Unknown node type: ${node.type}`,
        code: "UNKNOWN_NODE_TYPE",
        data: {
          nodeId: node.id,
          nodeType: node.type,
          availableTypes: availableNodeTypes,
        },
      });
    }
  });

  return {
    success: errors.length === 0,
    errors,
  };
}
