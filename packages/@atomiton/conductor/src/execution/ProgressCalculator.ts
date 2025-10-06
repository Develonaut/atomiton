/**
 * Progress calculation utilities for execution graph
 */

import type { ExecutionGraphState } from "#execution/types";

/**
 * Calculate weighted progress from execution graph state
 * This is O(n) but only called on state mutations, not reads
 */
export function calculateProgress(state: ExecutionGraphState): number {
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
