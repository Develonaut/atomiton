/**
 * @atomiton/nodes - Main Package Exports
 *
 * This is the unified node library that solves the split logic problem
 * by co-locating each node's logic and UI while maintaining clean separation.
 */

// Type imports
import type { CSVParserNodePackageType } from "./nodes/csv-parser";
import type { NodePackageRegistry } from "./registry";

// Core node types (moved from @atomiton/core for self-containment)
export type {
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
  PortDefinition,
} from "./types";

// Core base classes and interfaces
export type {
  NodeLogic,
  NodePackage,
  NodePackageRegistryEntry,
  NodeTestSuite,
  NodeUIComponent,
  NodeUIProps,
} from "./base/NodePackage";

export { BaseNodeLogic } from "./base/BaseNodeLogic";
export { BaseNodePackage } from "./base/NodePackage";

export {
  CATEGORY_COLORS,
  createBaseNodeComponent,
  DRACULA_COLORS,
  renderNodeHandles,
  renderRunningAnimation,
  renderStatusBadge,
  STATUS_COLORS,
  useNodeUIState,
} from "./base/BaseNodeUI";

export type { BaseNodeUIProps } from "./base/BaseNodeUI";

// Registry system
export {
  autoDiscoverNodes,
  getGlobalRegistry,
  NodePackageDiscovery,
  NodePackageRegistry,
  resetGlobalRegistry,
} from "./registry";

export type { DiscoveryConfig, RegistryConfig } from "./registry";

// Built-in node packages
export { default as csvParserNode } from "./nodes/csv-parser";
export type { CSVParserNodePackageType } from "./nodes/csv-parser";

// Individual node component exports (for selective imports)
export {
  csvParserConfigSchema,
  CSVParserLogic,
  CSVParserUI,
} from "./nodes/csv-parser";
export type { CSVParserConfig } from "./nodes/csv-parser";

/**
 * All available node packages
 * This registry makes it easy to discover and import all nodes
 */
export const availableNodes = {
  "csv-parser": () => import("./nodes/csv-parser").then((m) => m.default),
  // Additional nodes will be added here automatically
  // 'json-parser': () => import('./nodes/json-parser').then(m => m.default),
  // 'file-reader': () => import('./nodes/file-reader').then(m => m.default),
} as const;

/**
 * Node package type map for type safety
 */
export type AvailableNodeTypes = {
  "csv-parser": CSVParserNodePackageType;
  // Additional type mappings will be added here
};

/**
 * Get a node package by ID with type safety
 */
export async function getNodePackage<T extends keyof AvailableNodeTypes>(
  nodeId: T,
): Promise<AvailableNodeTypes[T]> {
  const loader = availableNodes[nodeId];
  if (!loader) {
    throw new Error(`Node package '${nodeId}' not found`);
  }
  return loader() as Promise<AvailableNodeTypes[T]>;
}

/**
 * Get all available node package IDs
 */
export function getAvailableNodeIds(): Array<keyof AvailableNodeTypes> {
  return Object.keys(availableNodes) as Array<keyof AvailableNodeTypes>;
}

/**
 * Initialize the node registry with all available packages
 */
export async function initializeNodeRegistry(
  registry?: NodePackageRegistry,
): Promise<{
  registry: NodePackageRegistry;
  registered: number;
  errors: Array<{ nodeId: string; error: Error }>;
}> {
  const { getGlobalRegistry } = await import("./registry");
  const nodeRegistry = registry || getGlobalRegistry();

  const errors: Array<{ nodeId: string; error: Error }> = [];
  let registered = 0;

  // Register all available node packages
  for (const [nodeId, loader] of Object.entries(availableNodes)) {
    try {
      const nodePackage = await loader();
      await nodeRegistry.register(nodePackage);
      registered++;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      errors.push({ nodeId, error: err });
      console.error(`Failed to register node package '${nodeId}':`, err);
    }
  }

  nodeRegistry.markReady();

  return {
    registry: nodeRegistry,
    registered,
    errors,
  };
}

// Visualization adapters - NEW: Theme injection architecture
export * from "./adapters";

/**
 * Package version and metadata
 */
export const packageInfo = {
  name: "@atomiton/nodes",
  version: "1.0.0",
  description:
    "Unified node library for Atomiton Blueprint platform - combining logic and UI components",
} as const;
