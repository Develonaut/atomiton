/**
 * React Flow Adapter Implementation with Theme Injection
 *
 * Concrete implementation of IVisualizationAdapter for React Flow.
 * Transforms our core node system to React Flow's specific format
 * with complete theme flexibility through injection.
 *
 * ARCHITECTURAL PRINCIPLES:
 * - Only handles data transformation - no business logic
 * - Theme is injected from UI package - no hardcoded colors
 * - Maintains type safety with React Flow types
 * - Provides seamless integration without vendor lock-in
 */

import type { NodePackage } from "../../base/NodePackage";
import { BaseVisualizationAdapter } from "../base/BaseAdapter";
import type {
  AdapterConfig,
  AdapterTheme,
  DataType,
  NodeCategory,
  NodeDefinition,
  NodePosition,
  VisualConnection,
  VisualNodeInstance,
} from "../base/IVisualizationAdapter";

// React Flow types - would normally be imported from @xyflow/react
export interface ReactFlowNodePort {
  id: string;
  dataType: string;
}

export interface ReactFlowNodeData {
  definition?: NodeDefinition;
  label?: string;
  description?: string;
  inputs?: ReactFlowNodePort[];
  outputs?: ReactFlowNodePort[];
  executing?: boolean;
  completed?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  hasWarning?: boolean;
  warningMessage?: string;
  theme?: AdapterTheme;
  categoryColor?: string;
  statusColor?: string;
  getPortStyle?: (dataType: DataType) => Record<string, unknown>;
  getHandleStyle?: () => Record<string, unknown>;
}

export interface ReactFlowNode {
  id: string;
  type?: string;
  data: ReactFlowNodeData;
  position: { x: number; y: number };
  style?: Record<string, string | number | boolean>;
  className?: string;
  selected?: boolean;
  dragging?: boolean;
  width?: number;
  height?: number;
  dragHandle?: string;
  parentId?: string;
  extent?: "parent" | [[number, number], [number, number]];
  expandParent?: boolean;
  positionAbsolute?: { x: number; y: number };
  draggable?: boolean;
  selectable?: boolean;
  connectable?: boolean;
  deletable?: boolean;
}

export interface ReactFlowConnectionData {
  connection?: {
    metadata?: Record<string, unknown>;
  };
  valid?: boolean;
  validationResult?: {
    valid: boolean;
    level: "info" | "warning" | "error";
    message: string;
  };
  flowing?: boolean;
  flowDirection?: "forward" | "backward" | "bidirectional";
  theme?: AdapterTheme;
  dataTypeColor?: string;
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  style?: Record<string, string | number | boolean>;
  animated?: boolean;
  hidden?: boolean;
  deletable?: boolean;
  data?: ReactFlowConnectionData;
  className?: string;
  sourceX?: number;
  sourceY?: number;
  targetX?: number;
  targetY?: number;
  sourcePosition?: "top" | "right" | "bottom" | "left";
  targetPosition?: "top" | "right" | "bottom" | "left";
  label?: string;
  labelStyle?: Record<string, string | number | boolean>;
  labelShowBg?: boolean;
  labelBgStyle?: Record<string, string | number | boolean>;
  labelBgPadding?: [number, number];
  labelBgBorderRadius?: number;
  markerStart?: string;
  markerEnd?: string;
  pathOptions?: Record<string, unknown>;
  interactionWidth?: number;
}

export interface ReactFlowPosition {
  x: number;
  y: number;
}

/**
 * React Flow specific adapter configuration
 */
export interface ReactFlowAdapterConfig extends AdapterConfig {
  reactFlow: {
    nodeTypes: Record<string, string>;
    edgeTypes: Record<string, string>;
    defaultNodeType: string;
    defaultEdgeType: string;
    connectionLineType:
      | "default"
      | "straight"
      | "step"
      | "smoothstep"
      | "simplebezier";
    connectionMode: "strict" | "loose";
    snapGrid: [number, number];
    nodeOrigin: [number, number];
    proOptions: {
      account: string;
      hideAttribution: boolean;
    };
  };
}

/**
 * React Flow Adapter with Theme Injection
 *
 * Transforms between our core node system and React Flow's format
 * while accepting theme configuration from the UI package.
 */
export class ReactFlowAdapter extends BaseVisualizationAdapter<
  ReactFlowNode,
  ReactFlowEdge,
  ReactFlowPosition
> {
  private reactFlowConfig: ReactFlowAdapterConfig["reactFlow"];
  private nodeComponents: Map<string, unknown> = new Map();
  private edgeComponents: Map<string, unknown> = new Map();

  constructor(config: ReactFlowAdapterConfig) {
    super(config);
    this.reactFlowConfig = config.reactFlow;
  }

  /**
   * Transform core node to React Flow node format with theme-aware styling
   */
  nodeToVisual(node: VisualNodeInstance): ReactFlowNode {
    const nodeStyles = this.getNodeStyling(node);
    const categoryColor = this.theme.getCategoryColor(
      node.definition.category as NodeCategory,
    );
    const statusColor = this.theme.getStatusColor(this.getNodeStatus(node));

    return {
      id: node.definition.id,
      type: this.getNodeType(node.definition.type),
      data: {
        // Core node data
        definition: node.definition,
        label: node.definition.name,
        description: node.definition.description,

        // Ports for connection handles
        inputs: node.definition.inputs || [],
        outputs: node.definition.outputs || [],

        // Runtime state
        executing: node.executing,
        completed: node.completed,
        hasError: node.hasError,
        errorMessage: node.errorMessage,
        hasWarning: node.hasWarning,
        warningMessage: node.warningMessage,

        // Theme context - injected from UI package
        theme: this.theme,
        categoryColor,
        statusColor,

        // Port styling function
        getPortStyle: (dataType: DataType) =>
          this.getElementStyle("port", { dataType }),

        // Handle styling function
        getHandleStyle: () => this.getElementStyle("handle"),
      },
      position: this.positionToVisual(node.position),
      style: {
        ...nodeStyles,
        // React Flow specific styling
        width: "auto",
        minWidth: "180px",
        maxWidth: "300px",
        minHeight: "60px",

        // Enhanced visual effects
        ...(node.selected && {
          transform: "scale(1.02)",
          zIndex: 1000,
        }),

        ...(node.dragging && {
          cursor: "grabbing",
          opacity: 0.8,
        }),

        // Accessibility
        ...(this.config.accessibility.highContrastMode && {
          borderWidth: "3px",
          fontWeight: this.theme.typography.fontWeight.bold,
        }),

        // Focus indicator styles applied directly for keyboard navigation
        ...(this.config.accessibility.enableKeyboardNavigation &&
          this.getFocusStyle()),
      },
      className: this.getNodeClassName(node),
      selected: node.selected,
      dragging: node.dragging,
      draggable: true,
      selectable: true,
      connectable: !node.hasError,
      deletable: true,
    };
  }

  /**
   * Transform core connection to React Flow edge format with theme-aware styling
   */
  connectionToVisual(connection: VisualConnection): ReactFlowEdge {
    const connectionStyles = this.getConnectionStyling(connection);
    const connectionColor = this.theme.getConnectionColor(
      this.getConnectionStatus(connection),
    );

    // Determine data type color if available
    const dataTypeColor = connection.metadata?.dataType
      ? this.theme.getPortColor(connection.metadata.dataType as DataType)
      : connectionColor;

    return {
      id: connection.id,
      source: connection.sourceNodeId,
      target: connection.targetNodeId,
      sourceHandle: connection.sourcePortId,
      targetHandle: connection.targetPortId,
      type: this.getEdgeType(connection),
      style: {
        ...connectionStyles,
        stroke: dataTypeColor,
        // Enhanced visual feedback
        filter: connection.selected
          ? `drop-shadow(0 0 6px ${dataTypeColor})`
          : "none",
      },
      animated: connection.animated && this.config.behavior.enableAnimations,
      label: this.getConnectionLabel(connection),
      labelStyle: this.getElementStyle("label"),
      labelShowBg: true,
      labelBgStyle: {
        backgroundColor: this.addAlpha(this.theme.colors.background, 0.9),
        borderRadius: this.theme.radius.sm,
      },
      data: {
        connection,
        valid: connection.valid,
        validationResult: connection.validationResult,
        flowing: connection.flowing,
        flowDirection: connection.flowDirection,

        // Theme context
        theme: this.theme,
        dataTypeColor,
      },
      className: this.getConnectionClassName(connection),
      deletable: true,
      // Enhanced interaction
      interactionWidth: connection.selected ? 20 : 12,
    };
  }

  /**
   * Transform React Flow node back to core format
   */
  visualToNode(visual: ReactFlowNode): VisualNodeInstance {
    return {
      definition: visual.data.definition as NodeDefinition,
      position: this.positionFromVisual(visual.position),
      selected: Boolean(visual.selected),
      dragging: Boolean(visual.dragging),
      executing: Boolean(visual.data.executing),
      completed: Boolean(visual.data.completed),
      hasError: Boolean(visual.data.hasError),
      errorMessage: visual.data.errorMessage as string | undefined,
      hasWarning: Boolean(visual.data.hasWarning),
      warningMessage: visual.data.warningMessage as string | undefined,
    };
  }

  /**
   * Transform React Flow edge back to core format
   */
  visualToConnection(visual: ReactFlowEdge): VisualConnection {
    return {
      id: visual.id,
      sourceNodeId: visual.source,
      targetNodeId: visual.target,
      sourcePortId: visual.sourceHandle || "",
      targetPortId: visual.targetHandle || "",
      metadata: visual.data?.connection?.metadata || {},
      animated: Boolean(visual.animated),
      selected: false, // React Flow handles selection differently
      valid: Boolean(visual.data?.valid ?? true),
      validationResult: visual.data?.validationResult || {
        valid: true,
        level: "info" as const,
        message: "",
      },
      flowing: Boolean(visual.data?.flowing),
      flowDirection: visual.data?.flowDirection || "forward",
    };
  }

  /**
   * Position conversion (React Flow uses same format as our core)
   */
  positionToVisual(position: NodePosition): ReactFlowPosition {
    return { x: position.x, y: position.y };
  }

  positionFromVisual(position: ReactFlowPosition): NodePosition {
    return { x: position.x, y: position.y };
  }

  /**
   * Enhanced connection validation with type checking
   */
  canConnect(
    source: ReactFlowNode,
    target: ReactFlowNode,
    sourceHandle?: string,
    targetHandle?: string,
  ): boolean {
    // Basic validation
    if (source.id === target.id) return false;
    if (!sourceHandle || !targetHandle) return false;

    // Find port definitions
    const sourcePort = source.data?.outputs?.find(
      (p: ReactFlowNodePort) => p.id === sourceHandle,
    );
    const targetPort = target.data?.inputs?.find(
      (p: ReactFlowNodePort) => p.id === targetHandle,
    );

    if (!sourcePort || !targetPort) return false;

    // Type compatibility check
    const sourceType = sourcePort.dataType;
    const targetType = targetPort.dataType;

    // 'any' type is compatible with everything
    if (sourceType === "any" || targetType === "any") return true;

    // Exact type match
    if (sourceType === targetType) return true;

    // TODO: Implement more sophisticated type compatibility rules
    // Could be injected via theme or config

    return false;
  }

  /**
   * Handle node selection changes with proper event conversion
   */
  onNodeSelectionChange(
    nodes: ReactFlowNode[],
    callback: (selectedNodes: VisualNodeInstance[]) => void,
  ): void {
    const selectedNodes = nodes
      .filter((node) => node.selected)
      .map((node) => this.visualToNode(node));

    callback(selectedNodes);
  }

  /**
   * Handle new connection creation
   */
  onConnectionCreate(
    edge: ReactFlowEdge,
    callback: (connection: VisualConnection) => void,
  ): void {
    const connection = this.visualToConnection(edge);
    callback(connection);
  }

  /**
   * Handle node position changes with batching
   */
  onNodePositionChange(
    nodes: ReactFlowNode[],
    callback: (updates: Array<{ id: string; position: NodePosition }>) => void,
  ): void {
    const updates = nodes.map((node) => ({
      id: node.id,
      position: this.positionFromVisual(node.position),
    }));

    // Batch updates for performance
    if (this.config.performance.batchUpdates) {
      this.batchCallback(() => callback(updates));
    } else {
      callback(updates);
    }
  }

  /**
   * Register custom node component
   */
  registerNodeComponent(type: string, component: unknown): void {
    this.nodeComponents.set(type, component);
  }

  /**
   * Register custom edge component
   */
  registerEdgeComponent(type: string, component: unknown): void {
    this.edgeComponents.set(type, component);
  }

  /**
   * Get all registered components for React Flow
   */
  getComponents() {
    return {
      nodeTypes: Object.fromEntries(this.nodeComponents),
      edgeTypes: Object.fromEntries(this.edgeComponents),
    };
  }

  // Private helper methods

  private getNodeType(nodeType: string): string {
    return (
      this.reactFlowConfig.nodeTypes[nodeType] ||
      this.reactFlowConfig.defaultNodeType
    );
  }

  private getEdgeType(_connection: VisualConnection): string {
    // Could determine edge type based on connection properties
    return this.reactFlowConfig.defaultEdgeType;
  }

  private getNodeClassName(node: VisualNodeInstance): string {
    const classes = [
      "rf-node-atomiton",
      `rf-node-category-${node.definition.category}`,
      `rf-node-type-${node.definition.type}`,
    ];

    if (node.hasError) classes.push("rf-node-error");
    if (node.hasWarning) classes.push("rf-node-warning");
    if (node.executing) classes.push("rf-node-executing");
    if (node.completed) classes.push("rf-node-completed");
    if (node.selected) classes.push("rf-node-selected");

    return classes.join(" ");
  }

  private getConnectionClassName(connection: VisualConnection): string {
    const classes = ["rf-edge-atomiton"];

    if (!connection.valid) classes.push("rf-edge-invalid");
    if (connection.selected) classes.push("rf-edge-selected");
    if (connection.flowing) classes.push("rf-edge-flowing");
    if (connection.animated) classes.push("rf-edge-animated");

    return classes.join(" ");
  }

  private getConnectionLabel(connection: VisualConnection): string | undefined {
    if (
      connection.metadata &&
      "label" in connection.metadata &&
      connection.metadata.label
    ) {
      return String(connection.metadata.label);
    }

    if (
      connection.metadata &&
      "dataType" in connection.metadata &&
      connection.metadata.dataType
    ) {
      return String(connection.metadata.dataType);
    }

    return undefined;
  }

  private getFocusStyle(): Record<string, string | number> {
    const focusColor = this.theme.colors.accent;

    switch (this.config.accessibility.focusIndicatorStyle) {
      case "outline":
        return { outline: `2px solid ${focusColor}`, outlineOffset: "2px" };
      case "glow":
        return { boxShadow: this.theme.shadows.glow(focusColor) };
      case "border":
        return { borderColor: focusColor, borderWidth: "3px" };
      default:
        return { boxShadow: this.theme.shadows.glow(focusColor) };
    }
  }

  /**
   * Adapt a node package for React Flow
   */
  async adaptNode(nodePackage: NodePackage): Promise<{
    type: string;
    component: unknown;
    metadata: Record<string, unknown>;
  }> {
    const nodeType = `${nodePackage.definition.category}-${nodePackage.definition.id}`;

    return {
      type: nodeType,
      component: nodePackage.ui,
      metadata: nodePackage.metadata || {},
    };
  }

  private batchCallback = this.createBatchCallback();

  private createBatchCallback() {
    let timeoutId: NodeJS.Timeout | null = null;
    const pendingCallbacks: Array<() => void> = [];

    return (callback: () => void) => {
      pendingCallbacks.push(callback);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        const callbacks = [...pendingCallbacks];
        pendingCallbacks.length = 0;
        callbacks.forEach((cb) => cb());
        timeoutId = null;
      }, this.config.performance.renderThrottleMs);
    };
  }
}

/**
 * Factory function to create React Flow adapter with theme injection
 */
export function createReactFlowAdapter(
  theme: AdapterTheme,
  overrides?: Partial<ReactFlowAdapterConfig>,
): ReactFlowAdapter {
  const defaultConfig: ReactFlowAdapterConfig = {
    theme,
    behavior: {
      snapToGrid: true,
      gridSize: 20,
      allowMultiSelection: true,
      enableAnimations: true,
      enableSounds: false,
      autoSave: true,
      autoSaveInterval: 30000,
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
      renderThrottleMs: 16,
      batchUpdates: true,
    },
    accessibility: {
      enableKeyboardNavigation: true,
      enableScreenReader: true,
      highContrastMode: false,
      focusIndicatorStyle: "glow",
    },
    reactFlow: {
      nodeTypes: {
        default: "default",
        input: "input",
        output: "output",
        group: "group",
      },
      edgeTypes: {
        default: "default",
        straight: "straight",
        step: "step",
        smoothstep: "smoothstep",
      },
      defaultNodeType: "default",
      defaultEdgeType: "smoothstep",
      connectionLineType: "smoothstep",
      connectionMode: "strict",
      snapGrid: [20, 20],
      nodeOrigin: [0.5, 0] as [number, number],
      proOptions: {
        account: "paid-pro",
        hideAttribution: true,
      },
    },
  };

  const config = { ...defaultConfig, ...overrides };
  return new ReactFlowAdapter(config);
}

export default ReactFlowAdapter;
