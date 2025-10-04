/**
 * Execute a single graph node (leaf node execution)
 */

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

    // Set initial progress with configurable slow-mo delay
    if (executionGraphStore) {
      const slowMo = context.slowMo ?? 50; // Default to 50ms per step (100ms total)
      console.log(
        `[executeGraphNode] Node ${node.id}: slowMo=${slowMo}ms, will delay ${slowMo * 2}ms total`,
      );

      executionGraphStore.setNodeProgress(node.id, 0, "Starting...");
      await delay(slowMo);

      // Show intermediate progress
      executionGraphStore.setNodeProgress(node.id, 30, "Processing...");
      await delay(slowMo);
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
