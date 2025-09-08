/**
 * Node Package Type Definitions
 * Central location for all node-related types
 */

// Core node definition from constants
export interface NodeDefinition {
  id: string;
  type: string;
  name: string;
  category: string;
  description?: string;
  icon?: string;
  tags?: string[];
}

// Node item as returned by the API
export interface NodeItem {
  id: string;
  nodeType: string;
  title: string;
  category: string;
  description?: string;
  icon?: string;
  tags?: string[];
}

// Node category grouping
export interface NodeCategory {
  name: string;
  displayName: string;
  items: NodeItem[];
}

// Re-export base types from other modules
export type {
  NodeLogic,
  NodePackage,
  NodePackageRegistryEntry,
  NodeTestSuite,
  NodeUIComponent,
  NodeUIProps,
} from "./base/NodePackage";

export type {
  NodeDefinition as CoreNodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
  PortDefinition,
} from "./types/index";

export type { BaseNodeUIProps } from "./base/BaseNodeUI";

export type { DiscoveryConfig, RegistryConfig } from "./registry";

// Available node types map (will be populated as nodes are added)
export type AvailableNodeTypes = {
  // Node type mappings will be added here as nodes are created
  // Example: "json-parser": import("./nodes/json-parser").JsonParserNodePackageType;
};
