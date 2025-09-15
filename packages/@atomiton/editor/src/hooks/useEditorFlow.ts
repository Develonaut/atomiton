import { useCallback } from "react";
import { editorStore } from "../store";
import type { Node, Edge, Viewport } from "@xyflow/react";

/**
 * Hook for managing editor flow state
 * This provides methods to load/save flow state without knowing about blueprints
 */
export function useEditorFlow() {
  const loadFlow = useCallback(
    (nodes: unknown[], edges: unknown[], viewport?: unknown) => {
      const flowInstance = editorStore.getFlowInstance();
      if (flowInstance) {
        flowInstance.setNodes(nodes as Node[]);
        flowInstance.setEdges(edges as Edge[]);
        if (viewport) {
          flowInstance.setViewport(viewport as Viewport);
        }
      }

      editorStore.updateFlowSnapshot(
        nodes as Node[],
        edges as Edge[],
        viewport as Viewport | undefined,
      );

      editorStore.setState((state) => {
        state.isDirty = false;
      });
    },
    [],
  );

  const getFlow = useCallback(() => {
    const flowInstance = editorStore.getFlowInstance();
    if (!flowInstance) {
      return null;
    }

    return {
      nodes: flowInstance.getNodes(),
      edges: flowInstance.getEdges(),
      viewport: flowInstance.getViewport(),
    };
  }, []);

  const clearFlow = useCallback(() => {
    const flowInstance = editorStore.getFlowInstance();
    if (flowInstance) {
      flowInstance.setNodes([]);
      flowInstance.setEdges([]);
    }

    editorStore.updateFlowSnapshot([], []);
    editorStore.setState((state) => {
      state.isDirty = false;
    });
  }, []);

  return {
    loadFlow,
    getFlow,
    clearFlow,
    isDirty: editorStore.getState().isDirty,
  };
}

export type UseEditorFlowReturn = ReturnType<typeof useEditorFlow>;
