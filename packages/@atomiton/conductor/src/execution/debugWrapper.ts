/**
 * Debug wrapper using the DebugController
 * Provides clean separation between debug logic and execution
 */

import type { DebugController } from "#debug";

/**
 * Type for an executor function
 */
type ExecutorFn<T = unknown> = (params: unknown) => Promise<T>;

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
 * Wrap an executor with debug controller behaviors
 * Uses the DebugController to determine what debug actions to apply
 */
export function wrapExecutorWithDebugController<T = unknown>(
  executor: ExecutorFn<T>,
  nodeId: string,
  debugController?: DebugController,
): ExecutorFn<T> {
  // If no debug controller, return executor unchanged
  if (!debugController) {
    return executor;
  }

  // Return a wrapped executor that applies debug behaviors
  return async (params: unknown): Promise<T> => {
    // Apply debug delay if configured
    const delay = debugController.getNodeDelay(nodeId);
    if (delay > 0) {
      console.log(`[DEBUG] Adding ${delay}ms delay to node '${nodeId}'`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // Check if debug error should be thrown
    const errorInfo = debugController.getSimulatedError(nodeId);
    if (errorInfo) {
      const { errorType, message, delayMs } = errorInfo;

      // If delayMs is specified, wait before throwing (simulates mid-execution failure)
      if (delayMs && delayMs > 0) {
        console.log(
          `[DEBUG] Waiting ${delayMs}ms before throwing error on node '${nodeId}'`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      const errorMessage =
        message || ERROR_TYPE_MESSAGES[errorType] || "Simulated error";

      throw new Error(`[${errorType.toUpperCase()}] ${errorMessage}`);
    }

    // Execute the actual function
    return executor(params);
  };
}
