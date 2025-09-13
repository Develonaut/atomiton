import type {
  Node,
  Edge,
  Connection,
  OnNodesChange,
  OnEdgesChange,
  ReactFlowInstance,
  Viewport,
} from "@xyflow/react";

/**
 * Base props for styled components
 */
export type StyleProps = {
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Props for the root Canvas component
 */
export type CanvasProps = {
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
   * Called when viewport moves or zooms
   */
  onMove?: (event: MouseEvent | TouchEvent | null, viewport: Viewport) => void;
  /**
   * Custom node types to use in the canvas
   */
  nodeTypes?: Record<string, React.ComponentType<unknown>>;
} & StyleProps;

/**
 * Props for Canvas.Viewport sub-component
 */
export type CanvasViewportProps = {
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
} & StyleProps;

/**
 * Props for Canvas.Grid sub-component
 */
export type CanvasGridProps = {
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
} & StyleProps;

/**
 * Props for Canvas.Nodes sub-component
 */
export type CanvasNodesProps = {
  className?: string;
  /**
   * Custom node renderer
   */
  renderNode?: (node: Node) => React.ReactNode;
  /**
   * Whether nodes are selectable
   */
  selectable?: boolean;
  /**
   * Whether nodes are draggable
   */
  draggable?: boolean;
} & StyleProps;

/**
 * Props for Canvas.Connections sub-component
 */
export type CanvasConnectionsProps = {
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
} & StyleProps;

/**
 * Props for Canvas.Controls sub-component
 */
export type CanvasControlsProps = {
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
} & StyleProps;

/**
 * Props for Canvas.Minimap sub-component
 */
export type CanvasMinimapProps = {
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
} & StyleProps;

/**
 * Props for Canvas.Selection sub-component
 */
export type CanvasSelectionProps = {
  className?: string;
  /**
   * Whether selection is enabled
   */
  enabled?: boolean;
  /**
   * Selection mode
   */
  mode?: "partial" | "full";
} & StyleProps;

/**
 * Props for control action components
 */
export type CanvasControlActionProps = {
  /**
   * Called when the action is triggered
   */
  onAction?: () => void;
  onClick?: () => void;
};
