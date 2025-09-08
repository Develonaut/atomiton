import {
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
} from "@xyflow/react";
import { useCallback, useEffect } from "react";
import { editorStore } from "../../../store";
import type { EditorState } from "../../../store/types";

export interface UseReactFlowOptions {
  nodes?: Node[];
  edges?: Edge[];
  onNodesChange?: OnNodesChange;
  onEdgesChange?: OnEdgesChange;
  onConnect?: OnConnect;
  onDrop?: (event: React.DragEvent) => void;
  onDragOver?: (event: React.DragEvent) => void;
}

export interface ReactFlowAdapter {
  // State
  nodes: Node[];
  edges: Edge[];
  setNodes: ReturnType<typeof useNodesState>[1];
  setEdges: ReturnType<typeof useEdgesState>[1];

  // Handlers formatted for ReactFlow
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
}

/**
 * Adapter hook that bridges Atomiton concepts with ReactFlow API
 * This is the single point of integration between our domain and ReactFlow
 *
 * Responsibilities:
 * - Manages ReactFlow state (nodes/edges)
 * - Syncs with our store automatically
 * - Adapts our handlers to ReactFlow's expected format
 * - Handles history/undo-redo integration
 * - Manages drag and drop for adding nodes to the canvas
 */
export function useReactFlow({
  nodes: initialNodes = [],
  edges: initialEdges = [],
  onNodesChange: externalOnNodesChange,
  onEdgesChange: externalOnEdgesChange,
  onConnect: externalOnConnect,
  onDrop: externalOnDrop,
  onDragOver: externalOnDragOver,
}: UseReactFlowOptions): ReactFlowAdapter {
  const store = editorStore;

  // ReactFlow state management
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync with store - initialize store with props
  useEffect(() => {
    if (initialNodes && initialNodes.length > 0) {
      store.setElements(initialNodes);
    }
    if (initialEdges && initialEdges.length > 0) {
      store.setConnections(initialEdges);
    }
  }, [initialNodes, initialEdges, store]);

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = store.subscribe((state: EditorState) => {
      setNodes(state.elements);
      setEdges(state.connections);
    });

    return unsubscribe || undefined;
  }, [setNodes, setEdges, store]);

  // Wrap node changes to integrate with our history system
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Apply changes through ReactFlow's handler
      onNodesChange(changes);

      // Track in our history system
      if (store?.pushToHistory) {
        store.pushToHistory({
          type: "nodes-change",
          changes,
          timestamp: Date.now(),
        });
      }

      // Call external handler if provided
      externalOnNodesChange?.(changes);
    },
    [onNodesChange, store, externalOnNodesChange],
  );

  // Wrap edge changes to integrate with our history system
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      // Apply changes through ReactFlow's handler
      onEdgesChange(changes);

      // Track in our history system
      if (store?.pushToHistory) {
        store.pushToHistory({
          type: "edges-change",
          changes,
          timestamp: Date.now(),
        });
      }

      // Call external handler if provided
      externalOnEdgesChange?.(changes);
    },
    [onEdgesChange, store, externalOnEdgesChange],
  );

  // Wrap connection handler to integrate with our system
  const handleConnect = useCallback(
    (connection: Connection) => {
      // Create new edge from connection
      const newEdge: Edge = {
        id: `${connection.source}-${connection.target}`,
        source: connection.source!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined,
      };

      // Add edge through state setter
      setEdges((eds) => [...eds, newEdge]);

      // Track in our history system
      if (store?.pushToHistory) {
        store.pushToHistory({
          type: "edge-connect",
          edge: newEdge,
          timestamp: Date.now(),
        });
      }

      // Call external handler if provided
      externalOnConnect?.(connection);
    },
    [setEdges, store, externalOnConnect],
  );

  // Handle drop events for adding nodes to canvas
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      externalOnDrop?.(event);
    },
    [externalOnDrop],
  );

  // Handle drag over events to allow dropping
  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      // Safely set dropEffect, handling cases where it might be read-only
      try {
        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = "move";
        }
      } catch (error) {
        // Some browsers or scenarios may have read-only dataTransfer properties
        // We can safely ignore this error as the drag operation can still proceed
      }

      externalOnDragOver?.(event);
    },
    [externalOnDragOver],
  );

  return {
    // State
    nodes,
    edges,
    setNodes,
    setEdges,

    // Handlers in ReactFlow format
    onNodesChange: handleNodesChange,
    onEdgesChange: handleEdgesChange,
    onConnect: handleConnect,
    onDrop: handleDrop,
    onDragOver: handleDragOver,
  };
}
