/**
 * CompositeExecutor - Orchestrates execution of composite nodes
 *
 * Handles the complex logic of executing multiple child nodes
 * according to their dependency graph and execution flow
 */

import type { CompositeEdge, INode } from "../base/INode";
import type { NodeExecutionContext, NodeExecutionResult } from "../types";

export type CompositeExecutionSettings = {
  timeout?: number;
  retries?: number;
  parallel?: boolean;
  maxConcurrency?: number;
};

export type CompositeExecutionResult = {
  success: boolean;
  nodeResults: Record<string, NodeExecutionResult>;
  executionOrder: string[];
  totalExecutionTime: number;
  error?: string;
};

/**
 * CompositeExecutor - Executes composite nodes with dependency resolution
 */
export class CompositeExecutor {
  /**
   * Execute a collection of nodes according to their edges/dependencies
   */
  async execute(
    nodes: INode[],
    edges: CompositeEdge[],
    context: NodeExecutionContext,
    settings: CompositeExecutionSettings = {},
  ): Promise<CompositeExecutionResult> {
    const startTime = Date.now();
    const nodeResults: Record<string, NodeExecutionResult> = {};
    const executionOrder: string[] = [];

    try {
      // Build dependency graph
      const dependencyGraph = this.buildDependencyGraph(nodes, edges);

      // Determine execution order using topological sort
      const sortedNodes = this.topologicalSort(nodes, dependencyGraph);

      if (settings.parallel) {
        // Execute in parallel where possible
        await this.executeParallel(
          sortedNodes,
          dependencyGraph,
          context,
          nodeResults,
          executionOrder,
          settings,
        );
      } else {
        // Execute sequentially
        await this.executeSequential(
          sortedNodes,
          context,
          nodeResults,
          executionOrder,
        );
      }

      const totalExecutionTime = Date.now() - startTime;

      return {
        success: true,
        nodeResults,
        executionOrder,
        totalExecutionTime,
      };
    } catch (error) {
      const totalExecutionTime = Date.now() - startTime;

      return {
        success: false,
        nodeResults,
        executionOrder,
        totalExecutionTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Build dependency graph from edges
   */
  private buildDependencyGraph(
    nodes: INode[],
    edges: CompositeEdge[],
  ): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    // Initialize all nodes in graph
    for (const node of nodes) {
      graph.set(node.id, []);
    }

    // Add dependencies from edges
    for (const edge of edges) {
      const dependencies = graph.get(edge.target.nodeId) || [];
      dependencies.push(edge.source.nodeId);
      graph.set(edge.target.nodeId, dependencies);
    }

    return graph;
  }

  /**
   * Topological sort to determine execution order
   */
  private topologicalSort(
    nodes: INode[],
    dependencyGraph: Map<string, string[]>,
  ): INode[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: INode[] = [];
    const nodeMap = new Map<string, INode>();

    // Create node lookup map
    for (const node of nodes) {
      nodeMap.set(node.id, node);
    }

    const visit = (nodeId: string): void => {
      if (visiting.has(nodeId)) {
        throw new Error(
          `Circular dependency detected involving node: ${nodeId}`,
        );
      }

      if (visited.has(nodeId)) {
        return;
      }

      visiting.add(nodeId);

      // Visit all dependencies first
      const dependencies = dependencyGraph.get(nodeId) || [];
      for (const depId of dependencies) {
        visit(depId);
      }

      visiting.delete(nodeId);
      visited.add(nodeId);

      const node = nodeMap.get(nodeId);
      if (node) {
        result.push(node);
      }
    };

    // Visit all nodes
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        visit(node.id);
      }
    }

    return result;
  }

  /**
   * Execute nodes sequentially
   */
  private async executeSequential(
    sortedNodes: INode[],
    context: NodeExecutionContext,
    nodeResults: Record<string, NodeExecutionResult>,
    executionOrder: string[],
  ): Promise<void> {
    for (const node of sortedNodes) {
      // Create context with previous results
      const nodeContext = this.createNodeContext(context, nodeResults);

      // Execute the node
      const result = await node.execute(nodeContext);

      // Store result
      nodeResults[node.id] = result;
      executionOrder.push(node.id);

      // Stop execution if node failed and error handling is strict
      if (!result.success && context.stopOnError !== false) {
        throw new Error(`Node ${node.id} failed: ${result.error}`);
      }
    }
  }

  /**
   * Execute nodes in parallel where dependencies allow
   */
  private async executeParallel(
    sortedNodes: INode[],
    dependencyGraph: Map<string, string[]>,
    context: NodeExecutionContext,
    nodeResults: Record<string, NodeExecutionResult>,
    executionOrder: string[],
    settings: CompositeExecutionSettings,
  ): Promise<void> {
    const completed = new Set<string>();
    const executing = new Map<string, Promise<void>>();
    const maxConcurrency = settings.maxConcurrency || 5;

    const canExecute = (nodeId: string): boolean => {
      const dependencies = dependencyGraph.get(nodeId) || [];
      return dependencies.every((depId) => completed.has(depId));
    };

    const executeNode = async (node: INode): Promise<void> => {
      const nodeContext = this.createNodeContext(context, nodeResults);
      const result = await node.execute(nodeContext);

      nodeResults[node.id] = result;
      executionOrder.push(node.id);
      completed.add(node.id);

      if (!result.success && context.stopOnError !== false) {
        throw new Error(`Node ${node.id} failed: ${result.error}`);
      }
    };

    // Execute nodes as their dependencies are satisfied
    const nodeQueue = [...sortedNodes];

    while (nodeQueue.length > 0 || executing.size > 0) {
      // Start new executions if possible
      while (executing.size < maxConcurrency && nodeQueue.length > 0) {
        const nodeIndex = nodeQueue.findIndex((node) => canExecute(node.id));

        if (nodeIndex === -1) {
          break; // No nodes ready to execute
        }

        const node = nodeQueue.splice(nodeIndex, 1)[0];
        const execution = executeNode(node);
        executing.set(node.id, execution);
      }

      // Wait for at least one execution to complete
      if (executing.size > 0) {
        await Promise.race(executing.values());

        // Clean up completed executions
        for (const [nodeId] of executing) {
          if (completed.has(nodeId)) {
            executing.delete(nodeId);
          }
        }
      }
    }
  }

  /**
   * Create execution context for a node with access to previous results
   */
  private createNodeContext(
    baseContext: NodeExecutionContext,
    previousResults: Record<string, NodeExecutionResult>,
  ): NodeExecutionContext {
    return {
      ...baseContext,
      previousResults,
      // Add any additional context transformation here
    };
  }
}
