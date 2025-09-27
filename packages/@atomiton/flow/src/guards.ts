import type { Edge, Executable, Flow, FlowNode } from "#types";

/**
 * Check if an object is an Executable
 */
export const isExecutable = (value: unknown): value is Executable => {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "type" in value &&
    "version" in value &&
    typeof (value as Record<string, unknown>).id === "string" &&
    typeof (value as Record<string, unknown>).type === "string" &&
    typeof (value as Record<string, unknown>).version === "string"
  );
};

/**
 * Check if an executable is a Flow
 */
export const isFlow = (value: unknown): value is Flow => {
  if (!isExecutable(value)) {
    return false;
  }

  const flow = value as Record<string, unknown>;
  return (
    flow.type === "flow" &&
    "label" in flow &&
    "nodes" in flow &&
    "edges" in flow &&
    typeof flow.label === "string" &&
    Array.isArray(flow.nodes) &&
    Array.isArray(flow.edges)
  );
};

/**
 * Check if an executable is a FlowNode
 */
export const isNode = (value: unknown): value is FlowNode => {
  if (!isExecutable(value)) {
    return false;
  }

  const node = value as Record<string, unknown>;
  return (
    node.type !== "flow" && // A node is any executable that is not a flow
    "label" in node &&
    "position" in node &&
    "config" in node &&
    typeof node.label === "string" &&
    typeof node.position === "object" &&
    node.position !== null &&
    "x" in node.position &&
    "y" in node.position &&
    typeof node.position.x === "number" &&
    typeof node.position.y === "number" &&
    typeof node.config === "object"
  );
};

/**
 * Check if an object is an Edge
 */
export const isEdge = (value: unknown): value is Edge => {
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
  if (!flow.nodes.every(isNode)) {
    return false;
  }

  // Check all edges are valid
  if (!flow.edges.every(isEdge)) {
    return false;
  }

  // Check all edge endpoints exist
  const nodeIds = new Set(flow.nodes.map((n) => n.id));

  for (const edge of flow.edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      return false;
    }
  }

  return true;
};

/**
 * Check if a node has inputs
 */
export const hasInputs = (node: FlowNode): boolean => {
  return Array.isArray(node.inputs) && node.inputs.length > 0;
};

/**
 * Check if a node has outputs
 */
export const hasOutputs = (node: FlowNode): boolean => {
  return Array.isArray(node.outputs) && node.outputs.length > 0;
};

/**
 * Check if a flow is empty (no nodes)
 */
export const isEmptyFlow = (flow: Flow): boolean => {
  return flow.nodes.length === 0;
};

/**
 * Check if a flow has cycles
 */
export const hasCycles = (flow: Flow): boolean => {
  const adjacencyList: Map<string, string[]> = new Map();

  // Build adjacency list
  flow.nodes.forEach((node) => {
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
  return !flow.edges.some((edge) => edge.target === nodeId);
};

/**
 * Check if a node is an exit node (has no outgoing edges)
 */
export const isExitNode = (nodeId: string, flow: Flow): boolean => {
  return !flow.edges.some((edge) => edge.source === nodeId);
};
