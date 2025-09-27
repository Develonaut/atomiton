/**
 * Node Helper Functions
 * Utility functions for working with node definitions
 */

import type { NodeDefinition } from "#core/types/definition";

/**
 * Get the node type (from top-level type field)
 */
export const getNodeType = (node: NodeDefinition): string => node.type;

/**
 * Check if a node is of a specific type
 */
export const isNodeType = (node: NodeDefinition, type: string): boolean =>
  node.type === type;
