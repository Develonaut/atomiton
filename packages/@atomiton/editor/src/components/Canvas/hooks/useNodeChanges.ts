import { useCallback, useRef } from "react";
import type { NodeChange, Node } from "@xyflow/react";
import { applyNodeChanges } from "@xyflow/react";
import { editorStore } from "../../../store";

export function useNodeChanges(
  nodes: Node[],
  setNodes: (nodes: Node[]) => void,
  onNodesChange?: (changes: NodeChange[]) => void,
) {
  const isDraggingRef = useRef(false);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      let shouldTrackHistory = false;

      changes.forEach((change) => {
        if (change.type === "position") {
          if ("dragging" in change && change.dragging === true) {
            isDraggingRef.current = true;
          } else if (
            "dragging" in change &&
            change.dragging === false &&
            isDraggingRef.current
          ) {
            shouldTrackHistory = true;
            isDraggingRef.current = false;
          }
        } else if (change.type === "remove" || change.type === "add") {
          shouldTrackHistory = true;
        }
      });

      const newNodes = applyNodeChanges(changes, nodes);
      setNodes(newNodes);

      if (shouldTrackHistory) {
        editorStore.setElements(newNodes);
      }

      onNodesChange?.(changes);
    },
    [nodes, setNodes, onNodesChange],
  );

  return handleNodesChange;
}
