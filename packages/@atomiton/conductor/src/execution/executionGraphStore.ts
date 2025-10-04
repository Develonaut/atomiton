/**
 * Execution Graph Store
 *
 * Framework-agnostic store for tracking node execution state during flow execution.
 * Uses @atomiton/store (Zustand + Immer) for state management.
 */

import { createStore } from "@atomiton/store";
import type { ExecutionGraph, GraphNode } from "@atomiton/nodes/graph";

/**
 * Store type
 */
export type ExecutionGraphStore = ReturnType<typeof createExecutionGraphStore>;

/**
 * Node execution states
 */
export type NodeExecutionState =
  | "pending"
  | "executing"
  | "completed"
  | "error"
  | "skipped";

/**
 * Node with execution state
 */
export type ExecutionGraphNode = GraphNode & {
  state: NodeExecutionState;
  startTime?: number;
  endTime?: number;
  error?: string;
};

/**
 * Execution graph state
 */
export type ExecutionGraphState = {
  nodes: Map<string, ExecutionGraphNode>;
  edges: Array<{ from: string; to: string }>;
  executionOrder: string[][];
  criticalPath: string[];
  totalWeight: number;
  maxParallelism: number;
  isExecuting: boolean;
  startTime: number | null;
  endTime: number | null;
};

/**
 * Create execution graph store
 */
export function createExecutionGraphStore() {
  const store = createStore<ExecutionGraphState>(
    () => ({
      nodes: new Map(),
      edges: [],
      executionOrder: [],
      criticalPath: [],
      totalWeight: 0,
      maxParallelism: 1,
      isExecuting: false,
      startTime: null,
      endTime: null,
    }),
    { name: "ExecutionGraph" },
  );

  /**
   * Initialize graph from analyzed execution graph
   */
  function initializeGraph(graph: ExecutionGraph) {
    console.log(`[GRAPH] Initializing graph with ${graph.nodes.size} nodes`, {
      totalWeight: graph.totalWeight,
      criticalPath: graph.criticalPath,
      maxParallelism: graph.maxParallelism,
    });

    store.setState((draft: ExecutionGraphState) => {
      // Convert graph nodes to execution graph nodes
      const executionNodes = new Map<string, ExecutionGraphNode>();
      graph.nodes.forEach((node, id) => {
        executionNodes.set(id, {
          ...node,
          state: "pending",
        });
      });

      // Convert edges to simple format
      const edges: Array<{ from: string; to: string }> = [];
      graph.nodes.forEach((node) => {
        node.dependencies.forEach((depId) => {
          edges.push({ from: depId, to: node.id });
        });
      });

      draft.nodes = executionNodes;
      draft.edges = edges;
      draft.executionOrder = graph.executionOrder;
      draft.criticalPath = graph.criticalPath;
      draft.totalWeight = graph.totalWeight;
      draft.maxParallelism = graph.maxParallelism;
      draft.isExecuting = true;
      draft.startTime = Date.now();
      draft.endTime = null;
    });
  }

  /**
   * Update node execution state
   */
  function setNodeState(
    nodeId: string,
    state: NodeExecutionState,
    error?: string,
  ) {
    store.setState((draft: ExecutionGraphState) => {
      const node = draft.nodes.get(nodeId);
      if (!node) return;

      node.state = state;

      if (state === "executing") {
        node.startTime = Date.now();
      } else if (
        state === "completed" ||
        state === "error" ||
        state === "skipped"
      ) {
        node.endTime = Date.now();
      }

      if (state === "error" && error) {
        node.error = error;
      }
    });
  }

  /**
   * Mark execution as complete
   */
  function completeExecution() {
    store.setState((draft: ExecutionGraphState) => {
      draft.isExecuting = false;
      draft.endTime = Date.now();
    });
  }

  /**
   * Reset the store to initial state
   */
  function reset() {
    store.setState(() => ({
      nodes: new Map(),
      edges: [],
      executionOrder: [],
      criticalPath: [],
      totalWeight: 0,
      maxParallelism: 1,
      isExecuting: false,
      startTime: null,
      endTime: null,
    }));
  }

  return {
    ...store,
    initializeGraph,
    setNodeState,
    completeExecution,
    reset,
  };
}

/**
 * Helper functions for querying execution graph state
 */

export function getNodeState(
  store: ReturnType<typeof createExecutionGraphStore>,
  nodeId: string,
): ExecutionGraphNode | undefined {
  return store.getState().nodes.get(nodeId);
}

export function getExecutionProgress(
  store: ReturnType<typeof createExecutionGraphStore>,
): number {
  const state = store.getState();
  if (state.nodes.size === 0) return 0;

  const completed = Array.from(state.nodes.values()).filter(
    (n): n is ExecutionGraphNode =>
      n.state === "completed" || n.state === "skipped",
  ).length;

  return Math.round((completed / state.nodes.size) * 100);
}

export function getNodesByState(
  store: ReturnType<typeof createExecutionGraphStore>,
  nodeState: NodeExecutionState,
): ExecutionGraphNode[] {
  const state = store.getState();
  return Array.from(state.nodes.values()).filter(
    (n): n is ExecutionGraphNode => n.state === nodeState,
  );
}

export function getCompletedWeight(
  store: ReturnType<typeof createExecutionGraphStore>,
): number {
  const state = store.getState();
  const completed = Array.from(state.nodes.values()).filter(
    (n): n is ExecutionGraphNode =>
      n.state === "completed" || n.state === "skipped",
  );

  return completed.reduce((sum, node) => sum + node.weight, 0);
}

export function getEstimatedTimeRemaining(
  store: ReturnType<typeof createExecutionGraphStore>,
): number | null {
  const state = store.getState();
  if (!state.startTime || !state.isExecuting) return null;

  const elapsed = Date.now() - state.startTime;
  const completedWeight = getCompletedWeight(store);

  if (completedWeight === 0) return null;

  const remainingWeight = state.totalWeight - completedWeight;
  const avgTimePerWeight = elapsed / completedWeight;

  return Math.round(remainingWeight * avgTimePerWeight);
}
