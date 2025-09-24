import type { Edge } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { useEditorStore } from "#useEditorStore";

export type EditorEdge = Edge;

export function useEditorEdges() {
  const { setEdges, getEdges } = useReactFlow();
  const edges = useEditorStore((state) => state.edges);

  const setTypedEdges = useCallback(
    (updater: EditorEdge[] | ((edges: EditorEdge[]) => EditorEdge[])) => {
      setEdges(updater);
    },
    [setEdges],
  );

  const getTypedEdges = useCallback(
    () => getEdges() as EditorEdge[],
    [getEdges],
  );

  return { edges, setEdges: setTypedEdges, getEdges: getTypedEdges };
}
