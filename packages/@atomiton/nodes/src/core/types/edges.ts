/**
 * Node Edge Types
 * Edge connections between nodes in group workflows
 */

export type NodeEdgeType = "bezier" | "straight" | "step" | "smoothstep";

export type NodeEdge = {
  /** Unique id of an edge */
  id: string;

  /** Type of edge defined in `edgeTypes` */
  type?: NodeEdgeType;

  /** Id of source node */
  source: string;

  /** Id of target node */
  target: string;

  /** Id of source handle (only needed if multiple handles per node) */
  sourceHandle?: string | null;

  /** Id of target handle (only needed if multiple handles per node) */
  targetHandle?: string | null;

  /** Visual and behavior properties */
  animated?: boolean;
  hidden?: boolean;
  deletable?: boolean;
  selectable?: boolean;
  selected?: boolean;

  /** Z-index for layering */
  zIndex?: number;

  /** Accessibility */
  ariaLabel?: string;

  /** Arbitrary data passed to an edge */
  data?: Record<string, unknown>;
};
