import type { Node, NodeEdge } from "@atomiton/nodes/browser";
import type { EditorNode, EditorEdge } from "@atomiton/editor";

export function convertNodeToEditorNode(node: Node, index: number): EditorNode {
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
