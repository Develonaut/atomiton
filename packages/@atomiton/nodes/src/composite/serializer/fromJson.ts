import type { CompositeNodeDefinition } from "../CompositeNode";
import type { JsonCompositeDefinition } from "./types";

export function fromJson(
  jsonData: JsonCompositeDefinition,
): CompositeNodeDefinition {
  // Build metadata object only with defined fields
  const metadata: CompositeNodeDefinition["metadata"] = {};
  if (jsonData.metadata) {
    if (jsonData.metadata.author !== undefined)
      metadata.author = jsonData.metadata.author;
    if (jsonData.metadata.tags !== undefined)
      metadata.tags = jsonData.metadata.tags;
    if (jsonData.metadata.icon !== undefined)
      metadata.icon = jsonData.metadata.icon;
    if (jsonData.metadata.created !== undefined)
      metadata.created = jsonData.metadata.created;
    if (jsonData.metadata.updated !== undefined)
      metadata.updated = jsonData.metadata.updated;
  }

  return {
    id: jsonData.id,
    name: jsonData.name,
    description: jsonData.description,
    category: jsonData.category,
    version: jsonData.version,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
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
