import type { NodeDefinition, NodeEdge } from "@atomiton/nodes/definitions";
import {
  createNodeDefinition,
  createNodeMetadata,
} from "@atomiton/nodes/definitions";
import { generateId } from "@atomiton/utils";
import type {
  Flow,
  FlowMetadata,
  ValidationResult,
  ExecutionContext,
  ExecutionResult,
} from "#types";

/**
 * Create a new flow using the factories from @atomiton/nodes
 *
 * A flow is just a node that contains other nodes
 */
export const createFlow = (params: {
  id?: string;
  name?: string;
  nodes?: NodeDefinition[];
  edges?: NodeEdge[];
  metadata?: Partial<FlowMetadata>;
}): Flow => {
  const now = new Date();

  // Create flow metadata (extending NodeMetadata)
  const metadata = createNodeMetadata({
    id: params.id || generateId(),
    name: params.name || "New Flow",
    type: "group", // Flows are group nodes
    category: "group",
    icon: "layers",
    description: "Flow container node",
    ...params.metadata,
  }) as FlowMetadata;

  // Add flow-specific metadata
  metadata.createdAt = metadata.createdAt || now;
  metadata.updatedAt = metadata.updatedAt || now;

  // Create the flow node using the universal factory
  return createNodeDefinition({
    id: params.id || generateId(),
    name: params.name || "New Flow",
    metadata,
    children: params.nodes,
    edges: params.edges,
    parameters: {
      schema: {},
      defaults: {},
      values: {},
      fields: {},
    },
    inputPorts: [],
    outputPorts: [],
  });
};

/**
 * Create an empty flow
 */
export const createEmptyFlow = (name: string = "New Flow"): Flow => {
  return createFlow({ name });
};

/**
 * Create a sequential flow from nodes
 */
export const createSequentialFlow = (
  name: string,
  nodes: NodeDefinition[],
): Flow => {
  const edges: NodeEdge[] = [];

  // Create edges between consecutive nodes
  for (let i = 0; i < nodes.length - 1; i++) {
    const sourceNode = nodes[i];
    const targetNode = nodes[i + 1];

    // Assume first output connects to first input
    const sourcePort = sourceNode.outputPorts?.[0];
    const targetPort = targetNode.inputPorts?.[0];

    if (sourcePort && targetPort) {
      edges.push({
        id: generateId(),
        source: sourceNode.id,
        target: targetNode.id,
        sourceHandle: sourcePort.id,
        targetHandle: targetPort.id,
        type: "bezier",
      });
    }
  }

  const metadata: Partial<FlowMetadata> = {
    entryNodeId: nodes[0]?.id,
    exitNodeIds: nodes.length > 0 ? [nodes[nodes.length - 1].id] : [],
  };

  return createFlow({
    name,
    nodes,
    edges,
    metadata,
  });
};

/**
 * Clone a flow with a new ID
 */
export const cloneFlow = (flow: Flow, newId?: string): Flow => {
  const now = new Date();
  const clonedNodes = flow.children?.map((node) => cloneNode(node)) || [];
  const clonedEdges = flow.edges?.map((edge) => cloneEdge(edge)) || [];

  return createFlow({
    id: newId || generateId(),
    name: `${flow.name} (Copy)`,
    nodes: clonedNodes,
    edges: clonedEdges,
    metadata: {
      ...flow.metadata,
      createdAt: now,
      updatedAt: now,
    } as Partial<FlowMetadata>,
  });
};

/**
 * Clone a node with a new ID
 */
export const cloneNode = (
  node: NodeDefinition,
  newId?: string,
): NodeDefinition => {
  return createNodeDefinition({
    ...node,
    id: newId || generateId(),
    children: node.children?.map((child) => cloneNode(child)),
    edges: node.edges?.map((edge) => cloneEdge(edge)),
  });
};

/**
 * Clone an edge with a new ID
 */
export const cloneEdge = (edge: NodeEdge, newId?: string): NodeEdge => {
  return {
    ...edge,
    id: newId || generateId(),
    data: edge.data ? { ...edge.data } : undefined,
  };
};

/**
 * Validate a flow
 */
export const validateFlow = (flow: Flow): ValidationResult => {
  const errors: string[] = [];

  // Check if flow has at least one node
  if (!flow.children || flow.children.length === 0) {
    errors.push("Flow must have at least one node");
  }

  // Validate edges reference existing nodes
  const nodeIds = new Set(flow.children?.map((n) => n.id) || []);
  flow.edges?.forEach((edge) => {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge references non-existent source: ${edge.source}`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge references non-existent target: ${edge.target}`);
    }
  });

  // Validate port connections
  flow.edges?.forEach((edge) => {
    const sourceNode = flow.children?.find((n) => n.id === edge.source);
    const targetNode = flow.children?.find((n) => n.id === edge.target);

    if (sourceNode && edge.sourceHandle) {
      const sourcePort = sourceNode.outputPorts.find(
        (p) => p.id === edge.sourceHandle,
      );
      if (!sourcePort) {
        errors.push(
          `Edge references non-existent source port: ${edge.sourceHandle} on node ${edge.source}`,
        );
      }
    }

    if (targetNode && edge.targetHandle) {
      const targetPort = targetNode.inputPorts.find(
        (p) => p.id === edge.targetHandle,
      );
      if (!targetPort) {
        errors.push(
          `Edge references non-existent target port: ${edge.targetHandle} on node ${edge.target}`,
        );
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
};

/**
 * Helper to create a simple execution context
 */
export const createExecutionContext = (
  flowId: string,
  input: unknown = {},
): ExecutionContext => {
  return {
    flowId,
    executionId: generateId(),
    variables: {},
    input,
    errors: [],
    startTime: new Date(),
    status: "pending",
  };
};

/**
 * Helper to create an execution result
 */
export const createExecutionResult = <T = unknown>(
  success: boolean,
  data?: T,
  error?: string,
): ExecutionResult<T> => {
  const result: ExecutionResult<T> = {
    success,
  };

  if (data !== undefined) {
    result.data = data;
  }

  if (error) {
    result.error = {
      message: error,
      timestamp: new Date(),
    };
  }

  return result;
};
