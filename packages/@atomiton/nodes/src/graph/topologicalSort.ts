import type { NodeDefinition } from "#core/types/definition";

/**
 * Topological sort to determine execution order
 * Returns array of arrays, where each inner array is a level that can execute in parallel
 */
export function topologicalSort(
  nodes: NodeDefinition[],
  edges: NonNullable<NodeDefinition["edges"]>,
): string[][] {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  // Initialize structures
  nodes.forEach((node) => {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  });

  // Build adjacency and in-degree
  edges.forEach((edge) => {
    const current = inDegree.get(edge.target) || 0;
    inDegree.set(edge.target, current + 1);

    const neighbors = adjacency.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacency.set(edge.source, neighbors);
  });

  // Process nodes level by level
  const levels: string[][] = [];
  const processed = new Set<string>();

  while (processed.size < nodes.length) {
    const currentLevel: string[] = [];

    // Find all nodes with no remaining dependencies
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0 && !processed.has(nodeId)) {
        currentLevel.push(nodeId);
      }
    });

    if (currentLevel.length === 0) {
      throw new Error("Cycle detected in node graph");
    }

    // Process current level
    currentLevel.forEach((nodeId) => {
      processed.add(nodeId);
      inDegree.delete(nodeId);

      // Reduce in-degree for dependents
      const neighbors = adjacency.get(nodeId) || [];
      neighbors.forEach((neighbor) => {
        const degree = inDegree.get(neighbor);
        if (degree !== undefined) {
          inDegree.set(neighbor, degree - 1);
        }
      });
    });

    levels.push(currentLevel);
  }

  return levels;
}

/**
 * Find parallel branches in the execution graph
 * Returns the maximum number of nodes that can execute concurrently
 */
export function findParallelBranches(executionOrder: string[][]): number {
  return Math.max(...executionOrder.map((level) => level.length), 1);
}
