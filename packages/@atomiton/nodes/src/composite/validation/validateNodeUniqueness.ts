import type {
  CompositeNodeSpec,
  ValidationError,
  ValidationResult,
} from "../types";

/**
 * Validate that all node IDs are unique
 */
export function validateNodeUniqueness(
  nodes: CompositeNodeSpec[],
): ValidationResult {
  const errors: ValidationError[] = [];
  const seenIds = new Set<string>();

  nodes.forEach((node, index) => {
    if (seenIds.has(node.id)) {
      errors.push({
        path: `nodes[${index}].id`,
        message: `Duplicate node ID: ${node.id}`,
        code: "DUPLICATE_NODE_ID",
        data: { nodeId: node.id, index },
      });
    } else {
      seenIds.add(node.id);
    }
  });

  return {
    success: errors.length === 0,
    errors,
  };
}
