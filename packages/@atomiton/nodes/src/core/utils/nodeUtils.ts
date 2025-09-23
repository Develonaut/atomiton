/**
 * Node Utility Functions
 * Common utilities for working with nodes
 */

import type { NodeDefinition } from '../types/definition';

/**
 * Type guard to check if a node is atomic
 */
export function isAtomicNode(node: NodeDefinition): boolean {
  return node.type === 'atomic';
}

/**
 * Type guard to check if a node has children (composite behavior)
 */
export function isCompositeNode(node: NodeDefinition): boolean {
  return node.type === 'composite';
}

/**
 * Type guard to check if a node has children
 */
export function hasChildren(node: NodeDefinition): boolean {
  return Array.isArray(node.children) && node.children.length > 0;
}

/**
 * Type guard to check if a node has edges
 */
export function hasEdges(node: NodeDefinition): boolean {
  return Array.isArray(node.edges) && node.edges.length > 0;
}