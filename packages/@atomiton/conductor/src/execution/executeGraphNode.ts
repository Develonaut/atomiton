/**
 * Execute a single graph node (leaf node execution)
 */

import { DEFAULT_SLOWMO_MS } from "#execution/constants";
import type { ExecutionGraphStore } from "#execution/executionGraphStore";
import type {
  ConductorConfig,
  ConductorExecutionContext,
  ExecutionResult,
} from "#types";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { delay } from "@atomiton/utils";

/**
 * Execute a single graph node using the provided executor factory
 * This is called by executeGraph for each leaf node in the graph
 */
export async function executeGraphNode(
  node: NodeDefinition,
  context: ConductorExecutionContext,
  startTime: number,
  config: ConductorConfig,
  executionGraphStore?: ExecutionGraphStore,
): Promise<ExecutionResult> {
  try {
    // Update store: node started executing
    if (executionGraphStore) {
      executionGraphStore.setNodeState(node.id, "executing");
    }

    if (!config.nodeExecutorFactory) {
      // No local execution available without executor factory
      if (executionGraphStore) {
        executionGraphStore.setNodeState(
          node.id,
          "error",
          "No executor factory provided",
        );
      }
      return {
        success: false,
        error: {
          nodeId: node.id,
          message: `No executor factory provided for local execution`,
          timestamp: new Date(),
          code: "NO_EXECUTOR_FACTORY",
        },
        duration: Date.now() - startTime,
        executedNodes: [node.id],
        context,
      };
    }

    const nodeExecutable = config.nodeExecutorFactory.getNodeExecutable(
      node.type,
    );

    if (!nodeExecutable) {
      if (executionGraphStore) {
        executionGraphStore.setNodeState(
          node.id,
          "error",
          "No implementation found",
        );
      }
      return {
        success: false,
        error: {
          nodeId: node.id,
          message: `No implementation found for node type: ${node.type}`,
          timestamp: new Date(),
          code: "NODE_TYPE_NOT_FOUND",
        },
        duration: Date.now() - startTime,
        executedNodes: [node.id],
        context,
      };
    }

    const params = {
      ...context,
      ...node.parameters,
    };

    // Run progress animation sequentially before node execution
    // Use actual delays to ensure all steps complete visually before execution starts
    if (executionGraphStore) {
      const slowMo = context.slowMo ?? DEFAULT_SLOWMO_MS;

      // Show smooth progress animation with more frequent updates
      const progressSteps = [0, 20, 40, 60, 80, 90];
      const messages = [
        "Starting...",
        "Initializing...",
        "Processing...",
        "Computing...",
        "Finalizing...",
        "Almost done...",
      ];

      // Run all progress steps BEFORE starting execution
      for (let i = 0; i < progressSteps.length; i++) {
        executionGraphStore.setNodeProgress(
          node.id,
          progressSteps[i],
          messages[i],
        );
        if (i < progressSteps.length - 1) {
          // Don't delay after the last step
          await delay(slowMo);
        }
      }
    }

    const result = await nodeExecutable.execute(params);

    // Update store: node completed successfully
    if (executionGraphStore) {
      executionGraphStore.setNodeProgress(node.id, 100, "Complete");
      executionGraphStore.setNodeState(node.id, "completed");
    }

    return {
      success: true,
      data: result,
      duration: Date.now() - startTime,
      executedNodes: [node.id],
      context,
    };
  } catch (error) {
    // Update store: node failed
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (executionGraphStore) {
      executionGraphStore.setNodeState(node.id, "error", errorMessage);
    }

    return {
      success: false,
      error: {
        nodeId: node.id,
        message: errorMessage,
        timestamp: new Date(),
        stack: error instanceof Error ? error.stack : undefined,
      },
      duration: Date.now() - startTime,
      executedNodes: [node.id],
      context,
    };
  }
}
