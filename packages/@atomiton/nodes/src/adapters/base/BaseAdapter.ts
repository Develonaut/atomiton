/**
 * Abstract Base Visualization Adapter with Theme Injection Support
 *
 * Provides common functionality for all visualization adapters while
 * maintaining complete theme flexibility through injection pattern.
 *
 * ARCHITECTURAL PRINCIPLES:
 * - Theme is injected, never hardcoded
 * - Common styling logic shared across adapters
 * - Library-specific implementations remain focused
 * - Full type safety with theme system
 */

import type {
  IVisualizationAdapter,
  AdapterConfig,
  AdapterTheme,
  VisualNodeInstance,
  VisualConnection,
  NodePosition,
  NodeStatus,
  ConnectionStatus,
  NodeCategory,
  DataType,
} from "./IVisualizationAdapter";

/**
 * Abstract base adapter with theme-aware common functionality
 */
export abstract class BaseVisualizationAdapter<
  TVisualNode,
  TVisualEdge,
  TPosition = NodePosition,
> implements IVisualizationAdapter<TVisualNode, TVisualEdge, TPosition>
{
  protected config: AdapterConfig;
  protected theme: AdapterTheme;

  constructor(config: AdapterConfig) {
    this.config = config;
    this.theme = config.theme;
  }

  // Abstract methods that must be implemented by specific adapters
  abstract nodeToVisual(node: VisualNodeInstance): TVisualNode;
  abstract connectionToVisual(connection: VisualConnection): TVisualEdge;
  abstract visualToNode(visual: TVisualNode): VisualNodeInstance;
  abstract visualToConnection(visual: TVisualEdge): VisualConnection;
  abstract positionToVisual(position: NodePosition): TPosition;
  abstract positionFromVisual(position: TPosition): NodePosition;
  abstract canConnect(
    source: TVisualNode,
    target: TVisualNode,
    sourceHandle?: string,
    targetHandle?: string,
  ): boolean;
  abstract onNodeSelectionChange(
    nodes: TVisualNode[],
    callback: (selectedNodes: VisualNodeInstance[]) => void,
  ): void;
  abstract onConnectionCreate(
    connection: TVisualEdge,
    callback: (connection: VisualConnection) => void,
  ): void;
  abstract onNodePositionChange(
    nodes: TVisualNode[],
    callback: (updates: Array<{ id: string; position: NodePosition }>) => void,
  ): void;
  abstract adaptNode(nodePackage: unknown): Promise<{
    type: string;
    component: unknown;
    metadata: Record<string, unknown>;
  }>;

  /**
   * Get theme-aware node styling
   */
  getNodeStyling(
    node: VisualNodeInstance,
  ): Record<string, string | number | boolean> {
    const status = this.getNodeStatus(node);
    const categoryColor = this.theme.getCategoryColor(
      node.definition.category as NodeCategory,
    );
    const statusColor = this.theme.getStatusColor(status);

    const baseStyles = {
      // Base theme colors
      backgroundColor: this.theme.colors.background,
      color: this.theme.colors.foreground,
      borderColor: categoryColor,

      // Typography
      fontSize: this.theme.typography.fontSize.sm,
      fontWeight: this.theme.typography.fontWeight.medium,
      lineHeight: this.theme.typography.lineHeight.normal,

      // Spacing
      padding: this.theme.spacing.md,

      // Border radius
      borderRadius: this.theme.radius.md,

      // Base border
      borderWidth: "2px",
      borderStyle: "solid",

      // Transitions for smooth interactions
      transition: "all 0.2s ease-in-out",
    };

    // Status-based styling using theme colors
    if (status !== "idle") {
      baseStyles.borderColor = statusColor;

      // Add subtle background tint for non-idle states
      baseStyles.backgroundColor = this.addAlpha(statusColor, 0.1);
    }

    // Selection styling
    if (node.selected) {
      (baseStyles as Record<string, unknown>).boxShadow =
        this.theme.shadows.glow(categoryColor);
      baseStyles.borderColor = categoryColor;
    }

    // Execution animation
    if (node.executing && this.config.behavior.enableAnimations) {
      (baseStyles as Record<string, unknown>).animation = "pulse 1.5s infinite";
    }

    return baseStyles;
  }

  /**
   * Get theme-aware connection styling
   */
  getConnectionStyling(
    connection: VisualConnection,
  ): Record<string, string | number | boolean> {
    const status = this.getConnectionStatus(connection);
    const connectionColor = this.theme.getConnectionColor(status);

    const baseStyles = {
      // Base connection styling
      stroke: connectionColor,
      strokeWidth: connection.selected ? 3 : 2,
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
      fill: "none",

      // Smooth transitions
      transition: "all 0.2s ease-in-out",
    };

    // Animated connections
    if (connection.animated && this.config.behavior.enableAnimations) {
      (baseStyles as Record<string, unknown>).strokeDasharray = "8,4";
      (baseStyles as Record<string, unknown>).animation =
        "dash 2s linear infinite";
    }

    // Data flowing animation
    if (connection.flowing && this.config.behavior.enableAnimations) {
      const flowDirection = connection.flowDirection || "forward";
      (baseStyles as Record<string, unknown>).animation =
        `flow-${flowDirection} 1s ease-in-out infinite`;
    }

    // Invalid connections
    if (!connection.valid) {
      (baseStyles as Record<string, unknown>).strokeDasharray = "4,4";
      (baseStyles as Record<string, unknown>).opacity = 0.6;
    }

    return baseStyles;
  }

  /**
   * Update the injected theme and refresh styling
   */
  updateTheme(theme: AdapterTheme): void {
    this.theme = theme;
    this.config.theme = theme;

    // Trigger re-render if needed
    this.onThemeUpdate();
  }

  /**
   * Update adapter configuration
   */
  updateConfig(updates: Partial<AdapterConfig>): void {
    this.config = { ...this.config, ...updates };

    // Update theme if provided
    if (updates.theme) {
      this.theme = updates.theme;
    }
  }

  /**
   * Get node status based on current state
   */
  protected getNodeStatus(node: VisualNodeInstance): NodeStatus {
    if (node.hasError) return "error";
    if (node.hasWarning) return "warning";
    if (node.executing) return "executing";
    if (node.completed) return "completed";
    return "idle";
  }

  /**
   * Get connection status based on current state
   */
  protected getConnectionStatus(
    connection: VisualConnection,
  ): ConnectionStatus {
    if (connection.selected) return "selected";
    if (!connection.valid) return "invalid";
    if (connection.validationResult?.level === "warning") return "warning";
    return "valid";
  }

  /**
   * Add alpha transparency to a color
   */
  protected addAlpha(color: string, alpha: number): string {
    // Handle hex colors
    if (color.startsWith("#")) {
      const hex = color.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Handle rgb colors
    if (color.startsWith("rgb(")) {
      return color.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
    }

    // Handle rgba colors
    if (color.startsWith("rgba(")) {
      const parts = color.match(/[\d.]+/g);
      if (parts && parts.length >= 3) {
        return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
      }
    }

    // Fallback - return color as is
    return color;
  }

  /**
   * Get computed style for a specific element type
   */
  protected getElementStyle(
    type: "node" | "port" | "handle" | "label",
    context: { dataType?: DataType } = {},
  ): Record<string, string | number | boolean> {
    switch (type) {
      case "port":
        return {
          width: "12px",
          height: "12px",
          borderRadius: this.theme.radius.full,
          backgroundColor: context.dataType
            ? this.theme.getPortColor(context.dataType)
            : this.theme.colors.muted,
          border: `2px solid ${this.theme.colors.background}`,
          boxShadow: this.theme.shadows.sm,
        };

      case "handle":
        return {
          width: "8px",
          height: "8px",
          backgroundColor: this.theme.colors.accent,
          border: "none",
          borderRadius: this.theme.radius.full,
        };

      case "label":
        return {
          fontSize: this.theme.typography.fontSize.xs,
          fontWeight: this.theme.typography.fontWeight.medium,
          color: this.theme.colors.muted,
          backgroundColor: this.addAlpha(this.theme.colors.background, 0.9),
          padding: `${this.theme.spacing.xs} ${this.theme.spacing.sm}`,
          borderRadius: this.theme.radius.sm,
          boxShadow: this.theme.shadows.sm,
        };

      default:
        return {};
    }
  }

  /**
   * Hook for theme update - can be overridden by specific adapters
   */
  protected onThemeUpdate(): void {
    // Override in specific adapters if needed
  }

  /**
   * Generate CSS animations for the adapter
   */
  generateAnimationCSS(): string {
    if (!this.config.behavior.enableAnimations) {
      return "";
    }

    return `
      @keyframes pulse {
        0% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.02); }
        100% { opacity: 1; transform: scale(1); }
      }
      
      @keyframes dash {
        0% { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: 24; }
      }
      
      @keyframes flow-forward {
        0% { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: -20; }
      }
      
      @keyframes flow-backward {
        0% { stroke-dashoffset: -20; }
        100% { stroke-dashoffset: 0; }
      }
      
      @keyframes flow-bidirectional {
        0% { stroke-dashoffset: 0; }
        50% { stroke-dashoffset: -10; }
        100% { stroke-dashoffset: 0; }
      }
    `;
  }
}
