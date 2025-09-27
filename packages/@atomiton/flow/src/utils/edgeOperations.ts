import type { Flow, Edge } from "#types";
import { createEdge } from "#factories";

export const addEdge =
  (edge: Edge) =>
  (flow: Flow): Flow => {
    // Validate nodes exist
    const sourceNodeExists = flow.nodes.some((n) => n.id === edge.source);
    const targetNodeExists = flow.nodes.some((n) => n.id === edge.target);

    if (!sourceNodeExists) {
      throw new Error(`Source node ${edge.source} not found in flow`);
    }
    if (!targetNodeExists) {
      throw new Error(`Target node ${edge.target} not found in flow`);
    }

    // Check for duplicate edge
    const isDuplicate = flow.edges.some(
      (e) =>
        e.source === edge.source &&
        e.sourceHandle === edge.sourceHandle &&
        e.target === edge.target &&
        e.targetHandle === edge.targetHandle,
    );

    if (isDuplicate) {
      return flow; // No-op if edge already exists
    }

    return {
      ...flow,
      edges: [...flow.edges, edge],
      metadata: flow.metadata
        ? {
            ...flow.metadata,
            updatedAt: new Date(),
          }
        : undefined,
    };
  };

export const removeEdge =
  (edgeId: string) =>
  (flow: Flow): Flow => {
    return {
      ...flow,
      edges: flow.edges.filter((e) => e.id !== edgeId),
      metadata: flow.metadata
        ? {
            ...flow.metadata,
            updatedAt: new Date(),
          }
        : undefined,
    };
  };

export const connectNodes =
  (
    sourceNodeId: string,
    sourcePortId: string,
    targetNodeId: string,
    targetPortId: string,
  ) =>
  (flow: Flow): Flow => {
    const edge = createEdge({
      source: sourceNodeId,
      target: targetNodeId,
      sourceHandle: sourcePortId,
      targetHandle: targetPortId,
    });

    return addEdge(edge)(flow);
  };

export const getIncomingEdges = (nodeId: string, flow: Flow): Edge[] => {
  return flow.edges.filter((e) => e.target === nodeId);
};

export const getOutgoingEdges = (nodeId: string, flow: Flow): Edge[] => {
  return flow.edges.filter((e) => e.source === nodeId);
};
