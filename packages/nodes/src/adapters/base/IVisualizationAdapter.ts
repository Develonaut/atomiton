/**
 * Vendor-Agnostic Visualization Adapter Interface with Theme Injection
 *
 * This interface defines the contract for adapting our core node system
 * to any visualization library (React Flow, Cytoscape, D3, custom canvas, etc.)
 *
 * ARCHITECTURAL PRINCIPLES:
 * - Core node logic remains completely independent of UI library
 * - Theme is injected from UI package to avoid color duplication
 * - Adapter handles ONLY data transformation, not business logic
 * - Clean separation enables easy library swapping
 * - Type-safe transformations with full compile-time checking
 */

// Core types - these would normally be imported from @atomiton/core
// For now, we'll define minimal interfaces to avoid circular dependencies
export interface NodeDefinition {
  id: string;
  name: string;
  description?: string;
  category: string;
  type: string;
  inputs?: Array<{
    id: string;
    name: string;
    dataType: string;
    required?: boolean;
  }>;
  outputs?: Array<{ id: string; name: string; dataType: string }>;
}

export interface NodeConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourcePortId: string;
  targetPortId: string;
  metadata?: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  level: "error" | "warning" | "info";
  message: string;
  field?: string;
}

/**
 * Node categories for theme-based coloring
 */
export type NodeCategory =
  | "input"
  | "processor"
  | "output"
  | "control"
  | "utility"
  | "custom";

/**
 * Data types for port coloring
 */
export type DataType =
  | "string"
  | "number"
  | "boolean"
  | "object"
  | "array"
  | "file"
  | "image"
  | "any";

/**
 * Node status for state-based styling
 */
export type NodeStatus =
  | "idle"
  | "executing"
  | "completed"
  | "error"
  | "warning";

/**
 * Connection status for styling
 */
export type ConnectionStatus = "valid" | "invalid" | "warning" | "selected";

/**
 * Theme injection interface - allows UI package to provide theme functions
 */
export interface AdapterTheme {
  /**
   * Get color for node category (e.g., input nodes are blue, processor nodes are green)
   */
  getCategoryColor: (category: NodeCategory) => string;

  /**
   * Get color for data type ports (e.g., string ports are purple, number ports are orange)
   */
  getPortColor: (dataType: DataType) => string;

  /**
   * Get color for node status (e.g., executing nodes are yellow, error nodes are red)
   */
  getStatusColor: (status: NodeStatus) => string;

  /**
   * Get color for connection status
   */
  getConnectionColor: (status: ConnectionStatus) => string;

  /**
   * Get base theme colors
   */
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    border: string;
    gridColor?: string;
  };

  /**
   * Typography settings
   */
  typography: {
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };

  /**
   * Spacing scale
   */
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };

  /**
   * Border radius values
   */
  radius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
  };

  /**
   * Shadow definitions
   */
  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    glow: (color: string) => string;
  };
}

/**
 * Generic node position for visual placement
 */
export interface NodePosition {
  x: number;
  y: number;
}

/**
 * Visual node instance with positioning and state
 */
export interface VisualNodeInstance {
  /** Core node definition */
  definition: NodeDefinition;
  /** Visual position */
  position: NodePosition;
  /** Visual state */
  selected: boolean;
  dragging: boolean;
  /** Runtime state */
  executing: boolean;
  completed: boolean;
  hasError: boolean;
  errorMessage?: string;
  /** Warning state */
  hasWarning: boolean;
  warningMessage?: string;
}

/**
 * Visual connection with styling information
 */
export interface VisualConnection extends NodeConnection {
  /** Visual styling */
  animated: boolean;
  selected: boolean;
  /** Connection state */
  valid: boolean;
  validationResult?: ValidationResult;
  /** Data flow status */
  flowing: boolean;
  flowDirection: "forward" | "backward" | "bidirectional";
}

/**
 * Generic visualization adapter interface
 *
 * TVisualNode: Library-specific node type (e.g., React Flow's Node)
 * TVisualEdge: Library-specific edge type (e.g., React Flow's Edge)
 * TPosition: Library-specific position type
 */
export interface IVisualizationAdapter<
  TVisualNode,
  TVisualEdge,
  TPosition = NodePosition,
> {
  /**
   * Transform core node to visualization library format
   */
  nodeToVisual(node: VisualNodeInstance): TVisualNode;

  /**
   * Transform core connection to visualization library format
   */
  connectionToVisual(connection: VisualConnection): TVisualEdge;

  /**
   * Transform visualization node back to core format
   * Used for persisting changes made in the visual editor
   */
  visualToNode(visual: TVisualNode): VisualNodeInstance;

  /**
   * Transform visualization edge back to core format
   */
  visualToConnection(visual: TVisualEdge): VisualConnection;

  /**
   * Convert between position formats
   */
  positionToVisual(position: NodePosition): TPosition;
  positionFromVisual(position: TPosition): NodePosition;

  /**
   * Validate that a connection can be made
   */
  canConnect(
    source: TVisualNode,
    target: TVisualNode,
    sourceHandle?: string,
    targetHandle?: string,
  ): boolean;

  /**
   * Get visual styling for node based on its state and type
   */
  getNodeStyling(
    node: VisualNodeInstance,
  ): Record<string, string | number | boolean>;

  /**
   * Get visual styling for connection based on its state and data type
   */
  getConnectionStyling(
    connection: VisualConnection,
  ): Record<string, string | number | boolean>;

  /**
   * Handle node selection changes
   */
  onNodeSelectionChange(
    nodes: TVisualNode[],
    callback: (selectedNodes: VisualNodeInstance[]) => void,
  ): void;

  /**
   * Handle connection creation
   */
  onConnectionCreate(
    connection: TVisualEdge,
    callback: (connection: VisualConnection) => void,
  ): void;

  /**
   * Handle node position changes
   */
  onNodePositionChange(
    nodes: TVisualNode[],
    callback: (updates: Array<{ id: string; position: NodePosition }>) => void,
  ): void;

  /**
   * Update the injected theme
   */
  updateTheme(theme: AdapterTheme): void;

  /**
   * Adapt a node package for use with this visualization library
   */
  adaptNode(nodePackage: unknown): Promise<{
    type: string;
    component: unknown;
    metadata: Record<string, unknown>;
  }>;
}

/**
 * Adapter behavior configuration
 */
export interface AdapterBehaviorConfig {
  snapToGrid: boolean;
  gridSize: number;
  allowMultiSelection: boolean;
  enableAnimations: boolean;
  enableSounds: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
}

/**
 * Adapter layout configuration
 */
export interface AdapterLayoutConfig {
  nodeSpacing: number;
  minimumZoom: number;
  maximumZoom: number;
  defaultZoom: number;
  fitViewPadding: number;
  connectionCurvature: number;
}

/**
 * Complete adapter configuration with theme injection
 */
export interface AdapterConfig {
  /** Theme injected from UI package */
  theme: AdapterTheme;

  /** Behavior configuration */
  behavior: AdapterBehaviorConfig;

  /** Layout configuration */
  layout: AdapterLayoutConfig;

  /** Performance configuration */
  performance: {
    enableVirtualization: boolean;
    virtualizationThreshold: number;
    renderThrottleMs: number;
    batchUpdates: boolean;
  };

  /** Accessibility configuration */
  accessibility: {
    enableKeyboardNavigation: boolean;
    enableScreenReader: boolean;
    highContrastMode: boolean;
    focusIndicatorStyle: "outline" | "glow" | "border";
  };
}

/**
 * Default adapter configuration factory
 */
export function createDefaultAdapterConfig(theme: AdapterTheme): AdapterConfig {
  return {
    theme,
    behavior: {
      snapToGrid: true,
      gridSize: 20,
      allowMultiSelection: true,
      enableAnimations: true,
      enableSounds: false,
      autoSave: true,
      autoSaveInterval: 30000, // 30 seconds
    },
    layout: {
      nodeSpacing: 100,
      minimumZoom: 0.1,
      maximumZoom: 2.0,
      defaultZoom: 1.0,
      fitViewPadding: 50,
      connectionCurvature: 0.25,
    },
    performance: {
      enableVirtualization: true,
      virtualizationThreshold: 1000,
      renderThrottleMs: 16, // 60fps
      batchUpdates: true,
    },
    accessibility: {
      enableKeyboardNavigation: true,
      enableScreenReader: true,
      highContrastMode: false,
      focusIndicatorStyle: "glow",
    },
  };
}
