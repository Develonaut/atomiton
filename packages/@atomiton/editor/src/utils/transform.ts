import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import type {
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
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

export function flowToReactFlow(flow: NodeDefinition): TransformedFlow {
  const reactNodes = [];
  const reactEdges = [];

  if (flow.nodes) {
    reactNodes.push(
      ...flow.nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: {
          label: n.name || n.type,
          config: n.parameters || {},
          version: n.version,
          parentId: flow.id,
        },
      })),
    );
  }

  if (flow.edges) {
    reactEdges.push(
      ...flow.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        type: e.type || "smoothstep",
      })),
    );
  }

  return { nodes: reactNodes, edges: reactEdges };
}

export function reactFlowToFlow(
  reactNodes: ReactFlowNode<ReactFlowData>[],
  reactEdges: ReactFlowEdge[],
  baseFlow?: NodeDefinition,
): NodeDefinition {
  return createNodeDefinition({
    ...baseFlow,
    id: baseFlow?.id || `flow-${Date.now()}`,
    type: baseFlow?.type || "group",
    version: baseFlow?.version || "1.0.0",
    name: baseFlow?.name || "Untitled Flow",
    position: baseFlow?.position || { x: 0, y: 0 },
    nodes: reactNodes.map((n) =>
      createNodeDefinition({
        id: n.id,
        type: n.type || "default",
        version: n.data?.version || "1.0.0",
        name: n.data?.label || n.type || "Untitled",
        position: n.position,
        parentId: baseFlow?.id,
        metadata: {
          id: n.id,
          name: n.data?.label || n.type || "Untitled",
          author: "editor",
          icon: "settings",
          category: "user",
          description: "",
        },
        parameters: n.data?.config || {},
        inputPorts: [],
        outputPorts: [],
      }),
    ),
    edges: reactEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: edge.type === "smoothstep" ? "smoothstep" : "bezier",
    })),
  });
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
