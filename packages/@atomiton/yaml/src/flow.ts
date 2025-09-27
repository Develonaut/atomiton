import type {
  NodeDefinition,
  FlatNodeMetadata,
  NodeCategory,
  NodeIcon
} from "@atomiton/nodes/definitions";
import { parse, stringify } from "yaml";

// Flow is an alias for NodeDefinition
export type Flow = NodeDefinition;

// For backwards compatibility and clarity
export type FlowNode = NodeDefinition;
export type FlowEdge = {
  id: string;
  source: string;
  target: string;
};

export function parseFlowYaml(content: string): Flow {
  const parsed = parse(content) as Record<string, unknown>;

  // Handle both formats - flat nodes and edges
  if (parsed.nodes && Array.isArray(parsed.nodes)) {
    parsed.nodes = (parsed.nodes as unknown[]).map((node: unknown) => {
      const n = node as Record<string, unknown>;
      return {
        ...n,
        version: (n.version || (n.metadata as Record<string, unknown>)?.version || "1.0.0") as string,
        parentId: n.parentId || undefined,
        metadata: n.metadata
          ? {
              ...(n.metadata as Record<string, unknown>),
              version: undefined,
            }
          : undefined,
      };
    });
  }

  // Handle both connections and edges for backwards compatibility
  if (parsed.connections && Array.isArray(parsed.connections)) {
    parsed.edges = parsed.connections;
    delete parsed.connections;
  }

  return parsed as Flow;
}

export function flowToYaml(flow: Flow): string {
  const flatFlow: Record<string, unknown> = {
    ...flow,
    nodes: flow.nodes?.map((node: NodeDefinition) => ({
      id: node.id,
      type: node.type,
      version: node.version,
      parentId: node.parentId,
      position: node.position,
      parameters: node.parameters,
      name: node.name,
      metadata: node.metadata,
      inputPorts: node.inputPorts,
      outputPorts: node.outputPorts,
    })),
    edges: flow.edges,
  };

  return stringify(flatFlow, {
    lineWidth: -1,
  });
}

export function validateFlowYaml(content: string): boolean {
  try {
    const flow = parseFlowYaml(content);
    return (
      !flow.nodes ||
      flow.nodes.every(
        (node) =>
          typeof node.version === "string" &&
          (!node.parentId || typeof node.parentId === "string"),
      )
    );
  } catch {
    return false;
  }
}

type OldFlowNode = {
  id: string;
  type: string;
  version?: string;
  position?: { x: number; y: number };
  parameters?: Record<string, unknown>;
  name?: string;
  metadata?: Record<string, unknown> & { version?: string };
  children?: OldFlowNode[];
};

type OldFlow = {
  nodes: OldFlowNode[];
  edges?: FlowEdge[];
  [key: string]: unknown;
};

export function migrateNestedToFlat(oldFlow: OldFlow): Flow {
  const flatNodes: NodeDefinition[] = [];

  const flatten = (nodes: OldFlowNode[], parentId?: string) => {
    for (const node of nodes) {
      const { children, ...nodeWithoutChildren } = node;

      // Create proper metadata structure
      const metadata: FlatNodeMetadata = {
        id: node.id,
        name: node.name || node.id,
        author: (node.metadata?.author as string) || "Unknown",
        description: (node.metadata?.description as string) || "",
        category: (node.metadata?.category as NodeCategory) || "utility",
        icon: (node.metadata?.icon as NodeIcon) || "layers",
        ...(node.metadata && {
          authorId: node.metadata.authorId as string | undefined,
          source: node.metadata.source as FlatNodeMetadata["source"],
          keywords: node.metadata.keywords as string[] | undefined,
          tags: node.metadata.tags as string[] | undefined,
          runtime: node.metadata.runtime as FlatNodeMetadata["runtime"],
          experimental: node.metadata.experimental as boolean | undefined,
          deprecated: node.metadata.deprecated as boolean | undefined,
          documentationUrl: node.metadata.documentationUrl as string | undefined,
          examples: node.metadata.examples as FlatNodeMetadata["examples"],
        }),
      };

      flatNodes.push({
        ...nodeWithoutChildren,
        type: nodeWithoutChildren.type || "unknown",
        version: (node.version || (node.metadata?.version as string) || "1.0.0") as string,
        parentId: parentId || undefined,
        name: node.name || node.id,
        position: node.position || { x: 0, y: 0 },
        metadata,
        parameters: (node.parameters || {}) as NodeDefinition["parameters"],
        inputPorts: [],
        outputPorts: [],
      } as NodeDefinition);

      if (children && Array.isArray(children) && children.length > 0) {
        flatten(children, node.id);
      }
    }
  };

  flatten(oldFlow.nodes || []);

  // Create proper metadata for the flow itself
  const flowMetadata: FlatNodeMetadata = {
    id: (oldFlow as Record<string, unknown>).id as string || "flow",
    name: (oldFlow as Record<string, unknown>).name as string || "Unnamed Flow",
    author: (oldFlow as Record<string, unknown>).author as string || "Unknown",
    description: (oldFlow as Record<string, unknown>).description as string || "",
    category: "group",
    icon: "layers",
  };

  return {
    id: (oldFlow as Record<string, unknown>).id as string || "flow",
    type: (oldFlow as Record<string, unknown>).type as string || "flow",
    version: (oldFlow as Record<string, unknown>).version as string || "1.0.0",
    name: (oldFlow as Record<string, unknown>).name as string || "Unnamed Flow",
    position: { x: 0, y: 0 },
    metadata: flowMetadata,
    parameters: {} as NodeDefinition["parameters"],
    inputPorts: [],
    outputPorts: [],
    nodes: flatNodes,
    edges: oldFlow.edges || [],
  } as Flow;
}

type NestedNode = {
  children: NestedNode[];
} & NodeDefinition;

export function flatToNested(flow: Flow): OldFlow {
  const nodeMap = new Map<string, NestedNode>();
  const rootNodes: NestedNode[] = [];

  if (!flow.nodes) {
    return {
      ...flow,
      nodes: [],
    };
  }

  for (const node of flow.nodes) {
    const nodeWithChildren: NestedNode = { ...node, children: [] };
    nodeMap.set(node.id, nodeWithChildren);
  }

  for (const node of flow.nodes) {
    const currentNode = nodeMap.get(node.id);
    if (!currentNode) continue;

    if (node.parentId) {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        parent.children.push(currentNode);
      }
    } else {
      rootNodes.push(currentNode);
    }
  }

  const cleanNodes = (nodes: NestedNode[]): OldFlowNode[] => {
    return nodes.map((node) => {
      const { children, parentId, inputPorts, outputPorts, ...rest } = node;
      if (children && children.length > 0) {
        return {
          ...rest,
          children: cleanNodes(children),
        } as OldFlowNode;
      }
      return rest as OldFlowNode;
    });
  };

  return {
    ...flow,
    nodes: cleanNodes(rootNodes),
    edges: flow.edges as FlowEdge[],
  };
}