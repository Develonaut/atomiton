/**
 * Visualization Adapters - Public API
 *
 * This module provides vendor-agnostic visualization adapters that transform
 * our core node system to work with different visualization libraries.
 *
 * KEY FEATURES:
 * - Theme injection from UI package (no hardcoded colors)
 * - Consistent API across different visualization libraries
 * - Easy adapter switching without code changes
 * - Full TypeScript support with compile-time checking
 *
 * USAGE:
 * ```typescript
 * import { createReactFlowAdapter, AdapterTheme } from '@atomiton/nodes/adapters';
 *
 * // Theme is injected from UI package
 * const theme: AdapterTheme = {
 *   getCategoryColor: (category) => myTheme.colors.categories[category],
 *   getPortColor: (dataType) => myTheme.colors.dataTypes[dataType],
 *   // ... other theme functions
 * };
 *
 * const adapter = createReactFlowAdapter(theme, {
 *   behavior: { enableAnimations: true },
 *   layout: { nodeSpacing: 120 }
 * });
 * ```
 */

// Core interfaces and types
/**
 * Default theme example for documentation purposes
 *
 * This shows how UI packages should structure their theme injection.
 * DO NOT USE THIS IN PRODUCTION - inject your actual theme instead.
 */
import { AdapterFactory } from "./AdapterFactory";
import type {
  AdapterTheme,
  NodeCategory,
  DataType,
  NodeStatus,
  ConnectionStatus,
} from "./base/IVisualizationAdapter";

export type {
  // Core adapter interface
  IVisualizationAdapter,

  // Theme injection interface
  AdapterTheme,
  AdapterConfig,
  AdapterBehaviorConfig,
  AdapterLayoutConfig,

  // Data types
  VisualNodeInstance,
  VisualConnection,
  NodePosition,
  NodeCategory,
  DataType,
  NodeStatus,
  ConnectionStatus,
} from "./base/IVisualizationAdapter";

// Base adapter implementation
export { BaseVisualizationAdapter } from "./base/BaseAdapter";

// React Flow adapter
export type {
  ReactFlowNode,
  ReactFlowEdge,
  ReactFlowPosition,
  ReactFlowAdapterConfig,
} from "./react-flow/ReactFlowAdapter";

export {
  ReactFlowAdapter,
  createReactFlowAdapter,
} from "./react-flow/ReactFlowAdapter";

export {
  DefaultAtomitonNode,
  InputAtomitonNode,
  OutputAtomitonNode,
  GroupAtomitonNode,
  AtomitonNodeTypes,
  createNodeComponents,
} from "./react-flow/ReactFlowNodeFactory";

// Cytoscape adapter
export type {
  CytoscapeNode,
  CytoscapeEdge,
  CytoscapePosition,
  CytoscapeAdapterConfig,
} from "./cytoscape/CytoscapeAdapter";

export {
  CytoscapeAdapter,
  createCytoscapeAdapter,
} from "./cytoscape/CytoscapeAdapter";

// UI Bridge Adapters - Phase 2 UI Architecture Refactor
export type {
  UINodeDefinition,
  UINodeConfig,
  UINodeState,
  UIPortDefinition,
  UIConfigField,
  UIConfigSchema,
  UIBridgeNodeData, // @deprecated - use NodeData from UI types instead
  NodeUIAdapter,
} from "./ui-bridge/NodeUIAdapter";

export {
  BaseNodeUIAdapter,
  NodeUIAdapterRegistry,
  nodeUIAdapterRegistry,
  registerBuiltInAdapters,
  createAdaptedReactFlowNode,
} from "./ui-bridge/NodeUIAdapter";

export {
  CSVParserUIAdapter,
  createCSVParserUIAdapter,
  type CSVParserUIConfig,
} from "./ui-bridge/CSVParserUIAdapter";

// Core Node Type Adapters - Phase 2 Extension
export {
  GenericBaseNodeUIAdapter,
  createBaseNodeUIAdapter,
  type BaseNodeUIConfig,
} from "./ui-bridge/BaseNodeUIAdapter";

export {
  DataNodeUIAdapter,
  createDataNodeUIAdapter,
  type DataNodeUIConfig,
} from "./ui-bridge/DataNodeUIAdapter";

export {
  IONodeUIAdapter,
  createIONodeUIAdapter,
  type IONodeUIConfig,
} from "./ui-bridge/IONodeUIAdapter";

export {
  ProcessingNodeUIAdapter,
  createProcessingNodeUIAdapter,
  type ProcessingNodeUIConfig,
} from "./ui-bridge/ProcessingNodeUIAdapter";

// Adapter Registration System - Phase 2 Extension
export {
  registerBuiltInUIAdapters,
  selectAdapterForNode,
  registerCustomAdapter,
  registerCustomAdapters,
  getAdapterRegistryInfo,
  clearAdapterRegistry,
  validateNodeDefinition,
  createAdapterFactory,
  initializeAdapterSystem,
  adapterRegistry as uiAdapterRegistry,
} from "./ui-bridge/AdapterRegistration";

// Adapter factory and registry
export type { AdapterType, AdapterRegistryEntry } from "./AdapterFactory";

export {
  AdapterFactory,
  adapterRegistry,
  createAdapter,
  createReactFlowAdapter as factoryCreateReactFlow,
  createCytoscapeAdapter as factoryCreateCytoscape,
} from "./AdapterFactory";

// Convenience re-exports for common usage patterns
export {
  createReactFlowAdapter as createReactFlow,
  createCytoscapeAdapter as createCytoscape,
} from "./AdapterFactory";

export const exampleTheme: AdapterTheme = {
  getCategoryColor: (category: NodeCategory): string => {
    const colors = {
      input: "#8b5cf6", // Purple
      processor: "#10b981", // Green
      output: "#f59e0b", // Amber
      control: "#ef4444", // Red
      utility: "#6b7280", // Gray
      custom: "#06b6d4", // Cyan
    };
    return colors[category] || colors.custom;
  },

  getPortColor: (dataType: DataType): string => {
    const colors = {
      string: "#8b5cf6", // Purple
      number: "#f59e0b", // Amber
      boolean: "#10b981", // Green
      object: "#06b6d4", // Cyan
      array: "#ec4899", // Pink
      file: "#6366f1", // Indigo
      image: "#84cc16", // Lime
      any: "#6b7280", // Gray
    };
    return colors[dataType] || colors.any;
  },

  getStatusColor: (status: NodeStatus): string => {
    const colors = {
      idle: "#6b7280", // Gray
      executing: "#fbbf24", // Yellow
      completed: "#10b981", // Green
      error: "#ef4444", // Red
      warning: "#f59e0b", // Amber
    };
    return colors[status];
  },

  getConnectionColor: (status: ConnectionStatus): string => {
    const colors = {
      valid: "#6b7280", // Gray
      invalid: "#ef4444", // Red
      warning: "#f59e0b", // Amber
      selected: "#06b6d4", // Cyan
    };
    return colors[status];
  },

  colors: {
    background: "#0f172a", // Dark blue
    foreground: "#f8fafc", // Light gray
    primary: "#06b6d4", // Cyan
    secondary: "#8b5cf6", // Purple
    accent: "#f59e0b", // Amber
    muted: "#64748b", // Slate
    border: "#334155", // Dark slate
    gridColor: "#1e293b", // Very dark slate
  },

  typography: {
    fontSize: {
      xs: "10px",
      sm: "12px",
      md: "14px",
      lg: "16px",
      xl: "18px",
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
    },
  },

  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
  },

  radius: {
    none: "0px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    full: "50%",
  },

  shadows: {
    none: "none",
    sm: "0 1px 2px rgba(0, 0, 0, 0.1)",
    md: "0 4px 6px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
    glow: (color: string) => `0 0 20px ${color}40`, // Add 40 for alpha
  },
};

/**
 * Adapter recommendation helper
 */
export interface AdapterRequirements {
  nodeCount?: number;
  needsCustomComponents?: boolean;
  needsAdvancedLayouts?: boolean;
  needsAnalysis?: boolean;
  needsReactIntegration?: boolean;
  performance?: "high" | "medium" | "low";
}

export function recommendAdapter(requirements: AdapterRequirements) {
  return AdapterFactory.recommend(requirements);
}

/**
 * Theme validation helper
 */
export function validateTheme(theme: AdapterTheme) {
  return AdapterFactory.validateTheme(theme);
}
