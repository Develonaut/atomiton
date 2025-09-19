import { useCallback } from "react";
import {
  calculateNodePosition,
  createEdgeFromLastNode,
  createNode,
  updateEdgesWithNewEdge,
  updateNodesWithNewNode,
  type NodePosition,
} from "../utils/nodeCreation";
import { useEditorEdges } from "./useEditorEdges";
import { useEditorNodes } from "./useEditorNodes";
import { useEditorViewport } from "./useEditorViewport";

export function useAddNode() {
  const { nodes, setNodes } = useEditorNodes();
  const { setEdges } = useEditorEdges();
  const { fitView } = useEditorViewport();

  const addNode = useCallback(
    (nodeType: string, position?: NodePosition) => {
      // Calculate position using util function
      const nodePosition = calculateNodePosition(nodes, position);

      // Create new node using util function
      const newNode = createNode(nodeType, nodePosition);

      // Update nodes state
      setNodes((prevNodes) => updateNodesWithNewNode(prevNodes, newNode));

      // Create edge if there are existing nodes
      if (nodes.length > 0) {
        const lastNode = nodes[nodes.length - 1];
        const newEdge = createEdgeFromLastNode(lastNode.id, newNode.id);
        setEdges((prevEdges) => updateEdgesWithNewEdge(prevEdges, newEdge));
      }

      // Focus on new node
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
