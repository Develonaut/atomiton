/**
 * Blueprint Runner - Orchestrates multi-node Blueprint execution with dependency resolution
 */

import type { INode } from "@atomiton/nodes";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
} from "@atomiton/nodes";
import type { StateManager } from "../state/StateManager.js";
import type { NodeExecutor } from "./NodeExecutor.js";
import PQueue from "p-queue";

export type BlueprintNode = {
  id: string;
  type: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
};

export type BlueprintConnection = {
  id: string;
  sourceNodeId: string;
  sourcePort: string;
  targetNodeId: string;
  targetPort: string;
};

export type Blueprint = {
  id: string;
  name: string;
  description?: string;
  nodes: BlueprintNode[];
  connections: BlueprintConnection[];
  metadata?: Record<string, unknown>;
};

export type BlueprintExecutionOptions = {
  maxConcurrency?: number;
  enableParallelExecution?: boolean;
  timeoutMs?: number;
  workspaceRoot?: string;
  inputs?: Record<string, unknown>;
};

export type BlueprintExecutionResult = {
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

export class BlueprintRunner {
  private nodeRegistry = new Map<string, INode>();
  private executionQueue: PQueue;

  constructor(
    private stateManager: StateManager,
    private nodeExecutor: NodeExecutor,
    options: { maxConcurrency?: number } = {},
  ) {
    this.executionQueue = new PQueue({
      concurrency: options.maxConcurrency || 4,
    });
  }

  registerNode(nodeType: string, node: INode): void {
    this.nodeRegistry.set(nodeType, node);
  }

  async executeBlueprint(
    blueprint: Blueprint,
    options: BlueprintExecutionOptions = {},
  ): Promise<BlueprintExecutionResult> {
    const executionId = `execution-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const startTime = new Date();

    // Create execution context
    const context = this.stateManager.createContext(executionId, blueprint.id);

    try {
      // Validate blueprint
      const validation = this.validateBlueprint(blueprint);
      if (!validation.valid) {
        throw new Error(
          `Blueprint validation failed: ${validation.errors.join(", ")}`,
        );
      }

      // Set initial inputs
      if (options.inputs) {
        Object.entries(options.inputs).forEach(([key, value]) => {
          this.stateManager.setData(executionId, key, value);
        });
      }

      this.stateManager.updateContext(executionId, {
        state: "running",
        metadata: { blueprint, options },
      });

      // Build execution graph
      const executionGraph = this.buildExecutionGraph(blueprint);

      // Execute nodes in dependency order
      const nodeResults: Record<string, NodeExecutionResult> = {};
      const executionTimes: Record<string, number> = {};

      if (
        options.enableParallelExecution &&
        executionGraph.parallelizable.length > 0
      ) {
        // Execute parallelizable nodes
        await this.executeNodesInParallel(
          executionGraph.parallelizable,
          blueprint,
          executionId,
          options,
          nodeResults,
          executionTimes,
        );
      }

      // Execute sequential nodes
      for (const nodeLevel of executionGraph.sequential) {
        await this.executeNodeLevel(
          nodeLevel,
          blueprint,
          executionId,
          options,
          nodeResults,
          executionTimes,
        );
      }

      const endTime = new Date();
      const totalExecutionTime = endTime.getTime() - startTime.getTime();

      // Calculate final outputs
      const outputs = this.calculateBlueprintOutputs(blueprint, nodeResults);

      // Calculate metrics
      const nodesExecuted = Object.keys(nodeResults).length;
      const nodesSucceeded = Object.values(nodeResults).filter(
        (r) => r.success,
      ).length;
      const nodesFailed = nodesExecuted - nodesSucceeded;

      const result: BlueprintExecutionResult = {
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

      this.stateManager.updateContext(executionId, {
        state: result.success ? "completed" : "failed",
        endTime,
        data: { ...context.data, outputs },
      });

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.stateManager.updateContext(executionId, {
        state: "failed",
        endTime: new Date(),
        error: errorMessage,
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
  }

  private validateBlueprint(blueprint: Blueprint): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check for required fields
    if (!blueprint.id) errors.push("Blueprint ID is required");
    if (!blueprint.name) errors.push("Blueprint name is required");
    if (!blueprint.nodes || blueprint.nodes.length === 0) {
      errors.push("Blueprint must have at least one node");
    }

    // Validate node types exist
    for (const node of blueprint.nodes) {
      if (!this.nodeRegistry.has(node.type)) {
        errors.push(`Unknown node type: ${node.type}`);
      }
    }

    // Validate connections
    for (const connection of blueprint.connections) {
      const sourceNode = blueprint.nodes.find(
        (n) => n.id === connection.sourceNodeId,
      );
      const targetNode = blueprint.nodes.find(
        (n) => n.id === connection.targetNodeId,
      );

      if (!sourceNode) {
        errors.push(
          `Connection references unknown source node: ${connection.sourceNodeId}`,
        );
      }
      if (!targetNode) {
        errors.push(
          `Connection references unknown target node: ${connection.targetNodeId}`,
        );
      }
    }

    // Check for circular dependencies
    if (this.hasCircularDependencies(blueprint)) {
      errors.push("Blueprint contains circular dependencies");
    }

    return { valid: errors.length === 0, errors };
  }

  private buildExecutionGraph(blueprint: Blueprint): {
    sequential: string[][];
    parallelizable: string[];
  } {
    const nodeIds = blueprint.nodes.map((n) => n.id);
    const dependencies = new Map<string, Set<string>>();

    // Build dependency map
    nodeIds.forEach((nodeId) => dependencies.set(nodeId, new Set()));

    for (const connection of blueprint.connections) {
      const deps = dependencies.get(connection.targetNodeId);
      if (deps) {
        deps.add(connection.sourceNodeId);
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
        throw new Error("Circular dependency detected in blueprint");
      }

      sequential.push(ready);
      ready.forEach((id) => remaining.delete(id));
    }

    return { sequential, parallelizable };
  }

  private async executeNodesInParallel(
    nodeIds: string[],
    blueprint: Blueprint,
    executionId: string,
    options: BlueprintExecutionOptions,
    results: Record<string, NodeExecutionResult>,
    times: Record<string, number>,
  ): Promise<void> {
    const promises = nodeIds.map((nodeId) =>
      this.executionQueue.add(async () => {
        const startTime = performance.now();
        const result = await this.executeNode(
          nodeId,
          blueprint,
          executionId,
          options,
        );
        const endTime = performance.now();

        results[nodeId] = result;
        times[nodeId] = endTime - startTime;
      }),
    );

    await Promise.all(promises);
  }

  private async executeNodeLevel(
    nodeIds: string[],
    blueprint: Blueprint,
    executionId: string,
    options: BlueprintExecutionOptions,
    results: Record<string, NodeExecutionResult>,
    times: Record<string, number>,
  ): Promise<void> {
    for (const nodeId of nodeIds) {
      const startTime = performance.now();
      const result = await this.executeNode(
        nodeId,
        blueprint,
        executionId,
        options,
      );
      const endTime = performance.now();

      results[nodeId] = result;
      times[nodeId] = endTime - startTime;

      if (!result.success) {
        throw new Error(`Node ${nodeId} failed: ${result.error}`);
      }
    }
  }

  private async executeNode(
    nodeId: string,
    blueprint: Blueprint,
    executionId: string,
    options: BlueprintExecutionOptions,
  ): Promise<NodeExecutionResult> {
    const blueprintNode = blueprint.nodes.find((n) => n.id === nodeId);
    if (!blueprintNode) {
      throw new Error(`Node not found in blueprint: ${nodeId}`);
    }

    const node = this.nodeRegistry.get(blueprintNode.type);
    if (!node) {
      throw new Error(`Node type not registered: ${blueprintNode.type}`);
    }

    // Gather inputs from connected nodes
    const inputs = this.gatherNodeInputs(nodeId, blueprint, executionId);

    const context: NodeExecutionContext = {
      nodeId,
      blueprintId: blueprint.id,
      inputs,
      config: blueprintNode.config,
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
        debug: (msg, data) => console.warn(`[${nodeId}]`, msg, data),
        info: (msg, data) => console.warn(`[${nodeId}]`, msg, data),
        warn: (msg, data) => console.warn(`[${nodeId}]`, msg, data),
        error: (msg, data) => console.error(`[${nodeId}]`, msg, data),
      },
    };

    return this.nodeExecutor.executeNode(node, context, executionId);
  }

  private gatherNodeInputs(
    nodeId: string,
    blueprint: Blueprint,
    executionId: string,
  ): Record<string, unknown> {
    const inputs: Record<string, unknown> = {};

    // Find all connections that target this node
    const incomingConnections = blueprint.connections.filter(
      (conn) => conn.targetNodeId === nodeId,
    );

    for (const connection of incomingConnections) {
      const sourceNodeState =
        this.stateManager.getContext(executionId)?.nodeStates[
          connection.sourceNodeId
        ];

      if (sourceNodeState?.outputs) {
        const outputValue = sourceNodeState.outputs[connection.sourcePort];
        inputs[connection.targetPort] = outputValue;
      }
    }

    return inputs;
  }

  private calculateBlueprintOutputs(
    blueprint: Blueprint,
    nodeResults: Record<string, NodeExecutionResult>,
  ): Record<string, unknown> {
    const outputs: Record<string, unknown> = {};

    // For now, collect all outputs from all nodes
    // In the future, this could be more sophisticated based on blueprint output definitions
    for (const [nodeId, result] of Object.entries(nodeResults)) {
      if (result.success && result.outputs) {
        Object.entries(result.outputs).forEach(([key, value]) => {
          outputs[`${nodeId}.${key}`] = value;
        });
      }
    }

    return outputs;
  }

  private hasCircularDependencies(blueprint: Blueprint): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      // Find all nodes that depend on this node
      const dependents = blueprint.connections
        .filter((conn) => conn.sourceNodeId === nodeId)
        .map((conn) => conn.targetNodeId);

      for (const dependent of dependents) {
        if (hasCycle(dependent)) return true;
      }

      recursionStack.delete(nodeId);
      return false;
    };

    return blueprint.nodes.some((node) => hasCycle(node.id));
  }
}
