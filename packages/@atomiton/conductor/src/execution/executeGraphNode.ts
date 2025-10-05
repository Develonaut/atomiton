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
import { createProgressAnimation } from "#execution/progressAnimation";
import { validateNodeExecution } from "#execution/validation";
import { createExecutionResult } from "#execution/resultBuilder";

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
    // Set executing state
    executionGraphStore?.setNodeState(node.id, "executing");

    // Validate node can execute
    const validation = validateNodeExecution(node, config);
    if (!validation.valid) {
      executionGraphStore?.setNodeState(
        node.id,
        "error",
        validation.error.message,
      );
      return createExecutionResult({
        success: false,
        error: validation.error,
        duration: Date.now() - startTime,
        executedNodes: [node.id],
        context,
      });
    }

    // Start animation (if store exists)
    const animation = executionGraphStore
      ? createProgressAnimation(
          node,
          executionGraphStore,
          context.slowMo ?? DEFAULT_SLOWMO_MS,
        )
      : null;
    const animationPromise = animation?.start() ?? Promise.resolve();

    // Execute node (parallel with animation)
    const params = { ...context, ...node.parameters };
    const executionResult = await validation.executable.execute(params);

    // Wait for animation, then mark complete
    await animationPromise;
    animation?.markComplete();

    return createExecutionResult({
      success: true,
      data: executionResult,
      duration: Date.now() - startTime,
      executedNodes: [node.id],
      context,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    executionGraphStore?.setNodeState(node.id, "error", errorMessage);

    return createExecutionResult({
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
    });
  }
}
