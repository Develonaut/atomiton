import { useEventCallback } from "@atomiton/hooks";
import type { Edge } from "@xyflow/react";
import { editorStore } from "../store";

export function useEdges() {
  const handleAddEdge = useEventCallback((edge: Edge) => {
    editorStore.addEdge(edge);
  });

  const handleDeleteEdge = useEventCallback((id: string) => {
    editorStore.deleteEdge(id);
  });

  const handleSetEdges = useEventCallback((edges: Edge[]) => {
    editorStore.setEdges(edges);
  });

  const getEdges = useEventCallback(() => {
    return editorStore.getEdges();
  });

  return {
    addEdge: handleAddEdge,
    deleteEdge: handleDeleteEdge,
    setEdges: handleSetEdges,
    getEdges,
  };
}
