/**
 * Execute a graph of nodes (handles both single nodes and groups)
 *
 * This is the unified execution path for all nodes. Single nodes are treated
 * as 1-node graphs, ensuring consistent progress tracking and execution flow.
 */

import type {
  ConductorConfig,
  ConductorExecutionContext,
  ExecutionError,
  ExecutionResult,
} from "#types";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { generateExecutionId } from "@atomiton/utils";
import type { ExecutionGraphStore } from "#execution/executionGraphStore";
import { topologicalSort } from "@atomiton/nodes/graph";
import { executeGraphNode } from "#execution/executeGraphNode";

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
      // TODO: Review transport usage - desktop conductor shouldn't use transport for local execution
      // Transport should only be used by browser conductor to delegate to desktop
      // This may be causing slowMo delays to be bypassed
      // Use transport if configured, otherwise execute locally
      if (config.transport) {
        const result = await config.transport.execute(node, context);
        if (executionGraphStore) {
          executionGraphStore.completeExecution();
        }
        return result;
      }

      const result = await executeGraphNode(
        node,
        context,
        startTime,
        config,
        executionGraphStore,
      );
      if (executionGraphStore) {
        executionGraphStore.completeExecution();
      }
      return result;
    }

    // Use topological sort from graph analyzer and flatten levels to sequential execution
    const sortedLevels = topologicalSort(node.nodes, node.edges || []);
    const sortedIds = sortedLevels.flat();
    const sorted = sortedIds
      .map((id) => node.nodes!.find((n) => n.id === id)!)
      .filter(Boolean);

    for (const childNode of sorted) {
      // Build input from edges - start with empty object to avoid parent input leaking
      const edgeInput = node.edges
        ?.filter((edge) => edge.target === childNode.id)
        .reduce((acc: Record<string, unknown>, edge) => {
          const sourceOutput = nodeOutputs.get(edge.source);
          if (sourceOutput !== undefined) {
            const key = edge.targetHandle || "default";
            return { ...acc, [key]: sourceOutput };
          }
          return acc;
        }, {});

      // Determine child input: use edge data if available, otherwise parent context
      const hasEdgeData = edgeInput && Object.keys(edgeInput).length > 0;
      const childInput = hasEdgeData
        ? edgeInput // Edge data completely replaces parent input
        : context.input || {}; // No edges: use parent input

      const childContext: ConductorExecutionContext = {
        nodeId: childNode.id,
        executionId: generateExecutionId(`child_${childNode.id}`),
        variables: context.variables,
        input: childInput,
        parentContext: context,
        slowMo: context.slowMo,
      };

      const result = await execute(
        childNode,
        childContext,
        config,
        executionGraphStore,
      );

      if (!result.success) {
        if (executionGraphStore) {
          executionGraphStore.completeExecution();
        }
        return {
          success: false,
          error: result.error,
          duration: Date.now() - startTime,
          executedNodes: [...executedNodes, ...(result.executedNodes || [])],
        };
      }

      nodeOutputs.set(childNode.id, result.data);
      executedNodes.push(...(result.executedNodes || []));
    }

    // Return the output of the last node
    const lastNodeId = sorted[sorted.length - 1]?.id;
    const finalOutput = lastNodeId ? nodeOutputs.get(lastNodeId) : undefined;

    if (executionGraphStore) {
      executionGraphStore.completeExecution();
    }

    return {
      success: true,
      data: finalOutput,
      duration: Date.now() - startTime,
      executedNodes: [node.id, ...executedNodes],
      context,
    };
  } catch (error) {
    const executionError: ExecutionError = {
      nodeId: node.id,
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date(),
      stack: error instanceof Error ? error.stack : undefined,
    };

    if (executionGraphStore) {
      executionGraphStore.completeExecution();
    }

    return {
      success: false,
      error: executionError,
      duration: Date.now() - startTime,
      executedNodes: [node.id, ...executedNodes],
    };
  }
}
