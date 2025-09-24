import type { NodeDefinition } from "#core/types/definition";
import type { NodeExecutable } from "#core/types/executable";

/**
 * Complete Node Type
 *
 * Combines both the static definition and dynamic executable logic
 * to represent a fully functional node.
 */
export type Node = NodeDefinition & NodeExecutable;
