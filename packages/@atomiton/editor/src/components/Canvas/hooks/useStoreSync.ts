import { useEffect } from "react";
import type { Node, Edge } from "@xyflow/react";
import { editorStore } from "../../../store";
import type { EditorState } from "../../../store/types";

export function useStoreSync(
  initialNodes: Node[],
  initialEdges: Edge[],
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void,
) {
  useEffect(() => {
    if (initialNodes && initialNodes.length > 0) {
      editorStore.setElements(initialNodes);
    }
    if (initialEdges && initialEdges.length > 0) {
      editorStore.setConnections(initialEdges);
    }
  }, [initialNodes, initialEdges]);

  useEffect(() => {
    const unsubscribe = editorStore.subscribe((state: EditorState) => {
      setNodes(state.elements);
      setEdges(state.connections);
    });

    return unsubscribe || undefined;
  }, [setNodes, setEdges]);
}
