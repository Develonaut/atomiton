import type {
  Node,
  Edge,
  Connection,
  OnNodesChange,
  OnEdgesChange,
  ReactFlowInstance,
} from "@xyflow/react";
import type { StyleProps } from "@/types";

/**
 * Props for the root Canvas component
 */
export interface CanvasProps extends StyleProps {
  children?: React.ReactNode;
  className?: string;
  /**
   * Initial nodes to render
   */
  nodes?: Node[];
  /**
   * Initial edges to render
   */
  edges?: Edge[];
  /**
   * Called when nodes change (move, select, delete, etc.)
   */
  onNodesChange?: OnNodesChange<Node>;
  /**
   * Called when edges change (add, delete, etc.)
   */
  onEdgesChange?: OnEdgesChange<Edge>;
  /**
   * Called when a new connection is made
   */
  onConnect?: (connection: Connection) => void;
  /**
   * Called when a node is clicked
   */
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  /**
   * Called when the canvas background is clicked
   */
  onPaneClick?: (event: React.MouseEvent) => void;
  /**
   * Called when something is dropped on the canvas
   */
  onDrop?: (event: React.DragEvent) => void;
  /**
   * Called when dragging over the canvas
   */
  onDragOver?: (event: React.DragEvent) => void;
  /**
   * Whether to fit the view to nodes on mount
   */
  fitView?: boolean;
  /**
   * Options for fit view
   */
  fitViewOptions?: Record<string, unknown>;
  /**
   * Flow instance
   */
  flowInstance?: ReactFlowInstance;
  /**
   * Called when flow is initialized
   */
  onInit?: (instance: ReactFlowInstance) => void;
  /**
   * Custom node types to use in the canvas
   */
  nodeTypes?: Record<string, React.ComponentType<unknown>>;
}

/**
 * Props for Canvas.Viewport sub-component
 */
export interface CanvasViewportProps extends StyleProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Whether panning is enabled
   */
  panOnScroll?: boolean;
  /**
   * Whether selection is enabled
   */
  selectionOnDrag?: boolean;
  /**
   * Zoom on scroll behavior
   */
  zoomOnScroll?: boolean;
  /**
   * Zoom on pinch behavior
   */
  zoomOnPinch?: boolean;
  /**
   * Zoom on double click behavior
   */
  zoomOnDoubleClick?: boolean;
  /**
   * Minimum zoom level
   */
  minZoom?: number;
  /**
   * Maximum zoom level
   */
  maxZoom?: number;
  /**
   * Default zoom level
   */
  defaultZoom?: number;
  /**
   * Pan on drag behavior
   */
  panOnDrag?: boolean;
  /**
   * Prevent scrolling behavior
   */
  preventScrolling?: boolean;
}

/**
 * Props for Canvas.Grid sub-component
 */
export interface CanvasGridProps extends StyleProps {
  className?: string;
  /**
   * Grid variant type
   */
  variant?: "dots" | "lines" | "cross";
  /**
   * Gap between grid points/lines
   */
  gap?: number;
  /**
   * Size of grid dots
   */
  size?: number;
  /**
   * Grid color
   */
  color?: string;
}

/**
 * Props for Canvas.Elements sub-component
 */
export interface CanvasElementsProps extends StyleProps {
  className?: string;
  /**
   * Custom element renderer
   */
  renderElement?: (node: Node) => React.ReactNode;
  /**
   * Whether elements are selectable
   */
  selectable?: boolean;
  /**
   * Whether elements are draggable
   */
  draggable?: boolean;
}

/**
 * Props for Canvas.Connections sub-component
 */
export interface CanvasConnectionsProps extends StyleProps {
  className?: string;
  /**
   * Custom connection renderer
   */
  renderConnection?: (edge: Edge) => React.ReactNode;
  /**
   * Connection line type
   */
  connectionLineType?:
    | "default"
    | "straight"
    | "step"
    | "smoothstep"
    | "bezier";
  /**
   * Whether connections are selectable
   */
  selectable?: boolean;
}

/**
 * Props for Canvas.Controls sub-component
 */
export interface CanvasControlsProps extends StyleProps {
  className?: string;
  /**
   * Whether to show zoom in button
   */
  showZoomIn?: boolean;
  /**
   * Whether to show zoom out button
   */
  showZoomOut?: boolean;
  /**
   * Whether to show fit view button
   */
  showFitView?: boolean;
  /**
   * Whether to show interactive button
   */
  showInteractive?: boolean;
  /**
   * Placement of controls in the canvas
   */
  placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

/**
 * Props for Canvas.Minimap sub-component
 */
export interface CanvasMinimapProps extends StyleProps {
  className?: string;
  /**
   * Whether to show the minimap
   */
  show?: boolean;
  /**
   * Placement of minimap in the canvas
   */
  placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  /**
   * Node color function
   */
  nodeColor?: (node: Node) => string;
  /**
   * Node stroke color function
   */
  nodeStrokeColor?: (node: Node) => string;
  /**
   * Node border radius
   */
  nodeBorderRadius?: number;
}

/**
 * Props for Canvas.Selection sub-component
 */
export interface CanvasSelectionProps extends StyleProps {
  className?: string;
  /**
   * Whether selection is enabled
   */
  enabled?: boolean;
  /**
   * Selection mode
   */
  mode?: "partial" | "full";
}

/**
 * Props for control action components
 */
export interface CanvasControlActionProps {
  /**
   * Called when the action is triggered
   */
  onAction?: () => void;
  onClick?: () => void;
}
