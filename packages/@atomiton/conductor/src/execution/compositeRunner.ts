/**
 * Composite Runner - Orchestrates multi-node Composite execution with dependency resolution
 */

import type {
  CompositeDefinition,
  INode,
  NodeExecutionContext,
  NodeExecutionResult,
} from "@atomiton/nodes";
import type { ExecutionStatus } from "../interfaces/IExecutionEngine";
import PQueue from "p-queue";
import type { StateManagerInstance } from "../state/stateManager";
import type { NodeExecutorInstance } from "./nodeExecutor";

export type CompositeExecutionOptions = {
  maxConcurrency?: number;
  enableParallelExecution?: boolean;
  timeoutMs?: number;
  workspaceRoot?: string;
  inputs?: Record<string, unknown>;
};

export type CompositeExecutionResult = {
  success: boolean;
  outputs: Record<string, unknown>;
  error?: string;
  executionId: string;
  metrics: {
    totalExecutionTime: number;
    nodeExecutionTimes: Record<string, number>;
    nodesExecuted: number;
    nodesSucceeded: number;
    nodesFailed: number;
    peakMemoryUsage?: number;
  };
};

export type CompositeRunnerInstance = {
  registerNode: (nodeType: string, node: INode) => void;
  execute: (
    composite: CompositeDefinition,
    options?: CompositeExecutionOptions,
  ) => Promise<CompositeExecutionResult>;
  executeComposite: (
    composite: CompositeDefinition,
    options?: CompositeExecutionOptions,
  ) => Promise<CompositeExecutionResult>;
};

export function createCompositeRunner(
  stateManager: StateManagerInstance,
  nodeExecutor: NodeExecutorInstance,
  options: { maxConcurrency?: number } = {},
): CompositeRunnerInstance {
  // Private state using closures
  const nodeRegistry = new Map<string, INode>();
  const executionQueue = new PQueue({
    concurrency: options.maxConcurrency || 4,
  });
  const executionResults = new Map<string, Map<string, NodeExecutionResult>>();

  // Private helper functions
  const validateComposite = (
    composite: CompositeDefinition,
  ): {
    valid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];

    // Check for required fields
    if (!composite.id) errors.push("Composite ID is required");
    if (!composite.name) errors.push("Composite name is required");
    if (!composite.nodes || composite.nodes.length === 0) {
      errors.push("Composite must have at least one node");
    }

    // Validate node types exist
    for (const node of composite.nodes) {
      if (!nodeRegistry.has(node.type)) {
        errors.push(`Unknown node type: ${node.type}`);
      }
    }

    // Validate connections
    for (const connection of composite.edges) {
      const sourceNode = composite.nodes.find(
        (n) => n.id === connection.source.nodeId,
      );
      const targetNode = composite.nodes.find(
        (n) => n.id === connection.target.nodeId,
      );

      if (!sourceNode) {
        errors.push(
          `Connection references unknown source node: ${connection.source.nodeId}`,
        );
      }
      if (!targetNode) {
        errors.push(
          `Connection references unknown target node: ${connection.target.nodeId}`,
        );
      }
    }

    // Check for circular dependencies
    if (hasCircularDependencies(composite)) {
      errors.push("Composite contains circular dependencies");
    }

    return { valid: errors.length === 0, errors };
  };

  const hasCircularDependencies = (composite: CompositeDefinition): boolean => {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      // Find all nodes that depend on this node
      const dependents = composite.edges
        .filter((conn) => conn.source.nodeId === nodeId)
        .map((conn) => conn.target.nodeId);

      for (const dependent of dependents) {
        if (hasCycle(dependent)) return true;
      }

      recursionStack.delete(nodeId);
      return false;
    };

    return composite.nodes.some((node) => hasCycle(node.id));
  };

  const buildExecutionGraph = (
    composite: CompositeDefinition,
  ): {
    sequential: string[][];
    parallelizable: string[];
  } => {
    const nodeIds = composite.nodes.map((n) => n.id);
    const dependencies = new Map<string, Set<string>>();

    // Build dependency map
    nodeIds.forEach((nodeId) => dependencies.set(nodeId, new Set()));

    for (const connection of composite.edges) {
      const deps = dependencies.get(connection.target.nodeId);
      if (deps) {
        deps.add(connection.source.nodeId);
      }
    }

    // Find nodes that can run in parallel (no dependencies)
    const parallelizable: string[] = [];
    const sequential: string[][] = [];
    const remaining = new Set(nodeIds);

    // First level - nodes with no dependencies
    const noDeps = nodeIds.filter((id) => dependencies.get(id)!.size === 0);
    if (noDeps.length > 1) {
      parallelizable.push(...noDeps);
    } else if (noDeps.length === 1) {
      sequential.push(noDeps);
    }

    noDeps.forEach((id) => remaining.delete(id));

    // Build sequential execution levels
    while (remaining.size > 0) {
      const ready: string[] = [];

      for (const nodeId of remaining) {
        const deps = dependencies.get(nodeId)!;
        const allDepsSatisfied = Array.from(deps).every(
          (depId) => !remaining.has(depId),
        );

        if (allDepsSatisfied) {
          ready.push(nodeId);
        }
      }

      if (ready.length === 0) {
        throw new Error("Circular dependency detected in composite");
      }

      sequential.push(ready);
      ready.forEach((id) => remaining.delete(id));
    }

    return { sequential, parallelizable };
  };

  const gatherNodeInputs = (
    nodeId: string,
    composite: CompositeDefinition,
    executionId: string,
  ): Record<string, unknown> => {
    const inputs: Record<string, unknown> = {};

    // Find all connections that target this node
    const incomingConnections = composite.edges.filter(
      (conn) => conn.target.nodeId === nodeId,
    );

    for (const connection of incomingConnections) {
      stateManager
        .getContext(executionId)
        ?.nodeStates.get(connection.source.nodeId);

      // Get results from the execution results map
      const executionResult = executionResults
        .get(executionId)
        ?.get(connection.source.nodeId);

      if (executionResult?.outputs) {
        const outputValue = executionResult.outputs[connection.source.portId];
        inputs[connection.target.portId] = outputValue;
      }
    }

    return inputs;
  };

  const executeNode = async (
    nodeId: string,
    composite: CompositeDefinition,
    executionId: string,
    options: CompositeExecutionOptions,
  ): Promise<NodeExecutionResult> => {
    const compositeNode = composite.nodes.find((n) => n.id === nodeId);
    if (!compositeNode) {
      throw new Error(`Node not found in composite: ${nodeId}`);
    }

    const node = nodeRegistry.get(compositeNode.type);
    if (!node) {
      throw new Error(`Node type not registered: ${compositeNode.type}`);
    }

    // Gather inputs from connected nodes
    const inputs = gatherNodeInputs(nodeId, composite, executionId);

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
  };

  const executeNodesInParallel = async (
    nodeIds: string[],
    composite: CompositeDefinition,
    executionId: string,
    options: CompositeExecutionOptions,
    results: Record<string, NodeExecutionResult>,
    times: Record<string, number>,
  ): Promise<void> => {
    const promises = nodeIds.map((nodeId) =>
      executionQueue.add(async () => {
        const startTime = performance.now();
        const result = await executeNode(
          nodeId,
          composite,
          executionId,
          options,
        );
        const endTime = performance.now();

        results[nodeId] = result;
        times[nodeId] = endTime - startTime;
      }),
    );

    await Promise.all(promises);
  };

  const executeNodeLevel = async (
    nodeIds: string[],
    composite: CompositeDefinition,
    executionId: string,
    options: CompositeExecutionOptions,
    results: Record<string, NodeExecutionResult>,
    times: Record<string, number>,
  ): Promise<void> => {
    for (const nodeId of nodeIds) {
      const startTime = performance.now();
      const result = await executeNode(nodeId, composite, executionId, options);
      const endTime = performance.now();

      results[nodeId] = result;
      times[nodeId] = endTime - startTime;

      if (!result.success) {
        throw new Error(`Node ${nodeId} failed: ${result.error}`);
      }
    }
  };

  const calculateCompositeOutputs = (
    composite: CompositeDefinition,
    nodeResults: Record<string, NodeExecutionResult>,
  ): Record<string, unknown> => {
    const outputs: Record<string, unknown> = {};

    // For now, collect all outputs from all nodes
    // In the future, this could be more sophisticated based on composite output definitions
    for (const [nodeId, result] of Object.entries(nodeResults)) {
      if (result.success && result.outputs) {
        Object.entries(result.outputs).forEach(([key, value]) => {
          outputs[`${nodeId}.${key}`] = value;
        });
      }
    }

    return outputs;
  };

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

    // Create execution context
    stateManager.createContext(executionId, composite.id);

    try {
      // Validate composite
      const validation = validateComposite(composite);
      if (!validation.valid) {
        throw new Error(
          `Composite validation failed: ${validation.errors.join(", ")}`,
        );
      }

      // Set initial inputs
      if (options.inputs) {
        Object.entries(options.inputs).forEach(([key, value]) => {
          stateManager.setData(executionId, key, value);
        });
      }

      stateManager.updateContext(executionId, {
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

      stateManager.updateContext(executionId, {
        status: result.success
          ? ("completed" as ExecutionStatus)
          : ("failed" as ExecutionStatus),
        endTime,
      });

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      stateManager.updateContext(executionId, {
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
