import type { NodeDefinition } from "@atomiton/nodes/definitions";
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

/**
 * Parse Flow YAML content
 */
export function parseFlow(content: string): Flow {
  const parsed = parse(content) as Record<string, unknown>;

  // Handle nodes format
  if (parsed.nodes && Array.isArray(parsed.nodes)) {
    parsed.nodes = (parsed.nodes as unknown[]).map((node: unknown) => {
      const n = node as Record<string, unknown>;
      return {
        ...n,
        version: n.version || "1.0.0",
        parentId: n.parentId || undefined,
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
 * Convert Flow to YAML string
 */
export function toYaml(flow: Flow): string {
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

/**
 * Validate Flow YAML content
 * Returns true if the content can be parsed successfully
 */
export function validateFlowYaml(content: string): boolean {
  try {
    const flow = parseFlow(content);
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

