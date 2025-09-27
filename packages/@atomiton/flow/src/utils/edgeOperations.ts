import type { NodeEdge } from "@atomiton/nodes/definitions";
import type { Flow, FlowMetadata } from "#types";
import { generateId } from "@atomiton/utils";

export const addEdge =
  (edge: NodeEdge) =>
  (flow: Flow): Flow => {
    // Validate nodes exist
    const sourceNodeExists = flow.children?.some((n) => n.id === edge.source);
    const targetNodeExists = flow.children?.some((n) => n.id === edge.target);

    if (!sourceNodeExists) {
      throw new Error(`Source node ${edge.source} not found in flow`);
    }
    if (!targetNodeExists) {
      throw new Error(`Target node ${edge.target} not found in flow`);
    }

    // Check for duplicate edge
    const isDuplicate = flow.edges?.some(
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
      edges: [...(flow.edges || []), edge],
      metadata: {
        ...flow.metadata,
        updatedAt: new Date(),
      } as FlowMetadata,
    };
  };

export const removeEdge =
  (edgeId: string) =>
  (flow: Flow): Flow => {
    return {
      ...flow,
      edges: flow.edges?.filter((e) => e.id !== edgeId),
      metadata: {
        ...flow.metadata,
        updatedAt: new Date(),
      } as FlowMetadata,
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
    const edge: NodeEdge = {
      id: generateId(),
      source: sourceNodeId,
      target: targetNodeId,
      sourceHandle: sourcePortId,
      targetHandle: targetPortId,
      type: "bezier",
    };

    return addEdge(edge)(flow);
  };

export const getIncomingEdges = (nodeId: string, flow: Flow): NodeEdge[] => {
  return flow.edges?.filter((e) => e.target === nodeId) || [];
};

export const getOutgoingEdges = (nodeId: string, flow: Flow): NodeEdge[] => {
  return flow.edges?.filter((e) => e.source === nodeId) || [];
};
