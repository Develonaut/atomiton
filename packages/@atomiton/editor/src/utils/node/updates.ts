import type { EditorNode, NodeData } from "#types/EditorNode";

export function updateNodeData(
  node: EditorNode,
  dataUpdates: Partial<NodeData>,
): EditorNode {
  return {
    ...node,
    data: {
      ...node.data,
      ...dataUpdates,
    },
  };
}

export function updateNodeParameters(
  node: EditorNode,
  parameterUpdates: Record<string, unknown>,
): EditorNode {
  return updateNodeData(node, {
    parameters: {
      ...node.data.parameters,
      ...parameterUpdates,
    },
  });
}

export function updateMultipleNodes(
  nodes: EditorNode[],
  updates: Partial<EditorNode> | ((node: EditorNode) => Partial<EditorNode>),
): EditorNode[] {
  return nodes.map((node) => ({
    ...node,
    ...(typeof updates === "function" ? updates(node) : updates),
  }));
}

export function updateNodesWithNewNode(
  existingNodes: EditorNode[],
  newNode: EditorNode,
): EditorNode[] {
  return [
    ...existingNodes.map((node) => ({ ...node, selected: false })),
    newNode,
  ];
}
