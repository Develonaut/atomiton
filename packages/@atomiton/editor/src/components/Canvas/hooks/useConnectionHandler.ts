import { useCallback } from "react";
import type { Connection, Edge } from "@xyflow/react";
import { addEdge } from "@xyflow/react";
import { editorStore } from "../../../store";

export function useConnectionHandler(
  edges: Edge[],
  setEdges: (edges: Edge[]) => void,
  onConnect?: (params: Connection) => void,
) {
  const handleConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      editorStore.setConnections(newEdges);
      onConnect?.(params);
    },
    [edges, setEdges, onConnect],
  );

  return handleConnect;
}
