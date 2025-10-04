import type { NodeDefinition } from "#core/types/definition";
import { findCriticalPath } from "#graph/criticalPath";
import { findParallelBranches, topologicalSort } from "#graph/topologicalSort";
import { DEFAULT_NODE_WEIGHTS } from "#graph/weights";

export type GraphNode = {
  id: string;
  name: string;
  type: string;
  weight: number;
  dependencies: string[];
  dependents: string[];
  level: number;
};

export type ExecutionGraph = {
  nodes: Map<string, GraphNode>;
  totalWeight: number;
  criticalPath: string[];
  criticalPathWeight: number;
  maxParallelism: number;
  executionOrder: string[][];
};

// Re-export for convenience
export {
  DEFAULT_NODE_WEIGHTS,
  findCriticalPath,
  findParallelBranches,
  topologicalSort,
};

/**
 * Analyze the execution graph to extract metadata for progress tracking
 */
export function analyzeExecutionGraph(flow: NodeDefinition): ExecutionGraph {
  // Handle single nodes by creating a 1-node graph
  if (!flow.nodes || flow.nodes.length === 0) {
    const weight =
      DEFAULT_NODE_WEIGHTS[flow.type] || DEFAULT_NODE_WEIGHTS.default;
    const graphNodes = new Map<string, GraphNode>();
    graphNodes.set(flow.id, {
      id: flow.id,
      name: flow.name || flow.type,
      type: flow.type,
      weight,
      dependencies: [],
      dependents: [],
      level: 0,
    });

    return {
      nodes: graphNodes,
      totalWeight: weight,
      criticalPath: [flow.id],
      criticalPathWeight: weight,
      maxParallelism: 1,
      executionOrder: [[flow.id]],
    };
  }

  const nodes = flow.nodes;
  const edges = flow.edges || [];

  // Build adjacency maps
  const dependencyMap = new Map<string, string[]>();
  const dependentMap = new Map<string, string[]>();

  nodes.forEach((node) => {
    dependencyMap.set(node.id, []);
    dependentMap.set(node.id, []);
  });

  edges.forEach((edge) => {
    const deps = dependencyMap.get(edge.target) || [];
    deps.push(edge.source);
    dependencyMap.set(edge.target, deps);

    const dependents = dependentMap.get(edge.source) || [];
    dependents.push(edge.target);
    dependentMap.set(edge.source, dependents);
  });

  // Topological sort for execution order
  const executionOrder = topologicalSort(nodes, edges);

  // Find critical path
  const { path: criticalPath, weight: criticalPathWeight } = findCriticalPath(
    nodes,
    edges,
  );

  // Calculate max parallelism
  const maxParallelism = findParallelBranches(executionOrder);

  // Build graph nodes with metadata
  const graphNodes = new Map<string, GraphNode>();
  let totalWeight = 0;

  // Assign levels based on execution order
  const levelMap = new Map<string, number>();
  executionOrder.forEach((level, index) => {
    level.forEach((nodeId) => {
      levelMap.set(nodeId, index);
    });
  });

  nodes.forEach((node) => {
    const weight =
      DEFAULT_NODE_WEIGHTS[node.type] || DEFAULT_NODE_WEIGHTS.default;
    totalWeight += weight;

    graphNodes.set(node.id, {
      id: node.id,
      name: node.name || node.type,
      type: node.type,
      weight,
      dependencies: dependencyMap.get(node.id) || [],
      dependents: dependentMap.get(node.id) || [],
      level: levelMap.get(node.id) || 0,
    });
  });

  return {
    nodes: graphNodes,
    totalWeight,
    criticalPath,
    criticalPathWeight,
    maxParallelism,
    executionOrder,
  };
}
