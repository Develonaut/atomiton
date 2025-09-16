import {
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  type ReactFlowInstance,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import { useCallback } from "react";
import { editorStore } from "../../../store";

export type UseReactFlowOptions = {
  defaultNodes?: Node[];
  defaultEdges?: Edge[];
  onNodesChange?: OnNodesChange;
  onEdgesChange?: OnEdgesChange;
  onConnect?: OnConnect;
};

/**
 * Thin wrapper hook that connects ReactFlow to our store
 * All business logic lives in the store, this just exposes it to React
 */
export function useReactFlow({
  defaultNodes = [],
  defaultEdges = [],
  onNodesChange: externalOnNodesChange,
  onEdgesChange: externalOnEdgesChange,
  onConnect: externalOnConnect,
}: UseReactFlowOptions = {}) {
  // Get initial state from store
  const initialState = editorStore.getInitialFlowState(
    defaultNodes,
    defaultEdges,
  );

  // ReactFlow manages its own state internally
  const [nodes, setNodes, onNodesChange] = useNodesState(initialState.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialState.edges);

  // Wrap handlers to sync with store
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (!Array.isArray(changes)) {
        console.warn("Invalid node changes provided");
        return;
      }

      onNodesChange(changes);
      externalOnNodesChange?.(changes);
      editorStore.debouncedUpdateFlowSnapshot?.();
    },
    [onNodesChange, externalOnNodesChange],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (!Array.isArray(changes)) {
        console.warn("Invalid edge changes provided");
        return;
      }

      onEdgesChange(changes);
      externalOnEdgesChange?.(changes);
      editorStore.debouncedUpdateFlowSnapshot?.();
    },
    [onEdgesChange, externalOnEdgesChange],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection || !connection.source || !connection.target) {
        console.warn("Invalid connection parameters");
        return;
      }

      editorStore.handleConnect(connection);
      externalOnConnect?.(connection);
    },
    [externalOnConnect],
  );

  const handleInit = useCallback(
    (instance: ReactFlowInstance) => {
      if (!instance) {
        console.error("Invalid ReactFlow instance");
        return;
      }

      editorStore.setFlowInstance(instance);

      // Restore viewport if available
      if (initialState.viewport && typeof instance.setViewport === "function") {
        instance.setViewport(initialState.viewport);
      }
    },
    [initialState.viewport],
  );

  return {
    // ReactFlow state
    nodes,
    edges,
    setNodes,
    setEdges,

    // ReactFlow handlers
    onNodesChange: handleNodesChange,
    onEdgesChange: handleEdgesChange,
    onConnect: handleConnect,
    onInit: handleInit,

    // Store actions (exposed for convenience)
    addNode: editorStore.addNode,
    deleteSelectedNodes: editorStore.deleteSelectedNodes,
    handleDrop: editorStore.handleDrop,
  };
}

export type UseReactFlowReturn = ReturnType<typeof useReactFlow>;
