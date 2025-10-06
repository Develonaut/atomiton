/**
 * Execution Graph Store
 *
 * Framework-agnostic store for tracking node execution state during flow execution.
 * Uses @atomiton/store (Zustand + Immer) for state management.
 */

import { createLogger } from "@atomiton/logger/browser";
import type { ExecutionGraph } from "@atomiton/nodes/graph";
import { createStore } from "@atomiton/store";
import { ExecutionTraceManager } from "#execution/ExecutionTrace";
import { calculateProgress } from "#execution/ProgressCalculator";
import type {
  ExecutionGraphState,
  ExecutionGraphNode,
  NodeExecutionState,
} from "#execution/types";

const logger = createLogger({ scope: "EXECUTION_GRAPH" });

/**
 * Store type
 */
export type ExecutionGraphStore = ReturnType<typeof createExecutionGraphStore>;

// Re-export types for backward compatibility
export type {
  ExecutionGraphState,
  ExecutionGraphNode,
  NodeExecutionState,
} from "#execution/types";

// Re-export helper functions for backward compatibility
export {
  getNodeState,
  getExecutionProgress,
  getCompletionProgress,
  getNodesByState,
  getCompletedWeight,
  getEstimatedTimeRemaining,
} from "#execution/executionGraphHelpers";

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

  // Trace manager
  const traceManager = new ExecutionTraceManager();

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

    // Initialize trace
    traceManager.initializeTrace(graph);

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

    // Record in trace
    traceManager.recordNodeStateChange(nodeId, state, error);

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
        // Only set progress to 100 for completed and skipped states
        // For error state, freeze progress at current value
        if (state === "completed" || state === "skipped") {
          node.progress = 100;
        }
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
    const state = store.getState();
    const node = state.nodes.get(nodeId);
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

    // Record in trace
    const allNodes = (
      Array.from(state.nodes.values()) as ExecutionGraphNode[]
    ).map((n) => ({
      id: n.id,
      name: n.name,
      state: n.state,
      progress: n.progress,
    }));
    traceManager.recordNodeProgress(
      nodeId,
      clampedProgress,
      message,
      state.cachedProgress,
      allNodes,
    );

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
    const nodes = Array.from(state.nodes.values()) as ExecutionGraphNode[];
    const completedNodes = nodes.filter((n) => n.state === "completed").length;
    const errorNodes = nodes.filter((n) => n.state === "error").length;

    logger.info("Execution graph completed", {
      totalNodes: state.nodes.size,
      completedNodes,
      errorNodes,
      duration,
      totalWeight: state.totalWeight,
    });

    // Finalize trace
    traceManager.completeTrace();

    store.setState((draft: ExecutionGraphState) => {
      draft.isExecuting = false;
      draft.endTime = Date.now();
    });
  }

  /**
   * Reset the store to initial state
   */
  function reset() {
    traceManager.reset();
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
    getTrace: () => traceManager.getTrace(),
  };
}
