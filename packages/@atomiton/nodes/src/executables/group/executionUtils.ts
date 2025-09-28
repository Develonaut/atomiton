/**
 * Execution Utilities
 * Common utilities for group node execution
 */

import type { NodeExecutionContext } from "#core/utils/executable";
import type {
  ExecutableNode,
  ExecutionMetadata,
} from "#executables/group/types";

/**
 * Execute a node with retry logic
 */
export async function executeWithRetries(
  node: ExecutableNode,
  context: NodeExecutionContext,
  retries: number,
  timeout: number,
): Promise<unknown> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(new Error(`Node execution timed out after ${timeout}ms`)),
          timeout,
        ),
      );

      // Execute with timeout
      const result = await Promise.race([
        node.execute(context),
        timeoutPromise,
      ]);

      // If execution succeeded, return the result
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this is the last attempt, throw the error
      if (attempt === retries) {
        throw lastError;
      }

      // Log retry attempt
      context.log?.warn?.(
        `Node ${node.name} threw error, retrying (attempt ${attempt + 1}/${retries})`,
        {
          error: lastError.message,
          nodeId: node.id,
        },
      );
    }

    // Wait before retry (exponential backoff)
    if (attempt < retries) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error("Unknown error during node execution");
}

/**
 * Create execution metadata
 */
export function createExecutionMetadata(
  context: NodeExecutionContext,
  childNodesExecuted: number,
  totalExecutionTime: number,
  failedNode?: string,
): ExecutionMetadata {
  return {
    executedAt: new Date().toISOString(),
    nodeId: context.nodeId || "group",
    nodeType: "group",
    childNodesExecuted,
    totalExecutionTime,
    failedNode,
  };
}

/**
 * Create error result
 */
export function createErrorResult(
  nodeName: string,
  error: string,
  metadata: ExecutionMetadata,
): { error: string; metadata: ExecutionMetadata } {
  return {
    error: `Child node ${nodeName} failed: ${error}`,
    metadata,
  };
}

/**
 * Create child execution context
 */
export function createChildContext(
  baseContext: NodeExecutionContext,
  nodeId: string,
  previousResult?: unknown,
): NodeExecutionContext {
  return {
    ...baseContext,
    nodeId,
    inputs:
      (previousResult as Record<string, unknown>) || baseContext.inputs || {},
  };
}
