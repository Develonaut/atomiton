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
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import type { ExecutionGraphStore } from "#execution/executionGraphStore";
import { topologicalSort } from "@atomiton/nodes/graph";
import { executeGraphNode } from "#execution/executeGraphNode";
import { buildChildNodeInput } from "#execution/inputBuilder";
import { buildChildExecutionContext } from "#execution/contextBuilder";
import { createExecutionResult } from "#execution/resultBuilder";
import { completeExecution } from "#execution/storeHelpers";
import { initializeDebugOptions } from "#execution/debugUtils";

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
      // Initialize debug options for single node
      initializeDebugOptions([node.id], context);

      // TODO: Review transport usage - desktop conductor shouldn't use transport for local execution
      // Transport should only be used by browser conductor to delegate to desktop
      // This may be causing slowMo delays to be bypassed
      const result = config.transport
        ? await config.transport.execute(node, context)
        : await executeGraphNode(
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

    // Initialize debug options - resolve random node selections
    initializeDebugOptions(sortedIds, context);

    for (const childNode of sorted) {
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
      executedNodes: [node.id, ...executedNodes],
      context,
      trace: executionGraphStore?.getTrace(),
    });
  } catch (error) {
    completeExecution(executionGraphStore);

    return createExecutionResult({
      success: false,
      error: {
        nodeId: node.id,
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
        stack: error instanceof Error ? error.stack : undefined,
      },
      duration: Date.now() - startTime,
      executedNodes: [node.id, ...executedNodes],
      trace: executionGraphStore?.getTrace(),
    });
  }
}
