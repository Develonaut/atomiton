// import type { Node, Handle } from "@xyflow/react";
import type { StyleProps } from "@/types";

/**
 * Standard size values using t-shirt sizing
 */
export type Size = "sm" | "md" | "lg";

/**
 * Port types for element connections
 */
export type PortType = "input" | "output";

/**
 * Port position around element
 */
export type PortPosition = "top" | "right" | "bottom" | "left";

/**
 * Element state for visual feedback
 */
export type ElementState = "idle" | "selected" | "connecting" | "error";

/**
 * Props for the root Element component
 */
export interface ElementProps extends StyleProps {
  children?: React.ReactNode;
  className?: string;
  /**
   * Element unique identifier
   */
  id: string;
  /**
   * Element type (for rendering different element types)
   */
  type?: string;
  /**
   * Element title/label
   */
  title?: string;
  /**
   * Element description or content
   */
  content?: React.ReactNode;
  /**
   * Element size
   */
  size?: Size;
  /**
   * Element current state
   */
  state?: ElementState;
  /**
   * Whether the element is selected
   */
  selected?: boolean;
  /**
   * Whether the element is draggable
   */
  draggable?: boolean;
  /**
   * Whether the element is selectable
   */
  selectable?: boolean;
  /**
   * Element data (passed through from React Flow)
   */
  data?: Record<string, unknown>;
  /**
   * Called when element is clicked
   */
  onClick?: (event: React.MouseEvent, element: ElementProps) => void;
  /**
   * Called when element is double-clicked
   */
  onDoubleClick?: (event: React.MouseEvent, element: ElementProps) => void;
}

/**
 * Props for Element.Container sub-component
 */
export interface ElementContainerProps extends StyleProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Container size
   */
  size?: Size;
  /**
   * Element state for styling
   */
  state?: ElementState;
  /**
   * Whether the container is selected
   */
  selected?: boolean;
}

/**
 * Props for Element.Body sub-component
 */
export interface ElementBodyProps extends StyleProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Body padding size
   */
  padding?: Size;
}

/**
 * Props for Element.Header sub-component
 */
export interface ElementHeaderProps extends StyleProps {
  children?: React.ReactNode;
  className?: string;
  /**
   * Header title text
   */
  title?: string;
  /**
   * Optional icon to display
   */
  icon?: React.ReactNode;
  /**
   * Optional actions (buttons, etc.)
   */
  actions?: React.ReactNode;
}

/**
 * Props for Element.Ports sub-component
 */
export interface ElementPortsProps extends StyleProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Side of element where ports are positioned
   */
  side?: PortPosition;
}

/**
 * Props for Element.Port sub-component
 */
export interface ElementPortProps extends StyleProps {
  className?: string;
  /**
   * Port unique identifier
   */
  id: string;
  /**
   * Port type (input/output)
   */
  type: PortType;
  /**
   * Port position around element
   */
  portPosition: PortPosition;
  /**
   * Port label/name
   */
  label?: string;
  /**
   * Whether the port is connected
   */
  connected?: boolean;
  /**
   * Port data type (for validation)
   */
  dataType?: string;
  /**
   * Whether the port is required
   */
  required?: boolean;
  /**
   * Called when connection is made
   */
  onConnect?: (portId: string) => void;
  /**
   * Called when connection is removed
   */
  onDisconnect?: (portId: string) => void;
}

/**
 * Props for Element.Badge sub-component
 */
export interface ElementBadgeProps extends StyleProps {
  children?: React.ReactNode;
  className?: string;
  /**
   * Badge variant/type
   */
  variant?: "status" | "count" | "warning" | "error" | "success";
  /**
   * Badge position on element
   */
  badgePosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  /**
   * Badge size
   */
  size?: Size;
}

/**
 * Props for Element.Overlay sub-component
 */
export interface ElementOverlayProps extends StyleProps {
  className?: string;
  /**
   * Whether the overlay is visible
   */
  visible?: boolean;
  /**
   * Overlay type for different visual states
   */
  type?: "selection" | "hover" | "connecting" | "error";
  /**
   * Overlay content (for hover tooltips, etc.)
   */
  content?: React.ReactNode;
}
