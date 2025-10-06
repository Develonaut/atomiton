/**
 * Shared types for Debug page components
 */

/**
 * Flow execution progress tracking
 *
 * Tracks progress during flow execution for UI display.
 * Note: Full execution trace is provided by @atomiton/conductor
 * via ExecutionResult.trace - no need for client-side trace types.
 */
export type ExecutionProgress = {
  currentNode: number;
  totalNodes: number;
  currentNodeName?: string;
  graphProgress: number; // Overall weighted progress (0-100)
};
