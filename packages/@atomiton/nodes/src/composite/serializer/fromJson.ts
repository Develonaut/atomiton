import type { CompositeNodeDefinition } from "../CompositeNode";
import type { JsonCompositeDefinition } from "./types";

export function fromJson(
  jsonData: JsonCompositeDefinition,
): CompositeNodeDefinition {
  return {
    id: jsonData.id,
    name: jsonData.name,
    description: jsonData.description,
    category: jsonData.category,
    version: jsonData.version,
    metadata: {
      author: jsonData.metadata?.author,
      tags: jsonData.metadata?.tags,
      icon: jsonData.metadata?.icon,
      created: jsonData.metadata?.created,
      updated: jsonData.metadata?.updated,
    },
    nodes: jsonData.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      config: node.data as Record<string, unknown>,
    })),
    edges: jsonData.edges.map((edge) => ({
      id: edge.id,
      source: {
        nodeId: edge.source,
        portId: edge.sourceHandle || "output",
      },
      target: {
        nodeId: edge.target,
        portId: edge.targetHandle || "input",
      },
      data: edge.data,
    })),
    variables: jsonData.variables,
    settings: jsonData.settings,
  };
}
