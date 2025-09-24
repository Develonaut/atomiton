import type { EditorEdge } from "#hooks/useEditorEdges";
import { generateEdgeId } from "@atomiton/utils";

export function createEdgeFromLastNode(
  lastNodeId: string,
  targetNodeId: string,
): EditorEdge {
  return {
    id: generateEdgeId(lastNodeId),
    source: lastNodeId,
    target: targetNodeId,
    type: "default",
  };
}

export function updateEdgesWithNewEdge(
  existingEdges: EditorEdge[],
  newEdge: EditorEdge,
): EditorEdge[] {
  return [...existingEdges, newEdge];
}
