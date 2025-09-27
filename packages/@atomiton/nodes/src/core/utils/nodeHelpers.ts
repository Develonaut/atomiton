/**
 * Node Helper Functions
 * Utility functions for working with node definitions
 */

import type { NodeDefinition } from "#core/types/definition";

/**
 * Check if a node has nodes (is a container/group/flow)
 */
export const hasChildren = (node: NodeDefinition): boolean =>
  Boolean(node.nodes && node.nodes.length > 0);

/**
 * Check if a node is a leaf node (no contained nodes)
 */
export const isLeafNode = (node: NodeDefinition): boolean => !hasChildren(node);

/**
 * Get the node type from metadata
 */
export const getNodeType = (node: NodeDefinition): string => node.metadata.type;

/**
 * Check if a node has edges
 */
export const hasEdges = (node: NodeDefinition): boolean =>
  Boolean(node.edges && node.edges.length > 0);

/**
 * Get the total number of child nodes recursively
 */
export const getChildCount = (node: NodeDefinition): number => {
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
 * Check if a node is of a specific type
 */
export const isNodeType = (node: NodeDefinition, type: string): boolean =>
  node.metadata.type === type;
