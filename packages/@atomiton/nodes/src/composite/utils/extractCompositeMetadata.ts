import type { CompositeNode } from "../CompositeNode";

export function extractCompositeMetadata(composite: CompositeNode) {
  const metadata = composite.metadata;
  const childNodes = composite.getChildNodes();

  return {
    id: composite.id,
    name: composite.name,
    type: composite.type,
    category: metadata.category,
    description: metadata.description,
    version: metadata.version,
    author: metadata.author,
    tags: metadata.tags,
    childNodeCount: childNodes.length,
    childNodeTypes: childNodes.map((node) => node.type),
    executionFlowCount: composite.getExecutionFlow().length,
  };
}
