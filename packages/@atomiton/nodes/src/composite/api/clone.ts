import type { CompositeNodeDefinition } from "../CompositeNode";
import { CompositeNode } from "../CompositeNode";

export function clone(
  composite: CompositeNode,
  newId?: string,
  newName?: string,
): CompositeNode {
  const definition = composite.getDefinition();
  const clonedDefinition: CompositeNodeDefinition = {
    ...definition,
    id: newId || `${definition.id}-copy`,
    name: newName || `${definition.name} (Copy)`,
    metadata: {
      ...definition.metadata,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    },
  };
  return new CompositeNode(clonedDefinition);
}
