import type { NodeDefinition } from "#core/types/definition";
import { DEFAULT_NODE_WEIGHTS } from "#graph/weights";

/**
 * Find the critical path (longest path) through the graph
 * Critical path determines minimum execution time
 */
export function findCriticalPath(
  nodes: NodeDefinition[],
  edges: NonNullable<NodeDefinition["edges"]>,
): { path: string[]; weight: number } {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Initialize structures
  nodes.forEach((node) => {
    adjacency.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  // Build adjacency
  edges.forEach((edge) => {
    const neighbors = adjacency.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacency.set(edge.source, neighbors);

    const degree = inDegree.get(edge.target) || 0;
    inDegree.set(edge.target, degree + 1);
  });

  // Track longest path to each node
  const distances = new Map<string, number>();
  const paths = new Map<string, string[]>();

  nodes.forEach((node) => {
    const weight =
      DEFAULT_NODE_WEIGHTS[node.type] || DEFAULT_NODE_WEIGHTS.default;
    distances.set(node.id, weight);
    paths.set(node.id, [node.id]);
  });

  // Process nodes in topological order
  const queue: string[] = [];
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDistance = distances.get(current) || 0;
    const currentPath = paths.get(current) || [];

    const neighbors = adjacency.get(current) || [];
    neighbors.forEach((neighbor) => {
      const neighborNode = nodeMap.get(neighbor);
      const neighborWeight = neighborNode
        ? DEFAULT_NODE_WEIGHTS[neighborNode.type] ||
          DEFAULT_NODE_WEIGHTS.default
        : DEFAULT_NODE_WEIGHTS.default;

      const newDistance = currentDistance + neighborWeight;
      const existingDistance = distances.get(neighbor) || 0;

      if (newDistance > existingDistance) {
        distances.set(neighbor, newDistance);
        paths.set(neighbor, [...currentPath, neighbor]);
      }

      const degree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, degree);

      if (degree === 0) {
        queue.push(neighbor);
      }
    });
  }

  // Find the longest path
  let maxDistance = 0;
  let criticalPath: string[] = [];

  distances.forEach((distance, nodeId) => {
    if (distance > maxDistance) {
      maxDistance = distance;
      criticalPath = paths.get(nodeId) || [];
    }
  });

  return { path: criticalPath, weight: maxDistance };
}
