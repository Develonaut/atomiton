import type { NodeDefinition } from "@atomiton/nodes/definitions";
import type { Flow, FlowMetadata } from "#types";
import { pipe } from "#utils/functionalCore";

export const getConnectedNodes = (
  nodeId: string,
  flow: Flow,
): NodeDefinition[] => {
  const connectedNodeIds = new Set<string>();

  // Find nodes this node connects to
  flow.edges
    ?.filter((e) => e.source === nodeId)
    .forEach((e) => connectedNodeIds.add(e.target));

  // Find nodes that connect to this node
  flow.edges
    ?.filter((e) => e.target === nodeId)
    .forEach((e) => connectedNodeIds.add(e.source));

  return flow.nodes?.filter((n) => connectedNodeIds.has(n.id)) || [];
};

export const clearEdges = (flow: Flow): Flow => {
  return {
    ...flow,
    edges: [],
    metadata: {
      ...flow.metadata,
      updatedAt: new Date(),
    } as FlowMetadata,
  };
};

export const clearNodes = (flow: Flow): Flow => {
  return {
    ...flow,
    nodes: [],
    edges: [],
    metadata: {
      ...flow.metadata,
      updatedAt: new Date(),
    } as FlowMetadata,
  };
};

export const transformFlow = (
  flow: Flow,
  ...transformations: Array<(flow: Flow) => Flow>
): Flow => {
  return pipe(...transformations)(flow);
};

export const getTopologicalOrder = (flow: Flow): NodeDefinition[] => {
  if (!flow.nodes || flow.nodes.length === 0) {
    return [];
  }

  const inDegree = new Map<string, number>();
  const adjacencyList = new Map<string, string[]>();

  // Initialize
  flow.nodes.forEach((node) => {
    inDegree.set(node.id, 0);
    adjacencyList.set(node.id, []);
  });

  // Build graph
  flow.edges?.forEach((edge) => {
    const sourceList = adjacencyList.get(edge.source) || [];
    sourceList.push(edge.target);
    adjacencyList.set(edge.source, sourceList);

    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  // Find nodes with no incoming edges
  const queue: string[] = [];
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });

  const result: NodeDefinition[] = [];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = flow.nodes.find((n) => n.id === nodeId);

    if (node) {
      result.push(node);
    }

    // Reduce in-degree of neighbors
    const neighbors = adjacencyList.get(nodeId) || [];
    neighbors.forEach((neighborId) => {
      const newDegree = (inDegree.get(neighborId) || 0) - 1;
      inDegree.set(neighborId, newDegree);

      if (newDegree === 0) {
        queue.push(neighborId);
      }
    });
  }

  // If not all nodes are included, there's a cycle
  if (result.length !== flow.nodes.length) {
    throw new Error("Flow contains cycles and cannot be topologically sorted");
  }

  return result;
};
