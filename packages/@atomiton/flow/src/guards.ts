import type { NodeDefinition, NodeEdge } from "@atomiton/nodes/definitions";
import type { Flow } from "#types";

/**
 * Check if a node is a flow (has children nodes)
 */
export const isFlow = (node: unknown): node is Flow => {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const n = node as NodeDefinition;
  // A flow is a node with children
  return Boolean(
    n.children && Array.isArray(n.children) && n.children.length > 0,
  );
};

/**
 * Check if an object is a Node
 */
export const isNode = (value: unknown): value is NodeDefinition => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const node = value as Record<string, unknown>;
  return (
    "id" in node &&
    "name" in node &&
    "position" in node &&
    "metadata" in node &&
    "parameters" in node &&
    "inputPorts" in node &&
    "outputPorts" in node &&
    typeof node.id === "string" &&
    typeof node.name === "string" &&
    typeof node.position === "object" &&
    node.position !== null &&
    "x" in node.position &&
    "y" in node.position &&
    typeof (node.position as Record<string, unknown>).x === "number" &&
    typeof (node.position as Record<string, unknown>).y === "number" &&
    typeof node.metadata === "object" &&
    typeof node.parameters === "object" &&
    Array.isArray(node.inputPorts) &&
    Array.isArray(node.outputPorts)
  );
};

/**
 * Check if an object is a NodeEdge
 */
export const isEdge = (value: unknown): value is NodeEdge => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const edge = value as Record<string, unknown>;
  return (
    "id" in edge &&
    "source" in edge &&
    "target" in edge &&
    typeof edge.id === "string" &&
    typeof edge.source === "string" &&
    typeof edge.target === "string"
  );
};

/**
 * Check if a flow is valid (has valid nodes and edges)
 */
export const isValidFlow = (flow: Flow): boolean => {
  // Check all nodes are valid
  if (flow.children && !flow.children.every(isNode)) {
    return false;
  }

  // Check all edges are valid
  if (flow.edges && !flow.edges.every(isEdge)) {
    return false;
  }

  // Check all edge endpoints exist
  const nodeIds = new Set(flow.children?.map((n) => n.id) || []);

  if (flow.edges) {
    for (const edge of flow.edges) {
      if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Check if a node has inputs
 */
export const hasInputs = (node: NodeDefinition): boolean => {
  return Array.isArray(node.inputPorts) && node.inputPorts.length > 0;
};

/**
 * Check if a node has outputs
 */
export const hasOutputs = (node: NodeDefinition): boolean => {
  return Array.isArray(node.outputPorts) && node.outputPorts.length > 0;
};

/**
 * Check if a flow is empty (no nodes)
 */
export const isEmptyFlow = (flow: Flow): boolean => {
  return !flow.children || flow.children.length === 0;
};

/**
 * Check if a flow has cycles
 */
export const hasCycles = (flow: Flow): boolean => {
  if (!flow.children || !flow.edges) {
    return false;
  }

  const adjacencyList: Map<string, string[]> = new Map();

  // Build adjacency list
  flow.children.forEach((node) => {
    adjacencyList.set(node.id, []);
  });

  flow.edges.forEach((edge) => {
    const sourceList = adjacencyList.get(edge.source) || [];
    sourceList.push(edge.target);
    adjacencyList.set(edge.source, sourceList);
  });

  // DFS to detect cycles
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const hasCycleDFS = (nodeId: string): boolean => {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycleDFS(neighbor)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  };

  // Check each unvisited node
  for (const nodeId of adjacencyList.keys()) {
    if (!visited.has(nodeId)) {
      if (hasCycleDFS(nodeId)) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Check if a node is an entry node (has no incoming edges)
 */
export const isEntryNode = (nodeId: string, flow: Flow): boolean => {
  if (!flow.edges) {
    return true; // If no edges, all nodes are entry nodes
  }
  return !flow.edges.some((edge) => edge.target === nodeId);
};

/**
 * Check if a node is an exit node (has no outgoing edges)
 */
export const isExitNode = (nodeId: string, flow: Flow): boolean => {
  if (!flow.edges) {
    return true; // If no edges, all nodes are exit nodes
  }
  return !flow.edges.some((edge) => edge.source === nodeId);
};
