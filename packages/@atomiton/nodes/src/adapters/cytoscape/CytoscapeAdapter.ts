/**
 * Cytoscape Adapter Implementation with Theme Injection
 *
 * Alternative visualization adapter using Cytoscape.js for different
 * visualization needs (network analysis, hierarchical layouts, etc.)
 *
 * ARCHITECTURAL PRINCIPLES:
 * - Same theme injection pattern as React Flow adapter
 * - Focused on graph-based visualizations
 * - Supports advanced layout algorithms
 * - Maintains API consistency with other adapters
 */

import type { NodePackage } from "../../base/NodePackage";
import { BaseVisualizationAdapter } from "../base/BaseAdapter";
import type {
  VisualNodeInstance,
  VisualConnection,
  NodePosition,
  AdapterConfig,
  AdapterTheme,
  NodeCategory,
  DataType,
} from "../base/IVisualizationAdapter";

// Port definition interfaces
export interface CytoscapeNodePort {
  id: string;
  name: string;
  dataType: string;
  required: boolean;
}

// Cytoscape types - would normally be imported from cytoscape
export interface CytoscapeNodeData {
  id: string;
  label: string;
  parent?: string;
  category?: string;
  type?: string;
  description?: string;
  executing?: boolean;
  completed?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  hasWarning?: boolean;
  warningMessage?: string;
  inputs?: CytoscapeNodePort[];
  outputs?: CytoscapeNodePort[];
  categoryColor?: string;
  statusColor?: string;
}

export interface CytoscapeNode {
  group: "nodes";
  data: CytoscapeNodeData;
  position: { x: number; y: number };
  style: Record<string, string | number | boolean>;
  classes: string;
  selected: boolean;
  locked: boolean;
  grabbable: boolean;
  pannable: boolean;
  selectable: boolean;
}

export interface CytoscapeEdgeData {
  id: string;
  source: string;
  target: string;
  sourcePort?: string;
  targetPort?: string;
  label?: string;
  dataType?: string;
  valid?: boolean;
  flowing?: boolean;
  flowDirection?: "forward" | "backward" | "bidirectional";
  theme?: AdapterTheme;
  connectionColor?: string;
  dataTypeColor?: string;
}

export interface CytoscapeEdge {
  group: "edges";
  data: CytoscapeEdgeData;
  style: Record<string, string | number | boolean>;
  classes: string;
  selected: boolean;
  selectable: boolean;
}

export interface CytoscapePosition {
  x: number;
  y: number;
}

/**
 * Cytoscape specific configuration
 */
export interface CytoscapeAdapterConfig extends AdapterConfig {
  cytoscape: {
    layout: {
      name:
        | "preset"
        | "grid"
        | "circle"
        | "concentric"
        | "breadthfirst"
        | "cose"
        | "dagre";
      animate: boolean;
      animationDuration: number;
      fit: boolean;
      padding: number;
    };
    interaction: {
      minZoom: number;
      maxZoom: number;
      zoomingEnabled: boolean;
      panningEnabled: boolean;
      boxSelectionEnabled: boolean;
      autoungrabify: boolean;
    };
    rendering: {
      motionBlur: boolean;
      motionBlurOpacity: number;
      wheelSensitivity: number;
      pixelRatio: number;
    };
  };
}

/**
 * Cytoscape Adapter with Theme Injection
 */
export class CytoscapeAdapter extends BaseVisualizationAdapter<
  CytoscapeNode,
  CytoscapeEdge,
  CytoscapePosition
> {
  private cytoscapeConfig: CytoscapeAdapterConfig["cytoscape"];

  constructor(config: CytoscapeAdapterConfig) {
    super(config);
    this.cytoscapeConfig = config.cytoscape;
  }

  /**
   * Transform core node to Cytoscape node format
   */
  nodeToVisual(node: VisualNodeInstance): CytoscapeNode {
    const categoryColor = this.theme.getCategoryColor(
      node.definition.category as NodeCategory,
    );
    const statusColor = this.theme.getStatusColor(this.getNodeStatus(node));
    const nodeStyles = this.getCytoscapeNodeStyle(node);

    return {
      group: "nodes",
      data: {
        id: node.definition.id,
        label: node.definition.name,
        description: node.definition.description,
        category: node.definition.category,
        type: node.definition.type,

        // Runtime state
        executing: node.executing,
        completed: node.completed,
        hasError: node.hasError,
        hasWarning: node.hasWarning,
        errorMessage: node.errorMessage,
        warningMessage: node.warningMessage,

        // Ports data
        inputs: (node.definition.inputs || []) as CytoscapeNodePort[],
        outputs: (node.definition.outputs || []) as CytoscapeNodePort[],

        // Theme colors
        categoryColor,
        statusColor,
      },
      position: this.positionToVisual(node.position),
      style: nodeStyles,
      classes: this.getCytoscapeNodeClasses(node),
      selected: node.selected,
      locked: false,
      grabbable: true,
      pannable: true,
      selectable: true,
    };
  }

  /**
   * Transform core connection to Cytoscape edge format
   */
  connectionToVisual(connection: VisualConnection): CytoscapeEdge {
    const connectionColor = this.theme.getConnectionColor(
      this.getConnectionStatus(connection),
    );
    const dataTypeColor = connection.metadata?.dataType
      ? this.theme.getPortColor(connection.metadata.dataType as DataType)
      : connectionColor;

    const edgeStyles = this.getCytoscapeEdgeStyle(connection);

    return {
      group: "edges",
      data: {
        id: connection.id,
        source: connection.sourceNodeId,
        target: connection.targetNodeId,
        label: (connection.metadata?.label ||
          connection.metadata?.dataType) as string,

        // Connection metadata
        sourcePort: connection.sourcePortId,
        targetPort: connection.targetPortId,
        dataType: connection.metadata?.dataType as string | undefined,

        // State
        valid: connection.valid,
        flowing: connection.flowing,
        flowDirection: connection.flowDirection,

        // Theme colors
        connectionColor,
        dataTypeColor,
      },
      style: {
        ...edgeStyles,
        "line-color": dataTypeColor,
        "target-arrow-color": dataTypeColor,
        "source-arrow-color": dataTypeColor,
      },
      classes: this.getCytoscapeEdgeClasses(connection),
      selected: connection.selected,
      selectable: true,
    };
  }

  /**
   * Transform Cytoscape node back to core format
   */
  visualToNode(visual: CytoscapeNode): VisualNodeInstance {
    return {
      definition: {
        id: visual.data.id,
        name: visual.data.label,
        description: visual.data.description as string,
        category: visual.data.category as string,
        type: visual.data.type as string,
        inputs: visual.data.inputs || [],
        outputs: visual.data.outputs || [],
      },
      position: this.positionFromVisual(visual.position),
      selected: visual.selected,
      dragging: false, // Cytoscape handles dragging differently
      executing: (visual.data.executing as boolean) || false,
      completed: (visual.data.completed as boolean) || false,
      hasError: (visual.data.hasError as boolean) || false,
      errorMessage: visual.data.errorMessage as string,
      hasWarning: (visual.data.hasWarning as boolean) || false,
      warningMessage: visual.data.warningMessage as string,
    };
  }

  /**
   * Transform Cytoscape edge back to core format
   */
  visualToConnection(visual: CytoscapeEdge): VisualConnection {
    return {
      id: visual.data.id,
      sourceNodeId: visual.data.source,
      targetNodeId: visual.data.target,
      sourcePortId: (visual.data.sourcePort as string) || "",
      targetPortId: (visual.data.targetPort as string) || "",
      metadata: {
        label: visual.data.label,
        dataType: visual.data.dataType,
      },
      animated: false, // Cytoscape uses CSS animations
      selected: visual.selected,
      valid: (visual.data.valid as boolean) ?? true,
      flowing: (visual.data.flowing as boolean) || false,
      flowDirection: visual.data.flowDirection || "forward",
    };
  }

  /**
   * Position conversion
   */
  positionToVisual(position: NodePosition): CytoscapePosition {
    return { x: position.x, y: position.y };
  }

  positionFromVisual(position: CytoscapePosition): NodePosition {
    return { x: position.x, y: position.y };
  }

  /**
   * Connection validation for Cytoscape
   */
  canConnect(
    source: CytoscapeNode,
    target: CytoscapeNode,
    sourceHandle?: string,
    targetHandle?: string,
  ): boolean {
    if (source.data.id === target.data.id) return false;

    const sourceOutputs = source.data.outputs || [];
    const targetInputs = target.data.inputs || [];

    if (sourceOutputs.length === 0 || targetInputs.length === 0) return false;

    // Find matching ports if handles are specified
    if (sourceHandle && targetHandle) {
      const sourcePort = sourceOutputs.find(
        (p: { id: string }) => p.id === sourceHandle,
      );
      const targetPort = targetInputs.find(
        (p: { id: string }) => p.id === targetHandle,
      );

      if (!sourcePort || !targetPort) return false;

      // Check type compatibility
      return (
        sourcePort.dataType === "any" ||
        targetPort.dataType === "any" ||
        sourcePort.dataType === targetPort.dataType
      );
    }

    return true;
  }

  /**
   * Handle node selection changes
   */
  onNodeSelectionChange(
    nodes: CytoscapeNode[],
    callback: (selectedNodes: VisualNodeInstance[]) => void,
  ): void {
    const selectedNodes = nodes
      .filter((node) => node.selected)
      .map((node) => this.visualToNode(node));

    callback(selectedNodes);
  }

  /**
   * Handle connection creation
   */
  onConnectionCreate(
    edge: CytoscapeEdge,
    callback: (connection: VisualConnection) => void,
  ): void {
    const connection = this.visualToConnection(edge);
    callback(connection);
  }

  /**
   * Handle node position changes
   */
  onNodePositionChange(
    nodes: CytoscapeNode[],
    callback: (updates: Array<{ id: string; position: NodePosition }>) => void,
  ): void {
    const updates = nodes.map((node) => ({
      id: node.data.id,
      position: this.positionFromVisual(node.position),
    }));

    callback(updates);
  }

  /**
   * Get Cytoscape-specific node styling
   */
  private getCytoscapeNodeStyle(
    node: VisualNodeInstance,
  ): Record<string, string | number | boolean> {
    const categoryColor = this.theme.getCategoryColor(
      node.definition.category as NodeCategory,
    );
    const statusColor = this.theme.getStatusColor(this.getNodeStatus(node));

    const baseStyle = {
      "background-color": this.theme.colors.background,
      "border-color": node.hasError ? statusColor : categoryColor,
      "border-width": "2px",
      "border-style": "solid",
      color: this.theme.colors.foreground,
      label: "data(label)",
      "text-valign": "center",
      "text-halign": "center",
      "font-size": "12px",
      "font-weight": "bold",
      width: "label",
      height: "label",
      padding: "10px",
      shape: this.getNodeShape(node),
    };

    // State-specific styling
    if (node.selected) {
      baseStyle["border-width"] = "4px";
      (baseStyle as Record<string, string>)["box-shadow"] =
        `0 0 20px ${categoryColor}`;
    }

    if (node.executing) {
      baseStyle["background-color"] = this.addAlpha(statusColor, 0.3);
    } else if (node.completed) {
      baseStyle["background-color"] = this.addAlpha(statusColor, 0.2);
    } else if (node.hasError) {
      baseStyle["background-color"] = this.addAlpha(statusColor, 0.2);
    }

    return baseStyle;
  }

  /**
   * Get Cytoscape-specific edge styling
   */
  private getCytoscapeEdgeStyle(
    connection: VisualConnection,
  ): Record<string, string | number | boolean> {
    const baseStyle = {
      width: connection.selected ? 4 : 2,
      "line-style": connection.valid ? "solid" : "dashed",
      "curve-style": "bezier",
      "target-arrow-shape": "triangle",
      "arrow-scale": 1.2,
      opacity: connection.valid ? 1 : 0.6,
    };

    // Animated connections
    if (connection.animated && this.config.behavior.enableAnimations) {
      baseStyle["line-style"] = "dashed";
      (baseStyle as Record<string, string | number>)["line-dash-pattern"] =
        "[6, 3]";
    }

    // Flowing connections
    if (connection.flowing) {
      (baseStyle as Record<string, string | number>)[
        "line-gradient-direction"
      ] = connection.flowDirection === "backward" ? "to-source" : "to-target";
      (baseStyle as Record<string, string | number>)[
        "line-gradient-stop-colors"
      ] = `${this.theme.colors.primary} ${this.theme.colors.accent}`;
    }

    return baseStyle;
  }

  /**
   * Get node shape based on category
   */
  private getNodeShape(node: VisualNodeInstance): string {
    switch (node.definition.category) {
      case "input":
        return "round-rectangle";
      case "output":
        return "round-diamond";
      case "processor":
        return "rectangle";
      case "control":
        return "hexagon";
      case "utility":
        return "round-octagon";
      default:
        return "ellipse";
    }
  }

  /**
   * Get CSS classes for Cytoscape node
   */
  private getCytoscapeNodeClasses(node: VisualNodeInstance): string {
    const classes = [
      "atomiton-node",
      `category-${node.definition.category}`,
      `type-${node.definition.type}`,
    ];

    if (node.hasError) classes.push("has-error");
    if (node.hasWarning) classes.push("has-warning");
    if (node.executing) classes.push("executing");
    if (node.completed) classes.push("completed");
    if (node.selected) classes.push("selected");

    return classes.join(" ");
  }

  /**
   * Get CSS classes for Cytoscape edge
   */
  private getCytoscapeEdgeClasses(connection: VisualConnection): string {
    const classes = ["atomiton-edge"];

    if (!connection.valid) classes.push("invalid");
    if (connection.selected) classes.push("selected");
    if (connection.flowing) classes.push("flowing");
    if (connection.animated) classes.push("animated");

    return classes.join(" ");
  }

  /**
   * Adapt a node package for Cytoscape
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

  /**
   * Generate Cytoscape stylesheet from theme
   */
  generateStylesheet(): Array<{
    selector: string;
    style: Record<string, string | number>;
  }> {
    return [
      {
        selector: "node",
        style: {
          "transition-property": "background-color, border-color, border-width",
          "transition-duration": "0.2s",
          "transition-timing-function": "ease-in-out",
        },
      },
      {
        selector: "edge",
        style: {
          "transition-property": "line-color, width, opacity",
          "transition-duration": "0.2s",
          "transition-timing-function": "ease-in-out",
        },
      },
      {
        selector: ".executing",
        style: {
          "animation-name": "pulse",
          "animation-duration": "1.5s",
          "animation-iteration-count": "infinite",
        },
      },
      {
        selector: ".flowing",
        style: {
          "animation-name": "flow",
          "animation-duration": "2s",
          "animation-iteration-count": "infinite",
        },
      },
    ];
  }
}

/**
 * Factory function to create Cytoscape adapter with theme injection
 */
export function createCytoscapeAdapter(
  theme: AdapterTheme,
  overrides?: Partial<CytoscapeAdapterConfig>,
): CytoscapeAdapter {
  const defaultConfig: CytoscapeAdapterConfig = {
    theme,
    behavior: {
      snapToGrid: false,
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
      maximumZoom: 3.0,
      defaultZoom: 1.0,
      fitViewPadding: 50,
      connectionCurvature: 0.25,
    },
    performance: {
      enableVirtualization: false, // Cytoscape handles this internally
      virtualizationThreshold: 10000,
      renderThrottleMs: 16,
      batchUpdates: true,
    },
    accessibility: {
      enableKeyboardNavigation: true,
      enableScreenReader: true,
      highContrastMode: false,
      focusIndicatorStyle: "glow",
    },
    cytoscape: {
      layout: {
        name: "preset",
        animate: true,
        animationDuration: 500,
        fit: true,
        padding: 50,
      },
      interaction: {
        minZoom: 0.1,
        maxZoom: 3.0,
        zoomingEnabled: true,
        panningEnabled: true,
        boxSelectionEnabled: true,
        autoungrabify: false,
      },
      rendering: {
        motionBlur: true,
        motionBlurOpacity: 0.2,
        wheelSensitivity: 1,
        pixelRatio: window.devicePixelRatio || 1,
      },
    },
  };

  const config = { ...defaultConfig, ...overrides };
  return new CytoscapeAdapter(config);
}

export default CytoscapeAdapter;
