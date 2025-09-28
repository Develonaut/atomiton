/**
 * Group Node Operations
 * Extracted execution logic for group workflow execution
 */

import type { NodeExecutionContext } from "#core/utils/executable";
import type { GroupParameters } from "#schemas/group";
import {
  createChildContext,
  createErrorResult,
  createExecutionMetadata,
  executeWithRetries,
} from "#executables/group/executionUtils";
import type { GroupGraph } from "#executables/group/types";

export type {
  GroupGraph,
  ExecutableNode,
  NodeEdge,
} from "#executables/group/types";

/**
 * Execute nodes in sequence
 */
export async function executeSequential(
  graph: GroupGraph,
  context: NodeExecutionContext,
  params: GroupParameters,
): Promise<unknown> {
  let previousResult: unknown;
  let totalExecutionTime = 0;

  for (const node of graph.nodes) {
    const startTime = Date.now();
    const childContext = createChildContext(context, node.id, previousResult);

    try {
      const retries = typeof params.retries === "number" ? params.retries : 0;
      const timeout =
        typeof params.timeout === "number" ? params.timeout : 30000;
      const result = await executeWithRetries(
        node,
        childContext,
        retries,
        timeout,
      );

      totalExecutionTime += Date.now() - startTime;
      previousResult = result;
    } catch (error) {
      totalExecutionTime += Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const metadata = createExecutionMetadata(
        context,
        graph.nodes.indexOf(node),
        totalExecutionTime,
        node.id,
      );
      return createErrorResult(node.name, errorMessage, metadata);
    }
  }

  const metadata = createExecutionMetadata(
    context,
    graph.nodes.length,
    totalExecutionTime,
  );

  return {
    result: previousResult || {},
    metadata,
  };
}

/**
 * Execute nodes in parallel
 */
export async function executeParallel(
  graph: GroupGraph,
  context: NodeExecutionContext,
  params: GroupParameters,
): Promise<unknown> {
  const startTime = Date.now();

  try {
    // Execute all nodes in parallel
    const promises = graph.nodes.map(async (node) => {
      const childContext = createChildContext(context, node.id);
      const retries = typeof params.retries === "number" ? params.retries : 0;
      const timeout =
        typeof params.timeout === "number" ? params.timeout : 30000;
      return executeWithRetries(node, childContext, retries, timeout);
    });

    const results = await Promise.allSettled(promises);
    const totalExecutionTime = Date.now() - startTime;

    // Check for failures
    const failures = results
      .map((result, index) => ({ result, node: graph.nodes[index] }))
      .filter(({ result }) => result.status === "rejected");

    if (failures.length > 0) {
      const firstFailure = failures[0];
      const errorMessage =
        firstFailure.result.status === "rejected"
          ? firstFailure.result.reason.message ||
            String(firstFailure.result.reason)
          : "Unknown error";

      const metadata = createExecutionMetadata(
        context,
        results.length - failures.length,
        totalExecutionTime,
        firstFailure.node.id,
      );

      return createErrorResult(firstFailure.node.name, errorMessage, metadata);
    }

    // Collect successful results
    const successfulResults = results
      .filter(
        (result): result is PromiseFulfilledResult<unknown> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value);

    const metadata = createExecutionMetadata(
      context,
      graph.nodes.length,
      totalExecutionTime,
    );

    return {
      result: successfulResults,
      metadata,
    };
  } catch (error) {
    const totalExecutionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    const metadata = createExecutionMetadata(context, 0, totalExecutionTime);

    return createErrorResult("parallel execution", errorMessage, metadata);
  }
}
