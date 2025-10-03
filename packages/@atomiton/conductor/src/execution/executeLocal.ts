/**
 * Execute a single node locally
 */

import type {
  ConductorConfig,
  ConductorExecutionContext,
  ExecutionResult,
} from "#types";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import type { ExecutionGraphStore } from "#execution/executionGraphStore";

/**
 * Execute a single node locally using the provided executor factory
 */
export async function executeLocal(
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

    // Get the SimpleNodeExecutable for this node type
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

    // SimpleNodeExecutable is just a function that takes params and returns a result
    const params = {
      ...context,
      ...node.parameters,
    };

    const result = await nodeExecutable.execute(params);

    // Update store: node completed successfully
    if (executionGraphStore) {
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
