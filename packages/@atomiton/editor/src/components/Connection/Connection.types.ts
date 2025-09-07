// import type { Edge, EdgeLabelRenderer } from "@xyflow/react";
import type { StyleProps } from "@/types";

/**
 * Connection line types
 */
export type ConnectionType =
  | "default"
  | "straight"
  | "step"
  | "smoothstep"
  | "bezier";

/**
 * Connection state for visual feedback
 */
export type ConnectionState = "idle" | "selected" | "connecting" | "error";

/**
 * Arrow/marker types
 */
export type ArrowType = "arrow" | "arrowclosed" | "dot" | "none";

/**
 * Props for the root Connection component
 */
export interface ConnectionProps extends StyleProps {
  className?: string;
  children?: React.ReactNode;
  /**
   * Connection unique identifier
   */
  id: string;
  /**
   * Source element/port ID
   */
  source: string;
  /**
   * Target element/port ID
   */
  target: string;
  /**
   * Source handle/port ID
   */
  sourceHandle?: string;
  /**
   * Target handle/port ID
   */
  targetHandle?: string;
  /**
   * Connection type/style
   */
  type?: ConnectionType;
  /**
   * Connection state
   */
  state?: ConnectionState;
  /**
   * Whether the connection is selected
   */
  selected?: boolean;
  /**
   * Whether the connection is animated
   */
  animated?: boolean;
  /**
   * Connection label
   */
  label?: React.ReactNode;
  /**
   * Connection data
   */
  data?: Record<string, unknown>;
  /**
   * Custom connection style
   */
  style?: React.CSSProperties;
  /**
   * Marker/arrow configuration
   */
  markerEnd?: ArrowType;
  /**
   * Marker/arrow configuration for start
   */
  markerStart?: ArrowType;
  /**
   * Called when connection is clicked
   */
  onClick?: (event: React.MouseEvent, connection: ConnectionProps) => void;
  /**
   * Called when connection is double-clicked
   */
  onDoubleClick?: (
    event: React.MouseEvent,
    connection: ConnectionProps,
  ) => void;
}

/**
 * Props for Connection.Path sub-component
 */
export interface ConnectionPathProps extends StyleProps {
  className?: string;
  /**
   * SVG path data
   */
  path: string;
  /**
   * Connection type for styling
   */
  type?: ConnectionType;
  /**
   * Connection state
   */
  state?: ConnectionState;
  /**
   * Whether the path is selected
   */
  selected?: boolean;
  /**
   * Whether the path is animated
   */
  animated?: boolean;
  /**
   * Custom path style
   */
  style?: React.CSSProperties;
  /**
   * Stroke width
   */
  strokeWidth?: number;
  /**
   * Stroke color
   */
  strokeColor?: string;
}

/**
 * Props for Connection.Label sub-component
 */
export interface ConnectionLabelProps extends StyleProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Label position along the connection (0-1)
   */
  labelPosition?: number;
  /**
   * Label background style
   */
  background?: "transparent" | "solid" | "rounded";
  /**
   * Whether the label is editable
   */
  editable?: boolean;
  /**
   * Called when label is edited
   */
  onEdit?: (newLabel: string) => void;
}

/**
 * Props for Connection.Arrow sub-component
 */
export interface ConnectionArrowProps extends StyleProps {
  className?: string;
  /**
   * Arrow type/style
   */
  type?: ArrowType;
  /**
   * Arrow position (start or end)
   */
  arrowPosition?: "start" | "end";
  /**
   * Arrow size
   */
  size?: "sm" | "md" | "lg";
  /**
   * Arrow color
   */
  color?: string;
}

/**
 * Props for Connection.Handle sub-component
 */
export interface ConnectionHandleProps extends StyleProps {
  className?: string;
  /**
   * Handle position along the connection (0-1)
   */
  handlePosition?: number;
  /**
   * Handle type/purpose
   */
  type?: "move" | "split" | "delete";
  /**
   * Whether the handle is visible
   */
  visible?: boolean;
  /**
   * Called when handle is used
   */
  onAction?: (type: ConnectionHandleProps["type"]) => void;
}
