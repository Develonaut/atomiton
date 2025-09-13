/**
 * Atomic Node Package Registry - Single Source of Truth
 *
 * This file provides the atomic nodes API and registry.
 */

import { atomicAPI } from "./api";
export type { AtomicAPI } from "./api";
export type { NodeType } from "./registry";
export { AtomicRegistry } from "./registry";

// Export the default instance without initialization
// NodesAPI will handle initialization
export default atomicAPI;
