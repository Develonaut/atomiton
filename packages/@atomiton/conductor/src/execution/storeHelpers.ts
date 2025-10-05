/**
 * Execution graph store helper utilities
 */

import type { ExecutionGraphStore } from "#execution/executionGraphStore";

/**
 * Mark execution as complete in the store (null-safe)
 */
export function completeExecution(
  store: ExecutionGraphStore | undefined,
): void {
  store?.completeExecution();
}
