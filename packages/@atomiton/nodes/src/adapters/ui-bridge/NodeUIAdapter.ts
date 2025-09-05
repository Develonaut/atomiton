/**
 * NodeUIAdapter - Phase 2 UI Architecture Refactor
 *
 * This adapter bridges the gap between UI components and core node definitions
 * by providing a clean, typed interface that eliminates the need for UI packages
 * to directly import from @atomiton/core.
 *
 * ARCHITECTURAL GOALS:
 * - Remove boundary violations: UI -> Nodes -> Core (clean dependency flow)
 * - Leverage existing adapter system for visualization mapping
 * - Provide type-safe configuration and state management
 * - Enable proper separation of concerns between packages
 */

import { CATEGORY_COLORS, COLORS, STATUS_COLORS } from "@atomiton/theme";

import type { NodeExecutionContext } from "../../types";
import type {
  AdapterTheme,
  NodeCategory,
  NodeStatus,
} from "../base/IVisualizationAdapter";
import { createDefaultAdapterConfig } from "../base/IVisualizationAdapter";
import type { ReactFlowAdapter } from "../react-flow/ReactFlowAdapter";
import { ReactFlowAdapter as ReactFlowAdapterClass } from "../react-flow/ReactFlowAdapter";

// Re-export types that UI components need (clean interface)
export type { NodeExecutionContext } from "../../types";
export type {
  DataType,
  NodeCategory,
  NodeStatus,
} from "../base/IVisualizationAdapter";
export type { ReactFlowAdapter } from "../react-flow/ReactFlowAdapter";

/**
 * UI-specific configuration interface
 * This is what UI components work with, abstracted from core complexity
 */
export interface UINodeConfig {
  [key: string]: unknown;
}

/**
 * UI Node State - Runtime state that UI components need to track
 */
export interface UINodeState {
  status: "idle" | "executing" | "completed" | "error" | "warning";
  progress?: number;
  message?: string;
  validationErrors?: string[];
}

/**
 * UI Node Definition - Simplified view of NodeDefinition for UI consumption
 */
export interface UINodeDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  icon?: string;

  // Port information for React Flow handles
  inputs: UIPortDefinition[];
  outputs: UIPortDefinition[];

  // Configuration schema (simplified for UI)
  configSchema: UIConfigSchema;
  defaultConfig: UINodeConfig;
}

/**
 * UI Port Definition - What UI components need to render handles/connections
 */
export interface UIPortDefinition {
  id: string;
  name: string;
  dataType: string;
  required: boolean;
  position: "left" | "right" | "top" | "bottom";
  offset: number; // percentage from top (0-100)
}

/**
 * Simplified configuration schema for UI components
 */
export interface UIConfigField {
  type: "string" | "number" | "boolean" | "select" | "multiselect";
  label: string;
  description?: string;
  default?: unknown;
  required?: boolean;
  options?: Array<{ value: unknown; label: string }>; // For select types
  min?: number; // For number type
  max?: number; // For number type
  placeholder?: string; // For string type
}

export interface UIConfigSchema {
  [fieldName: string]: UIConfigField;
}

/**
 * UI Bridge Node Data
 * Legacy adapter bridge data structure - being phased out in favor of NodeData from UI types
 * @deprecated This will be removed in a future version
 */
export interface UIBridgeNodeData {
  // Display properties
  label: string;
  subtitle?: string;
  description?: string;
  version: string;
  icon?: string;

  // Runtime state
  state: UINodeState;
  config: UINodeConfig;

  // Theme context (injected)
  categoryColor: string;
  statusColor: string;

  // Port information for rendering handles
  inputs: UIPortDefinition[];
  outputs: UIPortDefinition[];

  // Configuration editing support
  configSchema: UIConfigSchema;

  // Callbacks for interaction
  onConfigChange: (config: UINodeConfig) => void;
  onStatusChange: (state: Partial<UINodeState>) => void;
  onValidate: () => Promise<string[]>;
}

/**
 * Node UI Adapter Interface
 * This is what each node implementation provides to bridge UI and Core
 */
export interface NodeUIAdapter<TConfig = UINodeConfig> {
  /**
   * Get UI-friendly node definition from core node
   */
  getUIDefinition(): UINodeDefinition;

  /**
   * Convert core configuration to UI configuration
   */
  coreConfigToUI(coreConfig: unknown): TConfig;

  /**
   * Convert UI configuration to core configuration
   */
  uiConfigToCore(uiConfig: TConfig): unknown;

  /**
   * Validate UI configuration and return errors
   */
  validateUIConfig(uiConfig: TConfig): string[];

  /**
   * Get React Flow node data for rendering
   * This method ties into the existing visualization adapter system
   */
  getReactFlowData(
    instanceId: string,
    config: TConfig,
    state: UINodeState,
    theme: AdapterTheme,
    callbacks: {
      onConfigChange: (config: TConfig) => void;
      onStatusChange: (state: Partial<UINodeState>) => void;
    },
  ): UIBridgeNodeData;

  /**
   * Create execution context for core node from UI state
   */
  createExecutionContext(
    instanceId: string,
    config: TConfig,
    inputs: Record<string, unknown>,
  ): Partial<NodeExecutionContext>;
}

/**
 * Base implementation that most node adapters can extend
 */
export abstract class BaseNodeUIAdapter<TConfig = UINodeConfig>
  implements NodeUIAdapter<TConfig>
{
  protected reactFlowAdapter: ReactFlowAdapter;

  constructor(reactFlowAdapter: ReactFlowAdapter) {
    this.reactFlowAdapter = reactFlowAdapter;
  }

  abstract getUIDefinition(): UINodeDefinition;
  abstract coreConfigToUI(coreConfig: unknown): TConfig;
  abstract uiConfigToCore(uiConfig: TConfig): unknown;
  abstract validateUIConfig(uiConfig: TConfig): string[];
  abstract createExecutionContext(
    instanceId: string,
    config: TConfig,
    inputs: Record<string, unknown>,
  ): Partial<NodeExecutionContext>;

  /**
   * Default implementation leverages existing ReactFlowAdapter
   */
  getReactFlowData(
    instanceId: string,
    config: TConfig,
    state: UINodeState,
    theme: AdapterTheme,
    callbacks: {
      onConfigChange: (config: TConfig) => void;
      onStatusChange: (state: Partial<UINodeState>) => void;
    },
  ): UIBridgeNodeData {
    const definition = this.getUIDefinition();

    return {
      label: definition.name,
      subtitle: definition.description,
      description: definition.description,
      version: definition.version,
      icon: definition.icon,

      state,
      config: config as UINodeConfig,

      // Use theme injection from existing adapter system
      categoryColor: theme.getCategoryColor(
        definition.category as NodeCategory,
      ),
      statusColor: theme.getStatusColor(state.status as NodeStatus),

      inputs: definition.inputs,
      outputs: definition.outputs,
      configSchema: definition.configSchema,

      onConfigChange: callbacks.onConfigChange as (
        config: UINodeConfig,
      ) => void,
      onStatusChange: callbacks.onStatusChange,

      onValidate: async () => this.validateUIConfig(config),
    };
  }
}

/**
 * Registry for UI adapters
 * This allows UI components to look up adapters by node type
 */
export class NodeUIAdapterRegistry {
  private adapters = new Map<string, () => NodeUIAdapter>();

  /**
   * Register an adapter factory for a node type
   */
  register<T extends UINodeConfig = UINodeConfig>(
    nodeType: string,
    factory: () => NodeUIAdapter<T>,
  ): void {
    this.adapters.set(nodeType, factory);
  }

  /**
   * Get adapter for a node type
   */
  get<T extends UINodeConfig = UINodeConfig>(
    nodeType: string,
  ): NodeUIAdapter<T> | null {
    const factory = this.adapters.get(nodeType);
    return factory ? (factory() as NodeUIAdapter<T>) : null;
  }

  /**
   * Check if adapter exists for node type
   */
  has(nodeType: string): boolean {
    return this.adapters.has(nodeType);
  }

  /**
   * Get all registered node types
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.adapters.keys());
  }
}

/**
 * Global adapter registry instance
 */
export const nodeUIAdapterRegistry = new NodeUIAdapterRegistry();

/**
 * Create standard ReactFlowAdapter configuration for all UI adapters
 * Single source of truth for theme and React Flow settings
 */
export function createStandardReactFlowAdapter(): ReactFlowAdapter {
  // Create theme using @atomiton/theme colors
  const theme = {
    getCategoryColor: (category: string) =>
      CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] ||
      COLORS.purple,
    getPortColor: (_dataType: string) => COLORS.cyan,
    getStatusColor: (status: string) =>
      STATUS_COLORS[status as keyof typeof STATUS_COLORS] || COLORS.comment,
    getConnectionColor: (_status: string) => COLORS.pink,
    colors: {
      background: COLORS.background,
      foreground: COLORS.foreground,
      primary: COLORS.purple,
      secondary: COLORS.pink,
      accent: COLORS.cyan,
      muted: COLORS.comment,
      border: COLORS.selection,
    },
    typography: {
      fontSize: { xs: "10px", sm: "12px", md: "14px", lg: "16px", xl: "18px" },
      fontWeight: { normal: 400, medium: 500, bold: 700 },
      lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.8 },
    },
    spacing: { xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "32px" },
    radius: { none: "0px", sm: "4px", md: "8px", lg: "12px", full: "50%" },
    shadows: {
      none: "none",
      sm: "0 1px 2px rgba(0, 0, 0, 0.1)",
      md: "0 4px 6px rgba(0, 0, 0, 0.1)",
      lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
      glow: (color: string) => `0 0 20px ${color}40`,
    },
  };

  // Create proper adapter config using the utility function
  const config = createDefaultAdapterConfig(theme);

  // Add React Flow specific configuration
  const reactFlowConfig = {
    ...config,
    reactFlow: {
      nodeTypes: {},
      edgeTypes: {},
      defaultNodeType: "default",
      defaultEdgeType: "default",
      connectionLineType: "smoothstep" as const,
      connectionMode: "loose" as const,
      snapGrid: [15, 15] as [number, number],
      nodeOrigin: [0.5, 0.5] as [number, number],
      proOptions: {
        account: "free",
        hideAttribution: false,
      },
    },
  };

  return new ReactFlowAdapterClass(reactFlowConfig);
}

/**
 * Register built-in adapters
 * This function should be called from an external registration module to avoid circular dependencies
 */
export function registerBuiltInAdapters(): void {
  // This function is intentionally empty here to avoid circular dependencies
  // The actual registration happens in a separate file that imports both this module and the adapters
  console.warn(
    "registerBuiltInAdapters should be called from a separate registration module",
  );
}

/**
 * Utility function to create a React Flow node using the adapter system
 * This is the main entry point for UI components
 */
export function createAdaptedReactFlowNode<
  T extends UINodeConfig = UINodeConfig,
>(
  nodeType: string,
  instanceId: string,
  initialConfig: T,
  position: { x: number; y: number },
  theme: AdapterTheme,
): {
  reactFlowNode: unknown; // Would be ReactFlowNode<UIBridgeNodeData> - properly type when integrated
  adapter: NodeUIAdapter<T>;
} | null {
  const adapter = nodeUIAdapterRegistry.get<T>(nodeType);
  if (!adapter) {
    return null;
  }

  const initialState: UINodeState = {
    status: "idle",
  };

  const callbacks = {
    onConfigChange: (_config: T) => {
      // This would be handled by the containing component
    },
    onStatusChange: (_state: Partial<UINodeState>) => {
      // This would be handled by the containing component
    },
  };

  const reactFlowData = adapter.getReactFlowData(
    instanceId,
    initialConfig,
    initialState,
    theme,
    callbacks,
  );

  // Create React Flow compatible node
  const reactFlowNode = {
    id: instanceId,
    type: nodeType,
    position,
    data: reactFlowData,
  };

  return {
    reactFlowNode,
    adapter,
  };
}

export default NodeUIAdapter;
