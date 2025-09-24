import type { EditorNode } from "#types/EditorNode";
import type { EditorEdge } from "#hooks/useEditorEdges";

export function findConnectedNodes(
  nodeId: string,
  edges: EditorEdge[],
): { predecessors: string[]; successors: string[] } {
  const predecessors = edges
    .filter((edge) => edge.target === nodeId)
    .map((edge) => edge.source);

  const successors = edges
    .filter((edge) => edge.source === nodeId)
    .map((edge) => edge.target);

  return { predecessors, successors };
}

export function canConnectNodes(
  sourceNode: EditorNode,
  targetNode: EditorNode,
  sourcePortId?: string,
  targetPortId?: string,
): boolean {
  const sourcePort = sourcePortId
    ? sourceNode.data.outputPorts.find((p) => p.id === sourcePortId)
    : sourceNode.data.outputPorts[0];

  const targetPort = targetPortId
    ? targetNode.data.inputPorts.find((p) => p.id === targetPortId)
    : targetNode.data.inputPorts[0];

  if (!sourcePort || !targetPort) {
    return false;
  }

  return true;
}
