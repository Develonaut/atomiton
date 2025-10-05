/**
 * Child node input resolution utilities
 */

import type { NodeDefinition } from "@atomiton/nodes/definitions";

/**
 * Build input for a child node from edges and parent context
 *
 * If the child has incoming edges with data, use that data.
 * Otherwise, use the parent's input.
 */
export function buildChildNodeInput(
  childNode: NodeDefinition,
  edges: NodeDefinition["edges"],
  nodeOutputs: Map<string, unknown>,
  parentInput: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const edgeInput = edges
    ?.filter((edge) => edge.target === childNode.id)
    .reduce((acc: Record<string, unknown>, edge) => {
      const sourceOutput = nodeOutputs.get(edge.source);
      if (sourceOutput !== undefined) {
        const key = edge.targetHandle || "default";
        return { ...acc, [key]: sourceOutput };
      }
      return acc;
    }, {});

  const hasEdgeData = edgeInput && Object.keys(edgeInput).length > 0;
  return hasEdgeData ? edgeInput : (parentInput ?? {});
}
