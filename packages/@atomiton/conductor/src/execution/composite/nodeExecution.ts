/**
 * Node execution functions for composite workflows
 */

import type {
  CompositeDefinition,
  INode,
  NodeExecutionContext,
  NodeExecutionResult,
} from "@atomiton/nodes";
import type PQueue from "p-queue";
import type { CompositeExecutionOptions } from "./types";
import type { ExecutionStore } from "../../store";
import type { NodeExecutorInstance } from "../nodeExecutor";
import { gatherNodeInputs } from "./dataHandling";

/**
 * Executes a single node within a composite
 */
export async function executeNode(
  nodeId: string,
  composite: CompositeDefinition,
  executionId: string,
  options: CompositeExecutionOptions,
  nodeRegistry: Map<string, INode>,
  executionResults: Map<string, Map<string, NodeExecutionResult>>,
  executionStore: ExecutionStore,
  nodeExecutor: NodeExecutorInstance,
): Promise<NodeExecutionResult> {
  const compositeNode = composite.nodes.find((n) => n.id === nodeId);
  if (!compositeNode) {
    throw new Error(`Node not found in composite: ${nodeId}`);
  }

  const node = nodeRegistry.get(compositeNode.type);
  if (!node) {
    throw new Error(`Node type not registered: ${compositeNode.type}`);
  }

  // Gather inputs from connected nodes
  const inputs = gatherNodeInputs(
    nodeId,
    composite,
    executionId,
    executionResults,
    executionStore,
  );

  const context: NodeExecutionContext = {
    nodeId,
    compositeId: composite.id,
    inputs,
    parameters: compositeNode.data,
    workspaceRoot: options.workspaceRoot,
    startTime: new Date(),
    limits: {
      maxExecutionTimeMs: options.timeoutMs || 30000,
      maxMemoryMB: 512,
    },
    reportProgress: (_progress: number, _message?: string) => {
      // Progress reporting handled in NodeExecutor
    },
    log: {
      debug: (msg: string, data?: unknown) =>
        console.warn(`[${nodeId}]`, msg, data),
      info: (msg: string, data?: unknown) =>
        console.warn(`[${nodeId}]`, msg, data),
      warn: (msg: string, data?: unknown) =>
        console.warn(`[${nodeId}]`, msg, data),
      error: (msg: string, data?: unknown) =>
        console.error(`[${nodeId}]`, msg, data),
    },
  };

  const result = await nodeExecutor.executeNode(node, context, executionId);

  // Store the result for use by downstream nodes
  if (!executionResults.has(executionId)) {
    executionResults.set(executionId, new Map());
  }
  executionResults.get(executionId)!.set(nodeId, result);

  return result;
}

/**
 * Executes nodes in parallel using a queue
 */
export async function executeNodesInParallel(
  nodeIds: string[],
  composite: CompositeDefinition,
  executionId: string,
  options: CompositeExecutionOptions,
  results: Record<string, NodeExecutionResult>,
  times: Record<string, number>,
  nodeRegistry: Map<string, INode>,
  executionResults: Map<string, Map<string, NodeExecutionResult>>,
  executionStore: ExecutionStore,
  nodeExecutor: NodeExecutorInstance,
  executionQueue: PQueue,
): Promise<void> {
  const promises = nodeIds.map((nodeId) =>
    executionQueue.add(async () => {
      const startTime = performance.now();
      const result = await executeNode(
        nodeId,
        composite,
        executionId,
        options,
        nodeRegistry,
        executionResults,
        executionStore,
        nodeExecutor,
      );
      const endTime = performance.now();

      results[nodeId] = result;
      times[nodeId] = endTime - startTime;
    }),
  );

  await Promise.all(promises);
}

/**
 * Executes nodes sequentially within a level
 */
export async function executeNodeLevel(
  nodeIds: string[],
  composite: CompositeDefinition,
  executionId: string,
  options: CompositeExecutionOptions,
  results: Record<string, NodeExecutionResult>,
  times: Record<string, number>,
  nodeRegistry: Map<string, INode>,
  executionResults: Map<string, Map<string, NodeExecutionResult>>,
  executionStore: ExecutionStore,
  nodeExecutor: NodeExecutorInstance,
): Promise<void> {
  for (const nodeId of nodeIds) {
    const startTime = performance.now();
    const result = await executeNode(
      nodeId,
      composite,
      executionId,
      options,
      nodeRegistry,
      executionResults,
      executionStore,
      nodeExecutor,
    );
    const endTime = performance.now();

    results[nodeId] = result;
    times[nodeId] = endTime - startTime;

    if (!result.success) {
      throw new Error(`Node ${nodeId} failed: ${result.error}`);
    }
  }
}
