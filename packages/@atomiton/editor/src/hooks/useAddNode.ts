import { useEditorEdges } from "#hooks/useEditorEdges";
import { useEditorNodes } from "#hooks/useEditorNodes";
import { useEditorViewport } from "#hooks/useEditorViewport";
import {
  calculateNodePosition,
  createEdgeFromLastNode,
  createEditorNode,
  updateEdgesWithNewEdge,
  updateNodesWithNewNode,
  type NodePosition,
} from "#utils/index.js";
import { useCallback } from "react";

export function useAddNode() {
  const { nodes, setNodes } = useEditorNodes();
  const { setEdges } = useEditorEdges();
  const { fitView } = useEditorViewport();

  const addNode = useCallback(
    (nodeType: string, position?: NodePosition) => {
      const nodePosition = calculateNodePosition(nodes, position);

      const newNode = createEditorNode(nodeType, nodePosition);

      setNodes((prevNodes) => updateNodesWithNewNode(prevNodes, newNode));

      if (nodes.length > 0) {
        const lastNode = nodes[nodes.length - 1];
        const newEdge = createEdgeFromLastNode(lastNode.id, newNode.id);
        setEdges((prevEdges) => updateEdgesWithNewEdge(prevEdges, newEdge));
      }

      fitView({
        nodes: [{ id: newNode.id }],
        duration: 200,
        padding: 0.2,
      });

      return newNode.id;
    },
    [nodes, setNodes, setEdges, fitView],
  );

  return { addNode };
}
