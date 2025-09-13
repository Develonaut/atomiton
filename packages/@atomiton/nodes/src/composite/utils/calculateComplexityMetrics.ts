import type { CompositeNode } from "../CompositeNode";

export function calculateComplexityMetrics(composite: CompositeNode) {
  const childNodes = composite.getChildNodes();
  const edges = composite.getExecutionFlow();

  // Count different types of nodes
  const nodeTypeCounts = childNodes.reduce(
    (counts, node) => {
      counts[node.type] = (counts[node.type] || 0) + 1;
      return counts;
    },
    {} as Record<string, number>,
  );

  // Calculate depth for nested composites
  let maxDepth = 1;
  for (const childNode of childNodes) {
    if (childNode.isComposite()) {
      const childComposite = childNode as CompositeNode;
      const childMetrics = calculateComplexityMetrics(childComposite);
      maxDepth = Math.max(maxDepth, childMetrics.depth + 1);
    }
  }

  return {
    nodeCount: childNodes.length,
    edgeCount: edges.length,
    nodeTypes: Object.keys(nodeTypeCounts).length,
    nodeTypeCounts,
    depth: maxDepth,
    complexity: childNodes.length + edges.length * 0.5, // Simple complexity metric
  };
}
