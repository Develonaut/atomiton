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
    const sourceNodeId = edge.source.nodeId;
    const targetNodeId = edge.target.nodeId;

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
