/**
 * Execution Graph Store
 *
 * Framework-agnostic store for tracking node execution state during flow execution.
 * Uses @atomiton/store (Zustand + Immer) for state management.
 */

import { createLogger } from "@atomiton/logger/browser";
import type { ExecutionGraph, GraphNode } from "@atomiton/nodes/graph";
import { createStore } from "@atomiton/store";
import type { ExecutionTrace, NodeExecutionTrace } from "#types";
import { generateExecutionId } from "@atomiton/utils";

const logger = createLogger({ scope: "EXECUTION_GRAPH" });

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

  // Trace collection
  const trace: ExecutionTrace = {
    executionId: "",
    rootNodeId: "",
    startTime: 0,
    events: [],
    nodes: [],
    config: {},
  };

  const nodeTraces = new Map<string, NodeExecutionTrace>();

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
        // Include executing nodes' partial progress
        completedWeight += node.weight * (node.progress / 100);
      }
      // Error nodes contribute 0 to overall progress (execution failed)
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

    // Initialize trace
    trace.executionId = generateExecutionId();
    trace.rootNodeId = Array.from(graph.nodes.values())[0]?.id || "unknown";
    trace.startTime = Date.now();
    trace.config = {};

    // Record start event
    trace.events.push({
      timestamp: Date.now(),
      type: "started",
      data: {
        totalNodes: graph.nodes.size,
        totalWeight: graph.totalWeight,
        criticalPath: graph.criticalPath,
      },
    });

    // Initialize node traces
    graph.nodes.forEach((node) => {
      nodeTraces.set(node.id, {
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        startTime: 0,
        state: "pending",
        progress: 0,
        events: [],
      });
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

    // Record in trace
    const nodeTrace = nodeTraces.get(nodeId);
    if (nodeTrace) {
      const timestamp = Date.now();

      if (state === "executing" && nodeTrace.startTime === 0) {
        nodeTrace.startTime = timestamp;
      }

      if (state === "completed" || state === "error") {
        nodeTrace.endTime = timestamp;
        nodeTrace.duration = timestamp - nodeTrace.startTime;
      }

      nodeTrace.state = state;
      nodeTrace.events.push({
        timestamp,
        type: "state-change",
        data: { state, errorMessage: error },
      });

      trace.events.push({
        timestamp,
        type: "state-change",
        data: { nodeId, state, errorMessage: error },
      });
    }

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
    const nodeTrace = nodeTraces.get(nodeId);
    if (nodeTrace) {
      nodeTrace.progress = clampedProgress;
      nodeTrace.events.push({
        timestamp: Date.now(),
        type: "progress",
        data: { progress: clampedProgress, message },
      });
    }

    trace.events.push({
      timestamp: Date.now(),
      type: "progress",
      data: {
        nodeId,
        progress: state.cachedProgress,
        message: message || "",
        allNodes: Array.from(state.nodes.values()).map((n) => ({
          id: n.id,
          name: n.name,
          state: n.state,
          progress: n.progress,
        })),
      },
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
    trace.endTime = Date.now();
    trace.duration = trace.endTime - trace.startTime;
    trace.nodes = Array.from(nodeTraces.values());

    trace.events.push({
      timestamp: Date.now(),
      type: "completed",
      data: {
        totalDuration: trace.duration,
        nodesCompleted: trace.nodes.filter((n) => n.state === "completed")
          .length,
        nodesErrored: trace.nodes.filter((n) => n.state === "error").length,
      },
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

  /**
   * Get execution trace
   */
  function getTrace(): ExecutionTrace {
    // Return a copy to prevent external modifications
    return {
      ...trace,
      events: [...trace.events],
      nodes: [...trace.nodes],
    };
  }

  return {
    ...store,
    initializeGraph,
    setNodeState,
    setNodeProgress,
    completeExecution,
    reset,
    getTrace,
  };
}

// Re-export query helpers from separate module
export {
  getNodeState,
  getExecutionProgress,
  getCompletionProgress,
  getNodesByState,
  getCompletedWeight,
  getEstimatedTimeRemaining,
} from "#execution/executionGraphHelpers";
