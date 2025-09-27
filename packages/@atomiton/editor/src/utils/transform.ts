import type { Flow } from "@atomiton/flow";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import type {
  Node as ReactFlowNode,
  Edge as ReactFlowEdge,
} from "@xyflow/react";

export type ReactFlowData = {
  label?: string;
  config?: Record<string, unknown>;
  version?: string;
  parentId?: string;
} & Record<string, unknown>;

export type TransformedFlow = {
  nodes: ReactFlowNode<ReactFlowData>[];
  edges: ReactFlowEdge[];
};

export function flowToReactFlow(flow: Flow): TransformedFlow {
  const nodes = (flow.nodes || []).map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: {
      label: node.name || node.type,
      config: node.parameters.defaults || {},
      version: node.version,
      parentId: node.parentId,
    },
  }));

  const edges = (flow.edges || []).map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    type: edge.type || "smoothstep",
  }));

  return { nodes, edges };
}

export function reactFlowToFlow(
  nodes: ReactFlowNode<ReactFlowData>[],
  edges: ReactFlowEdge[],
  baseFlow?: Partial<Flow>,
): Flow {
  const flowNodes: NodeDefinition[] = nodes.map(
    (node) =>
      ({
        id: node.id,
        type: node.type || "default",
        version: node.data?.version || "1.0.0",
        name: node.data?.label || node.type || "Untitled",
        position: node.position,
        parentId: node.data?.parentId,
        metadata: {
          id: node.id,
          name: node.data?.label || node.type || "Untitled",
          author: "editor",
          icon: "default",
          category: "default",
          description: "",
        },
        parameters: {
          defaults: node.data?.config || {},
          fields: {},
        },
        inputPorts: [],
        outputPorts: [],
      }) as unknown as NodeDefinition,
  );

  const flowEdges = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    type: "smoothstep" as const,
  }));

  return {
    id: baseFlow?.id || `flow-${Date.now()}`,
    type: "flow",
    version: baseFlow?.version || "1.0.0",
    name: baseFlow?.name || "Untitled Flow",
    position: baseFlow?.position || { x: 0, y: 0 },
    metadata: {
      id: baseFlow?.id || `flow-${Date.now()}`,
      name: baseFlow?.name || "Untitled Flow",
      author: "editor",
      icon: "flow",
      category: "flow",
      description: "",
      ...baseFlow?.metadata,
    },
    parameters: baseFlow?.parameters || {
      defaults: {},
      fields: {},
    },
    inputPorts: baseFlow?.inputPorts || [],
    outputPorts: baseFlow?.outputPorts || [],
    nodes: flowNodes,
    edges: flowEdges,
  } as unknown as Flow;
}


export function findNodeById(
  nodes: NodeDefinition[],
  nodeId: string,
): NodeDefinition | undefined {
  return nodes.find((n) => n.id === nodeId);
}

export function getChildNodes(
  nodes: NodeDefinition[],
  parentId: string,
): NodeDefinition[] {
  return nodes.filter((n) => n.parentId === parentId);
}

export function getRootNodes(nodes: NodeDefinition[]): NodeDefinition[] {
  return nodes.filter((n) => !n.parentId);
}

export function isValidHierarchy(nodes: NodeDefinition[]): boolean {
  const nodeIds = new Set(nodes.map((n) => n.id));

  for (const node of nodes) {
    if (node.parentId && !nodeIds.has(node.parentId)) {
      return false;
    }

    if (node.parentId === node.id) {
      return false;
    }
  }

  const visited = new Set<string>();
  const visiting = new Set<string>();

  function hasCycle(nodeId: string): boolean {
    if (visiting.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;

    visiting.add(nodeId);

    const children = getChildNodes(nodes, nodeId);
    for (const child of children) {
      if (hasCycle(child.id)) return true;
    }

    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (hasCycle(node.id)) return false;
  }

  return true;
}
