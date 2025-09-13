import type { CompositeNodeDefinition } from "../CompositeNode";
import type { JsonCompositeDefinition } from "./types";

export function toJson(
  composite: CompositeNodeDefinition,
): JsonCompositeDefinition {
  return {
    id: composite.id,
    name: composite.name,
    description: composite.description || "",
    category: composite.category,
    version: composite.version || "1.0.0",
    metadata: composite.metadata,
    nodes: composite.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position || { x: 0, y: 0 },
      data: node.config || {},
    })),
    edges: composite.edges.map((edge) => ({
      id: edge.id,
      source: edge.source.nodeId,
      target: edge.target.nodeId,
      sourceHandle: edge.source.portId,
      targetHandle: edge.target.portId,
      data: edge.data,
    })),
    variables: composite.variables,
    settings: composite.settings,
  };
}
