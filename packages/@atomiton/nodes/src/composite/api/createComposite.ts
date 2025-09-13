import type { CompositeNodeDefinition } from "../CompositeNode";
import { CompositeNode } from "../CompositeNode";

export function create(
  id: string,
  name: string,
  category: string = "user-defined",
): CompositeNode {
  const definition: CompositeNodeDefinition = {
    id,
    name,
    category,
    version: "1.0.0",
    nodes: [],
    edges: [],
    metadata: {
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    },
  };
  return new CompositeNode(definition);
}
