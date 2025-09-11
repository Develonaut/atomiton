/**
 * Domain: Node Side Effects
 *
 * Purpose: ReactFlow instance operations and side effects
 *
 * Responsibilities:
 * - ReactFlow instance updates
 * - Focus and viewport management
 * - Async operations
 */

import type { ReactFlowInstance, Edge, Node } from "@xyflow/react";
import type { EditorState } from "../types";

export const updateFlowInstance = (
  instance: ReactFlowInstance,
  nodes: Node[],
  edges: Edge[],
): void => {
  instance.setNodes(nodes);
  instance.setEdges(edges);
};

export const focusOnNode = (
  instance: ReactFlowInstance,
  nodeId: string,
  options: {
    duration?: number;
    padding?: number;
    delay?: number;
  } = {},
): void => {
  const defaultOptions = {
    duration: 200,
    padding: 0.2,
    delay: 50,
  };

  const mergedOptions = { ...defaultOptions, ...options };

  setTimeout(() => {
    instance.fitView({
      nodes: [{ id: nodeId }],
      duration: mergedOptions.duration,
      padding: mergedOptions.padding,
    });
  }, mergedOptions.delay);
};

export const updateStoreState = (
  setState: (updater: (state: EditorState) => void) => void,
  nodes: Node[],
  edges: Edge[],
  selectedNodeId: string,
): void => {
  setState((state: EditorState) => {
    state.selectedNodeId = selectedNodeId;
    state.flowSnapshot.nodes = nodes;
    state.flowSnapshot.edges = edges;
  });
};
