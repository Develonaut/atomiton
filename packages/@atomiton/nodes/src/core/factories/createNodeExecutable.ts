/**
 * Factory function for creating node executable logic
 *
 * Simplified to just return the executable directly.
 * Nodes handle their own validation internally.
 */

import type { NodeExecutable } from "#core/types/executable";

export function createNodeExecutable(
  executable: NodeExecutable,
): NodeExecutable {
  // Simple pass-through - nodes handle their own validation
  return executable;
}

export default createNodeExecutable;
