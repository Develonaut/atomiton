import { useCallback } from "react";
import type { EdgeChange, Edge } from "@xyflow/react";
import { applyEdgeChanges } from "@xyflow/react";
import { editorStore } from "../../../store";

export function useEdgeChanges(
  edges: Edge[],
  setEdges: (edges: Edge[]) => void,
  onEdgesChange?: (changes: EdgeChange[]) => void,
) {
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const newEdges = applyEdgeChanges(changes, edges);
      setEdges(newEdges);
      editorStore.setConnections(newEdges);
      onEdgesChange?.(changes);
    },
    [edges, setEdges, onEdgesChange],
  );

  return handleEdgesChange;
}
