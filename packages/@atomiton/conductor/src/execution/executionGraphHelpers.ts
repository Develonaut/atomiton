/**
 * Execution Graph Query Helpers
 *
 * Helper functions for querying execution graph state.
 * Extracted from executionGraphStore.ts to maintain file size limits.
 */

import type {
  ExecutionGraphNode,
  ExecutionGraphStore,
  NodeExecutionState,
} from "#execution/executionGraphStore";

/**
 * Get a specific node's state from the store
 */
export function getNodeState(
  store: ExecutionGraphStore,
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
export function getExecutionProgress(store: ExecutionGraphStore): number {
  return store.getState().cachedProgress;
}

/**
 * Calculate simple completion-based progress (old behavior)
 * Only counts fully completed nodes, ignoring individual progress
 */
export function getCompletionProgress(store: ExecutionGraphStore): number {
  const state = store.getState();
  if (state.nodes.size === 0) return 0;

  const nodes = Array.from(state.nodes.values()) as ExecutionGraphNode[];
  const completed = nodes.filter(
    (n) => n.state === "completed" || n.state === "skipped",
  ).length;

  return Math.round((completed / state.nodes.size) * 100);
}

/**
 * Get all nodes in a specific execution state
 */
export function getNodesByState(
  store: ExecutionGraphStore,
  nodeState: NodeExecutionState,
): ExecutionGraphNode[] {
  const state = store.getState();
  const nodes = Array.from(state.nodes.values()) as ExecutionGraphNode[];
  return nodes.filter((n) => n.state === nodeState);
}

/**
 * Calculate total weight of completed nodes
 */
export function getCompletedWeight(store: ExecutionGraphStore): number {
  const state = store.getState();
  const nodes = Array.from(state.nodes.values()) as ExecutionGraphNode[];
  const completed = nodes.filter(
    (n) => n.state === "completed" || n.state === "skipped",
  );

  return completed.reduce((sum, node) => sum + node.weight, 0);
}

/**
 * Estimate time remaining based on completed weight and elapsed time
 */
export function getEstimatedTimeRemaining(
  store: ExecutionGraphStore,
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
