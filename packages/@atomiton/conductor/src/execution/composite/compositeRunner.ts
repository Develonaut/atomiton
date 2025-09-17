/**
 * Composite Runner - Main orchestration factory for multi-node Composite execution
 */

import type {
  CompositeDefinition,
  INode,
  NodeExecutionResult,
} from "@atomiton/nodes/executable";
import type { ExecutionStatus } from "../../interfaces/IExecutionEngine";
import PQueue from "p-queue";
import { type ExecutionStore } from "../../store";
import type { NodeExecutorInstance } from "../nodeExecutor";
import type {
  CompositeExecutionOptions,
  CompositeExecutionResult,
  CompositeRunnerInstance,
} from "./types";
import { validateComposite } from "./validation";
import { buildExecutionGraph } from "./executionGraph";
import { calculateCompositeOutputs } from "./dataHandling";
import { executeNodesInParallel, executeNodeLevel } from "./nodeExecution";

export function createCompositeRunner(
  executionStore: ExecutionStore,
  nodeExecutor: NodeExecutorInstance,
  options: { maxConcurrency?: number } = {},
): CompositeRunnerInstance {
  // Private state using closures
  const nodeRegistry = new Map<string, INode>();
  const executionQueue = new PQueue({
    concurrency: options.maxConcurrency || 4,
  });
  const executionResults = new Map<string, Map<string, NodeExecutionResult>>();

  const registerNode = (nodeType: string, node: INode): void => {
    nodeRegistry.set(nodeType, node);
  };

  const execute = (
    composite: CompositeDefinition,
    options: CompositeExecutionOptions = {},
  ): Promise<CompositeExecutionResult> => {
    return executeComposite(composite, options);
  };

  const executeComposite = async (
    composite: CompositeDefinition,
    options: CompositeExecutionOptions = {},
  ): Promise<CompositeExecutionResult> => {
    const executionId = `execution-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const startTime = new Date();

    // Initialize execution
    executionStore.initializeExecution(executionId, composite.id);

    try {
      // Validate composite
      const validation = validateComposite(composite, nodeRegistry);
      if (!validation.valid) {
        throw new Error(
          `Composite validation failed: ${validation.errors.join(", ")}`,
        );
      }

      // Set initial inputs
      if (options.inputs) {
        Object.entries(options.inputs).forEach(([key, value]) => {
          executionStore.setVariable(executionId, key, value);
        });
      }

      executionStore.updateExecutionState(executionId, {
        status: "running" as ExecutionStatus,
      });

      // Build execution graph
      const executionGraph = buildExecutionGraph(composite);

      // Execute nodes in dependency order
      const nodeResults: Record<string, NodeExecutionResult> = {};
      const executionTimes: Record<string, number> = {};

      if (
        options.enableParallelExecution &&
        executionGraph.parallelizable.length > 0
      ) {
        // Execute parallelizable nodes
        await executeNodesInParallel(
          executionGraph.parallelizable,
          composite,
          executionId,
          options,
          nodeResults,
          executionTimes,
          nodeRegistry,
          executionResults,
          executionStore,
          nodeExecutor,
          executionQueue,
        );
      }

      // Execute sequential nodes
      for (const nodeLevel of executionGraph.sequential) {
        await executeNodeLevel(
          nodeLevel,
          composite,
          executionId,
          options,
          nodeResults,
          executionTimes,
          nodeRegistry,
          executionResults,
          executionStore,
          nodeExecutor,
        );
      }

      const endTime = new Date();
      const totalExecutionTime = endTime.getTime() - startTime.getTime();

      // Calculate final outputs
      const outputs = calculateCompositeOutputs(composite, nodeResults);

      // Calculate metrics
      const nodesExecuted = Object.keys(nodeResults).length;
      const nodesSucceeded = Object.values(nodeResults).filter(
        (r) => r.success,
      ).length;
      const nodesFailed = nodesExecuted - nodesSucceeded;

      const result: CompositeExecutionResult = {
        success: nodesFailed === 0,
        outputs,
        executionId,
        metrics: {
          totalExecutionTime,
          nodeExecutionTimes: executionTimes,
          nodesExecuted,
          nodesSucceeded,
          nodesFailed,
        },
      };

      executionStore.updateExecutionState(executionId, {
        status: result.success
          ? ("completed" as ExecutionStatus)
          : ("failed" as ExecutionStatus),
        endTime,
      });

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      executionStore.updateExecutionState(executionId, {
        status: "failed" as ExecutionStatus,
        endTime: new Date(),
      });

      return {
        success: false,
        outputs: {},
        error: errorMessage,
        executionId,
        metrics: {
          totalExecutionTime: new Date().getTime() - startTime.getTime(),
          nodeExecutionTimes: {},
          nodesExecuted: 0,
          nodesSucceeded: 0,
          nodesFailed: 0,
        },
      };
    }
  };

  // Return public API
  return {
    registerNode,
    execute,
    executeComposite,
  };
}
