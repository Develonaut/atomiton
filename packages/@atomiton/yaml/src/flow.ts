import type {
  NodeDefinition,
  FlatNodeMetadata,
  NodeCategory,
  NodeIcon,
} from "@atomiton/nodes/definitions";
import { parse, stringify } from "yaml";

// Define migration function type to avoid circular dependency
type FlowMigrationFunction = (flow: Record<string, unknown>) => Record<string, unknown>;
type DetectionFunction = (nodes?: unknown[]) => string;
type VersionFunction = (flow: Record<string, unknown>) => number;
type NeedsMigrationFunction = (flow: Record<string, unknown>) => boolean;

// Migration utilities will be injected at runtime to avoid circular dependencies
let migrateFlowImpl: FlowMigrationFunction | undefined;
let detectNodeStructureImpl: DetectionFunction | undefined;
let getFlowSchemaVersionImpl: VersionFunction | undefined;
let needsMigrationImpl: NeedsMigrationFunction | undefined;

/**
 * Register migration utilities to avoid circular dependency
 * This should be called once at application startup
 */
export function registerMigrationUtilities(utilities: {
  migrateFlow: FlowMigrationFunction;
  detectNodeStructure: DetectionFunction;
  getFlowSchemaVersion: VersionFunction;
  needsMigration: NeedsMigrationFunction;
}) {
  migrateFlowImpl = utilities.migrateFlow;
  detectNodeStructureImpl = utilities.detectNodeStructure;
  getFlowSchemaVersionImpl = utilities.getFlowSchemaVersion;
  needsMigrationImpl = utilities.needsMigration;
}

// Helper functions that use the registered implementations
function migrateFlow(flow: Record<string, unknown>): Record<string, unknown> {
  if (!migrateFlowImpl) {
    console.warn("Migration utilities not registered, returning flow unchanged");
    return flow;
  }
  return migrateFlowImpl(flow);
}

function detectNodeStructure(nodes?: unknown[]): string {
  if (!detectNodeStructureImpl) {
    return "unknown";
  }
  return detectNodeStructureImpl(nodes);
}

function getFlowSchemaVersion(flow: Record<string, unknown>): number {
  if (!getFlowSchemaVersionImpl) {
    return 0;
  }
  return getFlowSchemaVersionImpl(flow);
}

function needsMigration(flow: Record<string, unknown>): boolean {
  if (!needsMigrationImpl) {
    return false;
  }
  return needsMigrationImpl(flow);
}

// Flow is an alias for NodeDefinition
export type Flow = NodeDefinition;

// Flow type alias for compatibility
export type FlowWithMigration = NodeDefinition;

// For backwards compatibility and clarity
export type FlowNode = NodeDefinition;
export type FlowEdge = {
  id: string;
  source: string;
  target: string;
};

/**
 * Parse Flow YAML content with automatic migration
 * This function applies migrations if migration utilities are registered
 */
export function parseFlowYaml(content: string): FlowWithMigration {
  const parsed = parse(content) as Record<string, unknown>;

  // Apply migrations if utilities are registered
  if (migrateFlowImpl && needsMigrationImpl) {
    const shouldMigrate = needsMigration(parsed);
    if (shouldMigrate) {
      const originalStructure = detectNodeStructure(parsed.nodes as unknown[]);
      const originalVersion = getFlowSchemaVersion(parsed);
      const migratedFlow = migrateFlow(parsed);
      console.log(
        `Flow migrated from v${originalVersion} (${originalStructure}) to v${migratedFlow.schemaVersion} (flat)`,
      );
      return migratedFlow as unknown as FlowWithMigration;
    }
  }

  // Fallback to legacy parsing if no migration utilities registered
  return parseFlowYamlLegacy(content) as FlowWithMigration;
}

/**
 * Legacy parseFlowYaml for backwards compatibility
 * @deprecated Use parseFlowYaml instead
 */
export function parseFlowYamlLegacy(content: string): Flow {
  const parsed = parse(content) as Record<string, unknown>;

  // Handle both formats - flat nodes and edges
  if (parsed.nodes && Array.isArray(parsed.nodes)) {
    parsed.nodes = (parsed.nodes as unknown[]).map((node: unknown) => {
      const n = node as Record<string, unknown>;
      return {
        ...n,
        version: (n.version ||
          (n.metadata as Record<string, unknown>)?.version ||
          "1.0.0") as string,
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

/**
 * Convert Flow to YAML string with automatic migration
 * Ensures the flow is migrated before stringifying if migration utilities are available
 */
export function flowToYaml(flow: Flow | FlowWithMigration): string {
  let processedFlow = flow;

  // Apply migration if utilities are available
  if (migrateFlowImpl) {
    processedFlow = migrateFlow(flow as Record<string, unknown>) as unknown as (Flow | FlowWithMigration);
  }

  const flatFlow: Record<string, unknown> = {
    ...processedFlow,
    nodes: processedFlow.nodes?.map((node: NodeDefinition) => ({
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
    edges: processedFlow.edges,
  };

  return stringify(flatFlow, {
    lineWidth: -1,
  });
}

/**
 * Validate Flow YAML content
 * Returns true if the content can be parsed successfully
 */
export function validateFlowYaml(content: string): boolean {
  try {
    const flow = parseFlowYaml(content);
    return (
      (!flow.nodes ||
        flow.nodes.every(
          (node) =>
            typeof node.version === "string" &&
            (!node.parentId || typeof node.parentId === "string"),
        ))
    );
  } catch {
    return false;
  }
}

/**
 * Check if Flow YAML content needs migration
 */
export function flowYamlNeedsMigration(content: string): boolean {
  try {
    if (needsMigrationImpl) {
      const parsed = parse(content) as Record<string, unknown>;
      return needsMigration(parsed);
    }
    return false;
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
          documentationUrl: node.metadata.documentationUrl as
            | string
            | undefined,
          examples: node.metadata.examples as FlatNodeMetadata["examples"],
        }),
      };

      flatNodes.push({
        ...nodeWithoutChildren,
        type: nodeWithoutChildren.type || "unknown",
        version: (node.version ||
          (node.metadata?.version as string) ||
          "1.0.0") as string,
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
    id: ((oldFlow as Record<string, unknown>).id as string) || "flow",
    name:
      ((oldFlow as Record<string, unknown>).name as string) || "Unnamed Flow",
    author:
      ((oldFlow as Record<string, unknown>).author as string) || "Unknown",
    description:
      ((oldFlow as Record<string, unknown>).description as string) || "",
    category: "group",
    icon: "layers",
  };

  return {
    id: ((oldFlow as Record<string, unknown>).id as string) || "flow",
    type: ((oldFlow as Record<string, unknown>).type as string) || "flow",
    version:
      ((oldFlow as Record<string, unknown>).version as string) || "1.0.0",
    name:
      ((oldFlow as Record<string, unknown>).name as string) || "Unnamed Flow",
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
