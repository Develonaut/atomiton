/**
 * Execute a graph of nodes (handles both single nodes and groups)
 *
 * This is the unified execution path for all nodes. Single nodes are treated
 * as 1-node graphs, ensuring consistent progress tracking and execution flow.
 */

import type {
  ConductorConfig,
  ConductorExecutionContext,
  ExecutionResult,
} from "#types";
import { toNodeId, ErrorCode, createExecutionError } from "#types";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import type { ExecutionGraphStore } from "#execution/executionGraphStore";
import { topologicalSort } from "@atomiton/nodes/graph";
import { executeGraphNode } from "#execution/executeGraphNode";
import { buildChildNodeInput } from "#execution/inputBuilder";
import { buildChildExecutionContext } from "#execution/contextBuilder";
import { createExecutionResult } from "#execution/resultBuilder";
import { completeExecution } from "#execution/storeHelpers";
// Debug utilities are now handled by DebugController

/**
 * Execute a graph of nodes (handles both single nodes and groups)
 */
export async function executeGraph(
  node: NodeDefinition,
  context: ConductorExecutionContext,
  config: ConductorConfig,
  executionGraphStore: ExecutionGraphStore | undefined,
  execute: (
    node: NodeDefinition,
    context: ConductorExecutionContext,
    config: ConductorConfig,
    store?: ExecutionGraphStore,
  ) => Promise<ExecutionResult>,
): Promise<ExecutionResult> {
  const startTime = Date.now();
  const executedNodes: string[] = [];
  const nodeOutputs = new Map<string, unknown>();

  try {
    // Handle single nodes (no children)
    if (!node.nodes || node.nodes.length === 0) {
      // Initialize debug controller with node IDs if available
      if (config.debugController) {
        config.debugController.initialize([node.id]);
      }

      // Apply visual delay BEFORE node execution for single nodes too
      const slowMoDelay =
        config.debugController?.getSlowMoDelay() ?? context.slowMo ?? 0;
      if (slowMoDelay > 0) {
        const { delay: wait } = await import("@atomiton/utils");
        await wait(slowMoDelay);
      }

      // Desktop conductor ALWAYS uses local execution
      // Transport is only for browser → desktop communication, never for local execution
      const result = await executeGraphNode(
        node,
        context,
        startTime,
        config,
        executionGraphStore,
      );

      completeExecution(executionGraphStore);

      // Include trace in result
      return {
        ...result,
        trace: executionGraphStore?.getTrace(),
      };
    }

    // Use topological sort from graph analyzer and flatten levels to sequential execution
    const sortedLevels = topologicalSort(node.nodes, node.edges || []);
    const sortedIds = sortedLevels.flat();
    const sorted = sortedIds
      .map((id) => node.nodes!.find((n) => n.id === id)!)
      .filter(Boolean);

    // Initialize debug controller with all node IDs for random selection
    if (config.debugController) {
      config.debugController.initialize(sortedIds);
    }

    for (const childNode of sorted) {
      // Apply visual delay BEFORE node execution for better progress visibility
      // This ensures users can see nodes being selected before they execute
      const slowMoDelay =
        config.debugController?.getSlowMoDelay() ?? context.slowMo ?? 0;
      if (slowMoDelay > 0) {
        const { delay: wait } = await import("@atomiton/utils");
        await wait(slowMoDelay);
      }

      // Build child input from edges
      const childInput = buildChildNodeInput(
        childNode,
        node.edges,
        nodeOutputs,
        context.input,
      );

      // Build child context
      const childContext = buildChildExecutionContext(
        childNode,
        context,
        childInput,
      );

      // Execute child
      const result = await execute(
        childNode,
        childContext,
        config,
        executionGraphStore,
      );

      if (!result.success) {
        completeExecution(executionGraphStore);
        return createExecutionResult({
          success: false,
          error: result.error!,
          duration: Date.now() - startTime,
          executedNodes: [...executedNodes, ...(result.executedNodes || [])],
          trace: executionGraphStore?.getTrace(),
        });
      }

      nodeOutputs.set(childNode.id, result.data);
      executedNodes.push(...(result.executedNodes || []));
    }

    // Return the output of the last node
    const lastNodeId = sorted[sorted.length - 1]?.id;
    const finalOutput = lastNodeId ? nodeOutputs.get(lastNodeId) : undefined;

    completeExecution(executionGraphStore);

    return createExecutionResult({
      success: true,
      data: finalOutput,
      duration: Date.now() - startTime,
      executedNodes: [toNodeId(node.id), ...executedNodes],
      context,
      trace: executionGraphStore?.getTrace(),
    });
  } catch (error) {
    completeExecution(executionGraphStore);

    const executionError = createExecutionError(
      ErrorCode.EXECUTION_FAILED,
      error instanceof Error ? error.message : String(error),
      {
        nodeId: toNodeId(node.id),
        executionId: context.executionId,
        stack: error instanceof Error ? error.stack : undefined,
        cause: error,
      },
    );

    return createExecutionResult({
      success: false,
      error: executionError,
      duration: Date.now() - startTime,
      executedNodes: [toNodeId(node.id), ...executedNodes],
      trace: executionGraphStore?.getTrace(),
    });
  }
}
