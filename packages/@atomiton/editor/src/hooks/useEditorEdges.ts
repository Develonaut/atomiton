import type { Edge } from "@xyflow/react";
import { useReactFlow, useEdges as useReactFlowEdges } from "@xyflow/react";
import { useCallback, useMemo } from "react";

export type EditorEdge = Edge;

export function useEditorEdges() {
  const edges = useReactFlowEdges();
  const { setEdges, getEdges } = useReactFlow();

  const typedEdges = useMemo(() => edges, [edges]);

  const setTypedEdges = useCallback(
    (updater: EditorEdge[] | ((edges: EditorEdge[]) => EditorEdge[])) => {
      setEdges(updater);
    },
    [setEdges],
  );

  const getTypedEdges = useCallback(() => getEdges(), [getEdges]);

  return {
    edges: typedEdges,
    setEdges: setTypedEdges,
    getEdges: getTypedEdges,
  };
}
