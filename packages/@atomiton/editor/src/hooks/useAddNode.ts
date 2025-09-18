import { generateEdgeId, generateNodeId } from "@atomiton/utils";
import { useCallback } from "react";
import type { EditorEdge, EditorNode } from "../index";
import { useEditorEdges } from "./useEditorEdges";
import { useEditorNodes } from "./useEditorNodes";
import { useEditorViewport } from "./useEditorViewport";

export function useAddNode() {
  const { nodes, setNodes } = useEditorNodes();
  const { setEdges } = useEditorEdges();
  const { fitView } = useEditorViewport();

  const addNode = useCallback(
    (nodeType: string, position?: { x: number; y: number }) => {
      const nodeId = generateNodeId();

      let nodePosition = position || { x: 100, y: 100 };

      if (!position && nodes.length > 0) {
        let maxX = -Infinity;
        let rightmostY = 100;

        for (const node of nodes) {
          if (node.position.x > maxX) {
            maxX = node.position.x;
            rightmostY = node.position.y;
          }
        }

        nodePosition = {
          x: maxX + 200,
          y: rightmostY,
        };
      }

      const newNode: EditorNode = {
        id: nodeId,
        type: nodeType,
        position: nodePosition,
        data: {},
        selected: true,
      };

      setNodes((prevNodes) => [
        ...prevNodes.map((node) => ({ ...node, selected: false })),
        newNode,
      ]);

      if (nodes.length > 0) {
        const lastNode = nodes[nodes.length - 1];
        const newEdge: EditorEdge = {
          id: generateEdgeId(lastNode.id),
          source: lastNode.id,
          target: nodeId,
          type: "default",
        };

        setEdges((prevEdges) => [...prevEdges, newEdge]);
      }

      fitView({
        nodes: [{ id: nodeId }],
        duration: 200,
        padding: 0.2,
      });

      return nodeId;
    },
    [nodes, setNodes, setEdges, fitView],
  );

  return { addNode };
}
