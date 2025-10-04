/**
 * Execution Graph Store
 *
 * Framework-agnostic store for tracking node execution state during flow execution.
 * Uses @atomiton/store (Zustand + Immer) for state management.
 */

import type { ExecutionGraph, GraphNode } from "@atomiton/nodes/graph";
import { createStore } from "@atomiton/store";

// Simple logger interface for environment-agnostic logging
const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(`[EXECUTION_GRAPH] ${message}`, data || "");
  },
  debug: (message: string, data?: Record<string, unknown>) => {
    console.log(`[EXECUTION_GRAPH] ${message}`, data || "");
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    console.warn(`[EXECUTION_GRAPH] ${message}`, data || "");
  },
  error: (message: string, data?: Record<string, unknown>) => {
    console.error(`[EXECUTION_GRAPH] ${message}`, data || "");
  },
};

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
  progress: number; // 0-100
  message?: string;
  startTime?: number;
  endTime?: number;
  error?: string;
  nodes?: ExecutionGraphNode[]; // Recursive - child nodes with their own progress
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
  cachedProgress: number; // Cached weighted progress (0-100) - updated on state changes
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
      cachedProgress: 0,
    }),
    { name: "ExecutionGraph" },
  );

  /**
   * Internal: Calculate weighted progress from current state
   * This is O(n) but only called on state mutations, not reads
   */
  function calculateProgress(state: ExecutionGraphState): number {
    if (state.nodes.size === 0 || state.totalWeight === 0) return 0;

    let completedWeight = 0;

    for (const node of state.nodes.values()) {
      if (node.state === "completed" || node.state === "skipped") {
        completedWeight += node.weight;
      } else if (node.state === "executing") {
        completedWeight += node.weight * (node.progress / 100);
      }
    }

    return Math.round((completedWeight / state.totalWeight) * 100);
  }

  /**
   * Initialize graph from analyzed execution graph
   */
  function initializeGraph(graph: ExecutionGraph) {
    logger.info("Initializing execution graph", {
      nodeCount: graph.nodes.size,
      totalWeight: graph.totalWeight,
      criticalPathLength: graph.criticalPath.length,
      maxParallelism: graph.maxParallelism,
      executionLayers: graph.executionOrder.length,
    });

    store.setState((draft: ExecutionGraphState) => {
      // Convert graph nodes to execution graph nodes
      const executionNodes = new Map<string, ExecutionGraphNode>();
      graph.nodes.forEach((node, id) => {
        executionNodes.set(id, {
          ...node,
          state: "pending",
          progress: 0,
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
      draft.cachedProgress = 0; // All nodes start as pending
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
    const node = store.getState().nodes.get(nodeId);
    if (!node) {
      logger.warn("Attempted to update state for non-existent node", {
        nodeId,
        state,
      });
      return;
    }

    logger.debug(`Node state transition: ${node.state} → ${state}`, {
      nodeId,
      nodeName: node.name,
      previousState: node.state,
      newState: state,
      error,
    });

    store.setState((draft: ExecutionGraphState) => {
      const node = draft.nodes.get(nodeId);
      if (!node) return;

      node.state = state;

      if (state === "executing") {
        node.startTime = Date.now();
        node.progress = 0;
        logger.info("Node execution started", {
          nodeId,
          nodeName: node.name,
          nodeType: node.type,
        });
      } else if (
        state === "completed" ||
        state === "error" ||
        state === "skipped"
      ) {
        node.endTime = Date.now();
        node.progress = 100;
        const duration = node.endTime - (node.startTime || node.endTime);

        if (state === "completed") {
          logger.info("Node execution completed", {
            nodeId,
            nodeName: node.name,
            duration,
          });
        } else if (state === "error") {
          logger.error("Node execution failed", {
            nodeId,
            nodeName: node.name,
            duration,
            error,
          });
        } else {
          logger.debug("Node execution skipped", {
            nodeId,
            nodeName: node.name,
          });
        }
      }

      if (state === "error" && error) {
        node.error = error;
      }

      // Update cached progress
      draft.cachedProgress = calculateProgress(draft);
    });
  }

  /**
   * Update node progress (0-100) and optional message
   */
  function setNodeProgress(nodeId: string, progress: number, message?: string) {
    const node = store.getState().nodes.get(nodeId);
    if (!node) {
      logger.warn("Attempted to update progress for non-existent node", {
        nodeId,
        progress,
      });
      return;
    }

    const clampedProgress = Math.min(100, Math.max(0, progress));

    logger.debug("Node progress updated", {
      nodeId,
      nodeName: node.name,
      previousProgress: node.progress,
      newProgress: clampedProgress,
      message,
    });

    store.setState((draft: ExecutionGraphState) => {
      const node = draft.nodes.get(nodeId);
      if (!node) return;

      node.progress = clampedProgress;
      if (message !== undefined) {
        node.message = message;
      }

      // Update cached progress
      draft.cachedProgress = calculateProgress(draft);
    });
  }

  /**
   * Mark execution as complete
   */
  function completeExecution() {
    const state = store.getState();
    const duration = state.startTime ? Date.now() - state.startTime : 0;
    const completedNodes = Array.from(state.nodes.values()).filter(
      (n) => n.state === "completed",
    ).length;
    const errorNodes = Array.from(state.nodes.values()).filter(
      (n) => n.state === "error",
    ).length;

    logger.info("Execution graph completed", {
      totalNodes: state.nodes.size,
      completedNodes,
      errorNodes,
      duration,
      totalWeight: state.totalWeight,
    });

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
      cachedProgress: 0,
    }));
  }

  return {
    ...store,
    initializeGraph,
    setNodeState,
    setNodeProgress,
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

/**
 * Get overall execution progress (weighted by node progress)
 *
 * PERFORMANCE: This is O(1) - reads from cached value.
 * The cache is updated on state mutations (O(n) but infrequent).
 *
 * Use with Zustand selector for optimal React performance:
 * @example
 * const progress = store.useStore((state) => state.cachedProgress);
 */
export function getExecutionProgress(
  store: ReturnType<typeof createExecutionGraphStore>,
): number {
  return store.getState().cachedProgress;
}

/**
 * Calculate simple completion-based progress (old behavior)
 * Only counts fully completed nodes, ignoring individual progress
 */
export function getCompletionProgress(
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
