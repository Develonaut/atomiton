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
import { createProgressController } from "#execution/progressController";
import { validateNodeExecution } from "#execution/validation";
import { createExecutionResult } from "#execution/resultBuilder";
import { wrapExecutorWithDebug } from "#execution/debugUtils";

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
  // Declare progress controller outside try/catch so it's accessible in error handler
  let progressController: ReturnType<typeof createProgressController> | null =
    null;

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

    // Start progress tracking (if store exists)
    progressController = executionGraphStore
      ? createProgressController(
          node,
          executionGraphStore,
          context.slowMo ?? DEFAULT_SLOWMO_MS,
        )
      : null;
    const progressPromise = progressController?.start() ?? Promise.resolve();

    // Execute node (parallel with progress tracking)
    const params = { ...context, ...node.parameters };

    // Wrap executor with debug behaviors (clean separation of concerns)
    const debugExecutor = wrapExecutorWithDebug(
      validation.executable.execute.bind(validation.executable),
      node.id,
      context,
    );

    const executionResult = await debugExecutor(params);

    // Wait for progress, then mark complete
    await progressPromise;
    progressController?.markComplete();

    return createExecutionResult({
      success: true,
      data: executionResult,
      duration: Date.now() - startTime,
      executedNodes: [node.id],
      context,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Cancel progress on error to freeze at current value
    progressController?.cancel();

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
