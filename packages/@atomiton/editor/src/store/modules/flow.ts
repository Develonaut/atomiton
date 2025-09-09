/**
 * Domain: Flow Management
 *
 * Purpose: Manages ReactFlow instance references and flow state snapshots for persistence
 *
 * Responsibilities:
 * - Maintain ReactFlow instance reference for direct manipulation
 * - Capture and persist flow snapshots (nodes, edges, viewport)
 * - Provide debounced saving to prevent excessive state updates
 * - Handle initial flow state restoration from snapshots
 */

import type { Node, Edge, ReactFlowInstance, Viewport } from "@xyflow/react";
import type { FlowSnapshot, BaseStore } from "../types";

let saveTimeoutRef: NodeJS.Timeout | null = null;

export interface FlowActions {
  setFlowInstance: (instance: ReactFlowInstance | null) => void;
  getFlowInstance: () => ReactFlowInstance | null;
  updateFlowSnapshot: (
    nodes: Node[],
    edges: Edge[],
    viewport?: Viewport,
  ) => void;
  debouncedUpdateFlowSnapshot: () => void;
  getFlowSnapshot: () => FlowSnapshot;
  getInitialFlowState: (
    defaultNodes?: Node[],
    defaultEdges?: Edge[],
  ) => {
    nodes: Node[];
    edges: Edge[];
    viewport?: Viewport;
  };
}

export const createFlowModule = (store: BaseStore): FlowActions => ({
  setFlowInstance: (instance: ReactFlowInstance | null) => {
    store.setState((state) => ({
      ...state,
      flowInstance: instance,
    }));
  },

  getFlowInstance: () => {
    return store.getState().flowInstance;
  },

  updateFlowSnapshot: (nodes: Node[], edges: Edge[], viewport?: Viewport) => {
    store.setState((state) => ({
      ...state,
      flowSnapshot: { nodes, edges, viewport },
      isDirty: true,
    }));
  },

  debouncedUpdateFlowSnapshot: () => {
    if (saveTimeoutRef) {
      clearTimeout(saveTimeoutRef);
    }

    saveTimeoutRef = setTimeout(() => {
      const instance = store.getState().flowInstance;
      if (instance) {
        const nodes = instance.getNodes();
        const edges = instance.getEdges();
        const viewport = instance.getViewport();
        store.setState((state) => ({
          ...state,
          flowSnapshot: { nodes, edges, viewport },
          isDirty: true,
        }));
      }
    }, 1000); // 1 second debounce
  },

  getFlowSnapshot: () => {
    return store.getState().flowSnapshot;
  },

  getInitialFlowState: (
    defaultNodes: Node[] = [],
    defaultEdges: Edge[] = [],
  ) => {
    const snapshot = store.getState().flowSnapshot;
    return {
      nodes: snapshot.nodes.length > 0 ? snapshot.nodes : defaultNodes,
      edges: snapshot.edges.length > 0 ? snapshot.edges : defaultEdges,
      viewport: snapshot.viewport,
    };
  },
});
