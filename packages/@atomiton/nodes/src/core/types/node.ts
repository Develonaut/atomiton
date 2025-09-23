import type { NodeDefinition } from './definition';
import type { NodeExecutable } from './executable';

/**
 * Complete Node Type
 * 
 * Combines both the static definition and dynamic executable logic
 * to represent a fully functional node.
 */
export type Node = NodeDefinition & NodeExecutable;