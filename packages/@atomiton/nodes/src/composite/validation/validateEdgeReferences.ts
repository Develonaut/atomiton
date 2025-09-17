import type {
  CompositeEdge,
  CompositeNodeSpec,
  ValidationError,
  ValidationResult,
} from "../types";

/**
 * Validate that all edges reference existing nodes
 */
export function validateEdgeReferences(
  edges: CompositeEdge[],
  nodes: CompositeNodeSpec[],
): ValidationResult {
  const errors: ValidationError[] = [];
  const nodeIds = new Set(nodes.map((node) => node.id));

  edges.forEach((edge, index) => {
    const sourceLastDot = edge.source.lastIndexOf(".");
    const targetLastDot = edge.target.lastIndexOf(".");

    const sourceNodeId =
      sourceLastDot !== -1
        ? edge.source.substring(0, sourceLastDot)
        : edge.source;
    const targetNodeId =
      targetLastDot !== -1
        ? edge.target.substring(0, targetLastDot)
        : edge.target;

    if (!nodeIds.has(sourceNodeId)) {
      errors.push({
        path: `edges[${index}].source`,
        message: `Source node not found: ${sourceNodeId}`,
        code: "INVALID_SOURCE_NODE",
        data: { edgeId: edge.id, sourceId: sourceNodeId },
      });
    }

    if (!nodeIds.has(targetNodeId)) {
      errors.push({
        path: `edges[${index}].target`,
        message: `Target node not found: ${targetNodeId}`,
        code: "INVALID_TARGET_NODE",
        data: { edgeId: edge.id, targetId: targetNodeId },
      });
    }
  });

  return {
    success: errors.length === 0,
    errors,
  };
}
