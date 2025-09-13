import type { CompositeNode } from "../CompositeNode";
import type { CompositeNodeDefinition } from "../CompositeNode";

export function compositeToDefinition(
  composite: CompositeNode,
): CompositeNodeDefinition {
  return composite.getDefinition();
}
