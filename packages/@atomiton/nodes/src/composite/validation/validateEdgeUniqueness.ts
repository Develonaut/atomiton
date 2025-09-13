import type {
  CompositeEdge,
  ValidationError,
  ValidationResult,
} from "../types";

/**
 * Validate that all edge IDs are unique
 */
export function validateEdgeUniqueness(
  edges: CompositeEdge[],
): ValidationResult {
  const errors: ValidationError[] = [];
  const seenIds = new Set<string>();

  edges.forEach((edge, index) => {
    if (seenIds.has(edge.id)) {
      errors.push({
        path: `edges[${index}].id`,
        message: `Duplicate edge ID: ${edge.id}`,
        code: "DUPLICATE_EDGE_ID",
        data: { edgeId: edge.id, index },
      });
    } else {
      seenIds.add(edge.id);
    }
  });

  return {
    success: errors.length === 0,
    errors,
  };
}
