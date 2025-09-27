import type { NodeDefinition } from "@atomiton/nodes/definitions";
import type { Flow, FlowMetadata } from "#types";
import { isNode } from "#guards";

export const addNode =
  (node: NodeDefinition) =>
  (flow: Flow): Flow => {
    if (!isNode(node)) {
      throw new Error("Invalid node provided to addNode");
    }

    // Check for duplicate ID
    if (flow.nodes?.some((n) => n.id === node.id)) {
      throw new Error(`Node with ID ${node.id} already exists in flow`);
    }

    return {
      ...flow,
      nodes: [...(flow.nodes || []), node],
      metadata: {
        ...flow.metadata,
        updatedAt: new Date(),
      } as FlowMetadata,
    };
  };

export const removeNode =
  (nodeId: string) =>
  (flow: Flow): Flow => {
    const nodeExists = flow.nodes?.some((n) => n.id === nodeId);

    if (!nodeExists) {
      return flow; // No-op if node doesn't exist
    }

    return {
      ...flow,
      nodes: flow.nodes?.filter((n) => n.id !== nodeId),
      // Remove edges involving this node
      edges: flow.edges?.filter(
        (e) => e.source !== nodeId && e.target !== nodeId,
      ),
      metadata: {
        ...flow.metadata,
        updatedAt: new Date(),
      } as FlowMetadata,
    };
  };

export const updateNode =
  (nodeId: string, updates: Partial<NodeDefinition>) =>
  (flow: Flow): Flow => {
    const nodeIndex = flow.nodes?.findIndex((n) => n.id === nodeId) ?? -1;

    if (nodeIndex === -1) {
      throw new Error(`Node with ID ${nodeId} not found in flow`);
    }

    const updatedNodes = [...(flow.nodes || [])];
    updatedNodes[nodeIndex] = {
      ...updatedNodes[nodeIndex],
      ...updates,
      id: nodeId, // Ensure ID cannot be changed
    };

    return {
      ...flow,
      nodes: updatedNodes,
      metadata: {
        ...flow.metadata,
        updatedAt: new Date(),
      } as FlowMetadata,
    };
  };

export const mapNodes =
  <T>(fn: (node: NodeDefinition) => T) =>
  (flow: Flow): T[] => {
    return flow.nodes?.map(fn) || [];
  };

export const filterNodes =
  (predicate: (node: NodeDefinition) => boolean) =>
  (flow: Flow): NodeDefinition[] => {
    return flow.nodes?.filter(predicate) || [];
  };

export const findNode =
  (predicate: (node: NodeDefinition) => boolean) =>
  (flow: Flow): NodeDefinition | undefined => {
    return flow.nodes?.find(predicate);
  };

export const getNodeById =
  (nodeId: string) =>
  (flow: Flow): NodeDefinition | undefined => {
    return flow.nodes?.find((n) => n.id === nodeId);
  };
