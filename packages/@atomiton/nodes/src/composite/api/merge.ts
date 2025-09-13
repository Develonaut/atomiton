import type { CompositeNodeDefinition } from "../CompositeNode";
import { CompositeNode } from "../CompositeNode";

export function merge(
  base: CompositeNode,
  overlay: CompositeNode,
): CompositeNode {
  const baseDefinition = base.getDefinition();
  const overlayDefinition = overlay.getDefinition();

  const mergedDefinition: CompositeNodeDefinition = {
    ...baseDefinition,
    nodes: [...baseDefinition.nodes, ...overlayDefinition.nodes],
    edges: [...baseDefinition.edges, ...overlayDefinition.edges],
    variables: {
      ...baseDefinition.variables,
      ...overlayDefinition.variables,
    },
    settings: { ...baseDefinition.settings, ...overlayDefinition.settings },
    metadata: {
      ...baseDefinition.metadata,
      updated: new Date().toISOString(),
    },
  };

  return new CompositeNode(mergedDefinition);
}
