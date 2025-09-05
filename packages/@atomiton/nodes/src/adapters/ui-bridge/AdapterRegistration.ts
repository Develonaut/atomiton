/**
 * Adapter Registration - Phase 2 UI Architecture Extension
 *
 * This module handles the registration of all node UI adapters with the global
 * registry system. It provides both automatic registration for built-in adapters
 * and a flexible system for registering custom adapters.
 *
 * ARCHITECTURAL BENEFITS:
 * - Centralized adapter registration
 * - Automatic discovery of core node types
 * - Type-safe adapter factory methods
 * - Prevents circular dependencies in registration
 * - Extensible for custom node types
 */

import { createBaseNodeUIAdapter } from "./BaseNodeUIAdapter";
import { createCSVParserUIAdapter } from "./CSVParserUIAdapter";
import { createDataNodeUIAdapter } from "./DataNodeUIAdapter";
import { createIONodeUIAdapter } from "./IONodeUIAdapter";
import {
  nodeUIAdapterRegistry,
  type NodeUIAdapter,
  type UINodeConfig,
} from "./NodeUIAdapter";
import { createProcessingNodeUIAdapter } from "./ProcessingNodeUIAdapter";

/**
 * Registry of node type patterns to adapter factories
 * This allows automatic adapter selection based on node characteristics
 */
interface AdapterFactoryEntry {
  nodeTypePattern: string | RegExp;
  category?: string;
  factory: (nodeDefinition: unknown) => NodeUIAdapter<UINodeConfig>;
  priority: number; // Higher number = higher priority
}

/**
 * Built-in adapter factories organized by priority and pattern matching
 */
const BUILT_IN_ADAPTER_FACTORIES: AdapterFactoryEntry[] = [
  // Specific node implementations (highest priority)
  {
    nodeTypePattern: "csv-parser",
    category: "data",
    factory: createCSVParserUIAdapter,
    priority: 100,
  },

  // Category-based adapters (medium priority)
  {
    nodeTypePattern: /.*data.*/i,
    category: "data",
    factory: createDataNodeUIAdapter,
    priority: 50,
  },

  {
    nodeTypePattern: /.*io.*/i,
    category: "io",
    factory: createIONodeUIAdapter,
    priority: 50,
  },

  {
    nodeTypePattern: /.*processing.*/i,
    category: "processing",
    factory: createProcessingNodeUIAdapter,
    priority: 50,
  },

  // Generic fallback adapter (lowest priority)
  {
    nodeTypePattern: /.*/,
    factory: createBaseNodeUIAdapter,
    priority: 1,
  },
];

/**
 * Register all built-in adapters with the global registry
 * This function should be called once during application initialization
 */
export function registerBuiltInUIAdapters(): void {
  // Register CSV Parser specifically
  nodeUIAdapterRegistry.register("csv-parser", createCSVParserUIAdapter);

  // Register base node types by category
  nodeUIAdapterRegistry.register("base-node", () =>
    createBaseNodeUIAdapter(undefined),
  );
  nodeUIAdapterRegistry.register("data-node", () =>
    createDataNodeUIAdapter(undefined),
  );
  nodeUIAdapterRegistry.register("io-node", () =>
    createIONodeUIAdapter(undefined),
  );
  nodeUIAdapterRegistry.register("processing-node", () =>
    createProcessingNodeUIAdapter(undefined),
  );
}

/**
 * Smart adapter selection based on node definition
 * Automatically chooses the best adapter for a given node
 */
export function selectAdapterForNode(
  nodeDefinition: unknown,
): NodeUIAdapter<UINodeConfig> | null {
  const definition = nodeDefinition as {
    id?: string;
    name?: string;
    category?: string;
    nodeType?: string;
  };

  // Try exact node ID match first
  if (definition.id && nodeUIAdapterRegistry.has(definition.id)) {
    return nodeUIAdapterRegistry.get(definition.id);
  }

  // Try node type match
  if (definition.nodeType && nodeUIAdapterRegistry.has(definition.nodeType)) {
    return nodeUIAdapterRegistry.get(definition.nodeType);
  }

  // Use pattern matching to find best adapter
  const candidates = BUILT_IN_ADAPTER_FACTORIES.map((entry) => ({
    ...entry,
    score: calculateMatchScore(definition, entry),
  }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score);

  if (candidates.length > 0) {
    const bestMatch = candidates[0];
    // Debug: Selected adapter for node ${definition.id}

    return bestMatch.factory(nodeDefinition);
  }

  return null;
}

/**
 * Register a custom adapter for a specific node type
 */
export function registerCustomAdapter(
  nodeType: string,
  adapterFactory: () => NodeUIAdapter<UINodeConfig>,
): void {
  nodeUIAdapterRegistry.register(nodeType, adapterFactory);
}

/**
 * Register multiple custom adapters at once
 */
export function registerCustomAdapters(
  adapters: Record<string, () => NodeUIAdapter<UINodeConfig>>,
): void {
  Object.entries(adapters).forEach(([nodeType, factory]) => {
    registerCustomAdapter(nodeType, factory);
  });
}

/**
 * Get information about all registered adapters
 */
export function getAdapterRegistryInfo(): {
  totalRegistered: number;
  registeredTypes: string[];
  builtInFactories: number;
} {
  return {
    totalRegistered: nodeUIAdapterRegistry.getRegisteredTypes().length,
    registeredTypes: nodeUIAdapterRegistry.getRegisteredTypes(),
    builtInFactories: BUILT_IN_ADAPTER_FACTORIES.length,
  };
}

/**
 * Clear all registered adapters (useful for testing)
 */
export function clearAdapterRegistry(): void {
  const types = nodeUIAdapterRegistry.getRegisteredTypes();
  console.warn(`Clearing ${types.length} registered adapters`);
  // Note: The registry doesn't have a clear method, so we'd need to add one
  // or this function serves as documentation for manual clearing
}

/**
 * Calculate match score for node definition against adapter factory entry
 */
function calculateMatchScore(
  definition: {
    id?: string;
    name?: string;
    category?: string;
    nodeType?: string;
  },
  entry: AdapterFactoryEntry,
): number {
  let score = entry.priority;

  // Check pattern match against various node properties
  const testStrings = [
    definition.id,
    definition.name,
    definition.category,
    definition.nodeType,
  ].filter(Boolean) as string[];

  let hasMatch = false;

  for (const testString of testStrings) {
    if (typeof entry.nodeTypePattern === "string") {
      if (testString === entry.nodeTypePattern) {
        score += 100; // Exact match bonus
        hasMatch = true;
      } else if (testString.includes(entry.nodeTypePattern)) {
        score += 25; // Partial match bonus
        hasMatch = true;
      }
    } else if (entry.nodeTypePattern instanceof RegExp) {
      if (entry.nodeTypePattern.test(testString)) {
        score += 50; // Regex match bonus
        hasMatch = true;
      }
    }
  }

  // Category match bonus
  if (entry.category && definition.category === entry.category) {
    score += 30;
    hasMatch = true;
  }

  return hasMatch ? score : 0;
}

/**
 * Validate that a node definition has the minimum required properties
 */
export function validateNodeDefinition(nodeDefinition: unknown): boolean {
  const definition = nodeDefinition as {
    id?: string;
    name?: string;
    version?: string;
  };

  return !!(definition.id && definition.name && definition.version);
}

/**
 * Helper to create adapter factory function with validation
 */
export function createAdapterFactory<T>(
  factory: (nodeDefinition: unknown) => T,
): (nodeDefinition: unknown) => T {
  return (nodeDefinition: unknown) => {
    if (!validateNodeDefinition(nodeDefinition)) {
      throw new Error(
        "Invalid node definition: missing required properties (id, name, version)",
      );
    }

    return factory(nodeDefinition);
  };
}

/**
 * Export adapter registry for direct access if needed
 */
export { nodeUIAdapterRegistry as adapterRegistry };

/**
 * Default initialization function - call this to set up all built-in adapters
 */
export function initializeAdapterSystem(): void {
  registerBuiltInUIAdapters();
}
