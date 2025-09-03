/**
 * Built-in Adapter Registration
 *
 * This module handles registration of all built-in UI adapters.
 * It's separate from NodeUIAdapter.ts to avoid circular dependencies.
 */

import { CSVParserUIAdapter } from "./CSVParserUIAdapter";
import {
  nodeUIAdapterRegistry,
  createStandardReactFlowAdapter,
} from "./NodeUIAdapter";

/**
 * Register all built-in adapters with the global registry
 */
export function registerBuiltInAdapters(): void {
  // CSV Parser adapter registration
  nodeUIAdapterRegistry.register("csv-parser", () => {
    const reactFlowAdapter = createStandardReactFlowAdapter();
    return new CSVParserUIAdapter(reactFlowAdapter);
  });
}

/**
 * Check if all built-in adapters are registered
 */
export function areBuiltInAdaptersRegistered(): boolean {
  const requiredAdapters = ["csv-parser"];
  return requiredAdapters.every((type) => nodeUIAdapterRegistry.has(type));
}

/**
 * Get list of all registered built-in adapter types
 */
export function getBuiltInAdapterTypes(): string[] {
  return ["csv-parser"]; // Add more as they're implemented
}
