import type { Flow, FlowNode } from "#types";
import { isNode } from "#guards";

export const addNode =
  (node: FlowNode) =>
  (flow: Flow): Flow => {
    if (!isNode(node)) {
      throw new Error("Invalid node provided to addNode");
    }

    // Check for duplicate ID
    if (flow.nodes.some((n) => n.id === node.id)) {
      throw new Error(`Node with ID ${node.id} already exists in flow`);
    }

    return {
      ...flow,
      nodes: [...flow.nodes, node],
      metadata: flow.metadata
        ? {
            ...flow.metadata,
            updatedAt: new Date(),
          }
        : undefined,
    };
  };

export const removeNode =
  (nodeId: string) =>
  (flow: Flow): Flow => {
    const nodeExists = flow.nodes.some((n) => n.id === nodeId);

    if (!nodeExists) {
      return flow; // No-op if node doesn't exist
    }

    return {
      ...flow,
      nodes: flow.nodes.filter((n) => n.id !== nodeId),
      // Remove edges involving this node
      edges: flow.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId,
      ),
      metadata: flow.metadata
        ? {
            ...flow.metadata,
            updatedAt: new Date(),
          }
        : undefined,
    };
  };

export const updateNode =
  (nodeId: string, updates: Partial<FlowNode>) =>
  (flow: Flow): Flow => {
    const nodeIndex = flow.nodes.findIndex((n) => n.id === nodeId);

    if (nodeIndex === -1) {
      throw new Error(`Node with ID ${nodeId} not found in flow`);
    }

    const updatedNodes = [...flow.nodes];
    updatedNodes[nodeIndex] = {
      ...updatedNodes[nodeIndex],
      ...updates,
      id: nodeId, // Ensure ID cannot be changed
    };

    return {
      ...flow,
      nodes: updatedNodes,
      metadata: flow.metadata
        ? {
            ...flow.metadata,
            updatedAt: new Date(),
          }
        : undefined,
    };
  };

export const mapNodes =
  <T>(fn: (node: FlowNode) => T) =>
  (flow: Flow): T[] => {
    return flow.nodes.map(fn);
  };

export const filterNodes =
  (predicate: (node: FlowNode) => boolean) =>
  (flow: Flow): FlowNode[] => {
    return flow.nodes.filter(predicate);
  };

export const findNode =
  (predicate: (node: FlowNode) => boolean) =>
  (flow: Flow): FlowNode | undefined => {
    return flow.nodes.find(predicate);
  };

export const getNodeById =
  (nodeId: string) =>
  (flow: Flow): FlowNode | undefined => {
    return flow.nodes.find((n) => n.id === nodeId);
  };
