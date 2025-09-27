import type {
  Flow,
  FlowNode,
  Edge,
  CreateFlowOptions,
  CreateNodeOptions,
  CreateEdgeOptions,
  FlowMetadata,
  ExecutableMetadata,
} from "#types";

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const createDefaultMetadata = (
  partial?: Partial<ExecutableMetadata>,
): ExecutableMetadata => {
  const now = new Date();
  return {
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
};

export const createFlow = (options: CreateFlowOptions): Flow => {
  const now = new Date();

  const defaultMetadata: FlowMetadata = {
    createdAt: now,
    updatedAt: now,
    version: options.version || "1.0.0",
    ...options.metadata,
  };

  return {
    id: options.id || generateId(),
    type: "flow",
    version: options.version || "1.0.0",
    label: options.label,
    nodes: options.nodes || [],
    edges: options.edges || [],
    variables: options.variables || {},
    metadata: defaultMetadata,
  };
};

export const createNode = (options: CreateNodeOptions): FlowNode => {
  return {
    id: options.id || generateId(),
    type: options.type,
    version: options.version || "1.0.0",
    label: options.label,
    position: options.position,
    config: options.config || {},
    inputs: options.inputs,
    outputs: options.outputs,
    metadata: createDefaultMetadata(options.metadata),
  };
};

export const createEdge = (options: CreateEdgeOptions): Edge => {
  return {
    id: options.id || generateId(),
    source: options.source,
    target: options.target,
    type: options.type,
    sourceHandle: options.sourceHandle,
    targetHandle: options.targetHandle,
    animated: options.animated,
    hidden: options.hidden,
    selected: options.selected,
    data: options.data,
    markerStart: options.markerStart,
    markerEnd: options.markerEnd,
    style: options.style,
    label: options.label,
  };
};

export const createFlowFromNodes = (
  label: string,
  nodes: FlowNode[],
  edges: Edge[],
  options?: Partial<CreateFlowOptions>,
): Flow => {
  return createFlow({
    ...options,
    label,
    nodes,
    edges,
  });
};

export const cloneFlow = (flow: Flow, newId?: string): Flow => {
  const now = new Date();
  return {
    ...flow,
    id: newId || generateId(),
    nodes: flow.nodes.map((node) => cloneNode(node)),
    edges: flow.edges.map((edge) => cloneEdge(edge)),
    metadata: flow.metadata
      ? {
          ...flow.metadata,
          createdAt: now,
          updatedAt: now,
        }
      : undefined,
  };
};

export const cloneNode = (node: FlowNode, newId?: string): FlowNode => {
  const now = new Date();
  return {
    ...node,
    id: newId || generateId(),
    config: { ...node.config },
    metadata: node.metadata
      ? {
          ...node.metadata,
          createdAt: now,
          updatedAt: now,
        }
      : undefined,
  };
};

export const cloneEdge = (edge: Edge, newId?: string): Edge => {
  return {
    ...edge,
    id: newId || generateId(),
    data: edge.data ? { ...edge.data } : undefined,
    style: edge.style ? { ...edge.style } : undefined,
    markerStart: edge.markerStart ? { ...edge.markerStart } : undefined,
    markerEnd: edge.markerEnd ? { ...edge.markerEnd } : undefined,
  };
};

export const createEmptyFlow = (label: string = "New Flow"): Flow => {
  return createFlow({ label });
};

export const createSequentialFlow = (
  label: string,
  nodes: FlowNode[],
): Flow => {
  const edges: Edge[] = [];

  // Create edges between consecutive nodes
  for (let i = 0; i < nodes.length - 1; i++) {
    const sourceNode = nodes[i];
    const targetNode = nodes[i + 1];

    // Assume first output connects to first input
    const sourcePort = sourceNode.outputs?.[0];
    const targetPort = targetNode.inputs?.[0];

    if (sourcePort && targetPort) {
      edges.push(
        createEdge({
          source: sourceNode.id,
          target: targetNode.id,
          sourceHandle: sourcePort.id,
          targetHandle: targetPort.id,
        }),
      );
    }
  }

  return createFlow({
    label,
    nodes,
    edges,
    metadata: {
      entryNodeId: nodes[0]?.id,
      exitNodeIds: nodes.length > 0 ? [nodes[nodes.length - 1].id] : [],
    },
  });
};
