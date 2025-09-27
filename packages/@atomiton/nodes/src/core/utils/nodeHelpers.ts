/**
 * Node Helper Functions
 * Utility functions for working with node definitions
 *
 * NOTE: These helpers work with the new flat structure.
 * For legacy support, use the compatibility utils.
 */

import type {
  LegacyNodeDefinition,
  NodeDefinition,
} from "#core/types/definition";

/**
 * Check if a node has nodes (is a container/group/flow)
 * @deprecated Use FlatNodeRegistry.getChildren() for flat structure
 */
export const hasChildren = (node: LegacyNodeDefinition): boolean =>
  Boolean(node.nodes && node.nodes.length > 0);

/**
 * Check if a node is a leaf node (no contained nodes)
 * @deprecated Use FlatNodeRegistry.getChildren() for flat structure
 */
export const isLeafNode = (node: LegacyNodeDefinition): boolean =>
  !hasChildren(node);

/**
 * Get the node type from metadata (works with flat structure)
 */
export const getNodeType = (
  node: NodeDefinition | LegacyNodeDefinition,
): string => {
  if ("type" in node && typeof node.type === "string") {
    return node.type;
  }
  // Fallback for legacy nodes
  return (node as LegacyNodeDefinition).metadata?.type || "unknown";
};

/**
 * Check if a node has edges
 * @deprecated Edges are now managed separately in flat structure
 */
export const hasEdges = (node: LegacyNodeDefinition): boolean =>
  Boolean(node.edges && node.edges.length > 0);

/**
 * Get the total number of child nodes recursively
 * @deprecated Use FlatNodeRegistry.getDescendants() for flat structure
 */
export const getChildCount = (node: LegacyNodeDefinition): number => {
  if (!hasChildren(node)) {
    return 0;
  }

  let count = node.nodes!.length;
  for (const child of node.nodes!) {
    count += getChildCount(child);
  }

  return count;
};

/**
 * Check if a node is of a specific type (works with both formats)
 */
export const isNodeType = (
  node: NodeDefinition | LegacyNodeDefinition,
  type: string,
): boolean => {
  if ("type" in node && typeof node.type === "string") {
    return node.type === type;
  }
  // Fallback for legacy nodes
  return (node as LegacyNodeDefinition).metadata?.type === type;
};
