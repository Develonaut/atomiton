/**
 * Debug utilities for testing and development
 * These should only be used in development/test environments
 *
 * Production builds:
 * - All debug code is tree-shaken out via process.env.NODE_ENV checks
 * - Zero runtime overhead in production
 * - Bundlers (Vite, Rollup, Webpack) recognize and eliminate dead code paths
 */

import type { ConductorExecutionContext } from "#types";

/**
 * Error type to message mapping
 */
const ERROR_TYPE_MESSAGES: Record<string, string> = {
  generic: "Simulated generic error",
  timeout: "Request timeout - operation took too long",
  network: "Network error - failed to connect to server",
  validation: "Validation error - invalid input data",
  permission: "Permission denied - insufficient access rights",
};

/**
 * Track resolved random node selections per execution
 */
const randomNodeSelections = new WeakMap<
  ConductorExecutionContext,
  Map<string, string>
>();

/**
 * Resolve 'random' node ID to an actual node ID
 * Caches the selection per execution context
 */
function resolveNodeId(
  nodeId: string | "random",
  availableNodes: string[],
  context: ConductorExecutionContext,
  key: string,
): string {
  if (nodeId !== "random") {
    return nodeId;
  }

  // Get or create the selection map for this context
  let selections = randomNodeSelections.get(context);
  if (!selections) {
    selections = new Map();
    randomNodeSelections.set(context, selections);
  }

  // Check if we already selected a node for this debug option
  const existing = selections.get(key);
  if (existing) {
    return existing;
  }

  // Select a random node
  if (availableNodes.length === 0) {
    throw new Error(`[DEBUG] No nodes available to select random node for ${key}`);
  }

  const randomIndex = Math.floor(Math.random() * availableNodes.length);
  const selected = availableNodes[randomIndex];
  selections.set(key, selected);

  console.log(
    `[DEBUG] Selected random node '${selected}' for ${key} (out of ${availableNodes.length} nodes)`,
  );

  return selected;
}

/**
 * Initialize debug options - resolve random node selections
 * In production, this is a no-op for tree-shaking.
 */
export function initializeDebugOptions(
  nodeIds: string[],
  context: ConductorExecutionContext,
): void {
  // Early return in production - enables tree-shaking
  if (process.env.NODE_ENV === 'production') return;

  if (!context.debug) return;

  // Resolve random error target
  if (context.debug.simulateError) {
    const targetNode = resolveNodeId(
      context.debug.simulateError.nodeId,
      nodeIds,
      context,
      "simulateError",
    );
    console.log(
      `[DEBUG] Will simulate ${context.debug.simulateError.errorType} error on node '${targetNode}'`,
    );
  }

  // Resolve random long-running target
  if (context.debug.simulateLongRunning) {
    const targetNode = resolveNodeId(
      context.debug.simulateLongRunning.nodeId,
      nodeIds,
      context,
      "simulateLongRunning",
    );
    console.log(
      `[DEBUG] Will simulate ${context.debug.simulateLongRunning.delayMs}ms delay on node '${targetNode}'`,
    );
  }
}

/**
 * Type for an executor function
 */
type ExecutorFn<T = unknown> = (params: unknown) => Promise<T>;

/**
 * Factory function that wraps an executor with debug behaviors
 * Uses currying pattern to cleanly separate debug concerns from execution
 *
 * In production builds, this immediately returns the unwrapped executor,
 * allowing bundlers to tree-shake all debug logic.
 */
export function wrapExecutorWithDebug<T = unknown>(
  executor: ExecutorFn<T>,
  nodeId: string,
  context: ConductorExecutionContext,
): ExecutorFn<T> {
  // Early return in production - enables tree-shaking of debug code
  if (process.env.NODE_ENV === 'production') {
    return executor;
  }

  // If no debug options, return executor unchanged for performance
  if (!context.debug) {
    return executor;
  }

  // Return a wrapped executor that applies debug behaviors
  return async (params: unknown): Promise<T> => {
    // Apply debug delay if configured
    if (context.debug?.simulateLongRunning) {
      const targetNode = resolveNodeId(
        context.debug.simulateLongRunning.nodeId,
        [nodeId],
        context,
        "simulateLongRunning",
      );

      if (targetNode === nodeId) {
        const delay = context.debug.simulateLongRunning.delayMs;
        console.log(`[DEBUG] Adding ${delay}ms delay to node '${nodeId}'`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // Check if debug error should be thrown
    if (context.debug?.simulateError) {
      const targetNode = resolveNodeId(
        context.debug.simulateError.nodeId,
        [nodeId],
        context,
        "simulateError",
      );

      if (targetNode === nodeId) {
        const { errorType, message, delayMs } = context.debug.simulateError;

        // If delayMs is specified, wait before throwing (simulates mid-execution failure)
        if (delayMs && delayMs > 0) {
          console.log(`[DEBUG] Waiting ${delayMs}ms before throwing error on node '${nodeId}'`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }

        const errorMessage =
          message || ERROR_TYPE_MESSAGES[errorType] || "Simulated error";

        throw new Error(`[${errorType.toUpperCase()}] ${errorMessage}`);
      }
    }

    // Execute the actual function
    return executor(params);
  };
}

/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use wrapExecutorWithDebug instead
 */
export async function applyDebugDelay(
  nodeId: string,
  context: ConductorExecutionContext,
): Promise<void> {
  if (!context.debug?.simulateLongRunning) return;

  const targetNode = resolveNodeId(
    context.debug.simulateLongRunning.nodeId,
    [nodeId],
    context,
    "simulateLongRunning",
  );

  if (targetNode === nodeId) {
    const delay = context.debug.simulateLongRunning.delayMs;
    console.log(`[DEBUG] Adding ${delay}ms delay to node '${nodeId}'`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use wrapExecutorWithDebug instead
 */
export function checkDebugError(
  nodeId: string,
  context: ConductorExecutionContext,
): void {
  if (!context.debug?.simulateError) return;

  const targetNode = resolveNodeId(
    context.debug.simulateError.nodeId,
    [nodeId],
    context,
    "simulateError",
  );

  if (targetNode === nodeId) {
    const { errorType, message } = context.debug.simulateError;
    const errorMessage =
      message || ERROR_TYPE_MESSAGES[errorType] || "Simulated error";

    throw new Error(`[${errorType.toUpperCase()}] ${errorMessage}`);
  }
}