import type { EditorEdge, EditorNode } from "@atomiton/editor";
import type { NodeDefinition, NodeEdge } from "@atomiton/nodes/definitions";

export function convertNodeToEditorNode(
  node: NodeDefinition,
  index: number
): EditorNode {
  return {
    ...node,
    position: {
      x: 100 + index * 250,
      y: 100,
    },
    data: node.data || {},
    selected: false,
    draggable: true,
    selectable: true,
    connectable: true,
    deletable: true,
  };
}

export function convertEdgeToEditorEdge(edge: NodeEdge): EditorEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    type: "default",
  };
}
