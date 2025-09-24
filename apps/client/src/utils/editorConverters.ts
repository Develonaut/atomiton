import type { EditorEdge, EditorNode } from "@atomiton/editor";
import type { NodeDefinition, NodeEdge } from "@atomiton/nodes/definitions";

export function convertNodeToEditorNode(
  node: NodeDefinition,
  index: number,
): EditorNode {
  return {
    id: node.id,
    type: node.name, // Use node name as React Flow node type
    position: node.position || {
      x: 100 + index * 250,
      y: 100,
    },
    data: {
      name: node.name,
      metadata: node.metadata,
      parameters: node.parameters.defaults,
      fields: node.parameters.fields,
      inputPorts: node.inputPorts.map((port) => ({
        ...port,
        position: { top: "50%" },
      })),
      outputPorts: node.outputPorts.map((port) => ({
        ...port,
        position: { top: "50%" },
      })),
    },
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
