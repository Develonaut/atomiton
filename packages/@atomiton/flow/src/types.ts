import type { CSSProperties } from "react";

/**
 * Base interface for all executable entities (nodes and flows)
 */
export type Executable = {
  id: string;
  type: string;
  version: string;
  metadata?: ExecutableMetadata;
};

/**
 * Metadata common to all executable entities
 */
export type ExecutableMetadata = {
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  tags?: string[];
};

/**
 * Position in 2D space for visual representation
 */
export type Position = {
  x: number;
  y: number;
};

/**
 * A single node that performs a specific operation
 */
export type FlowNode = {
  label: string;
  position: Position;
  config: Record<string, unknown>;
  inputs?: PortDefinition[];
  outputs?: PortDefinition[];
} & Executable;

/**
 * Port definition for node inputs/outputs
 */
export type PortDefinition = {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  multiple?: boolean;
};

/**
 * Edge between nodes
 */
export type Edge = {
  id: string;
  source: string;
  target: string;
  type?: "default" | "straight" | "step" | "smoothstep" | string;
  sourceHandle?: string;
  targetHandle?: string;
  animated?: boolean;
  hidden?: boolean;
  selected?: boolean;
  data?: Record<string, unknown>;
  markerStart?: EdgeMarker;
  markerEnd?: EdgeMarker;
  style?: CSSProperties;
  label?: string;
};

/**
 * Edge marker configuration
 */
export type EdgeMarker = {
  type: "arrow" | "arrowclosed" | string;
  color?: string;
  width?: number;
  height?: number;
  markerUnits?: string;
  orient?: string;
  strokeWidth?: number;
};

/**
 * A flow is a composite node containing other nodes and their edges
 */
export type Flow = {
  type: "flow";
  label: string;
  nodes: FlowNode[];
  edges: Edge[];
  variables?: Record<string, unknown>;
  metadata?: FlowMetadata;
} & Executable;

/**
 * Extended metadata for flows
 */
export type FlowMetadata = {
  author?: string;
  version?: string;
  entryNodeId?: string;
  exitNodeIds?: string[];
} & ExecutableMetadata;

/**
 * Execution context passed through the flow
 */
export type ExecutionContext = {
  flowId: string;
  executionId: string;
  variables: Record<string, unknown>;
  input: unknown;
  output?: unknown;
  errors: ExecutionError[];
  startTime: Date;
  endTime?: Date;
  status: ExecutionStatus;
};

/**
 * Execution status
 */
export type ExecutionStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

/**
 * Execution error
 */
export type ExecutionError = {
  nodeId?: string;
  message: string;
  timestamp: Date;
  stack?: string;
};

/**
 * Result of executing a node or flow
 */
export type ExecutionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: ExecutionError;
  duration?: number;
};

/**
 * Function signature for node execution
 */
export type NodeExecutor<TInput = unknown, TOutput = unknown> = (
  input: TInput,
  context: ExecutionContext,
) => Promise<ExecutionResult<TOutput>> | ExecutionResult<TOutput>;

/**
 * Function signature for flow execution
 */
export type FlowExecutor<TInput = unknown, TOutput = unknown> = (
  flow: Flow,
  input: TInput,
  context?: Partial<ExecutionContext>,
) => Promise<ExecutionResult<TOutput>>;

/**
 * Options for creating a flow
 */
export type CreateFlowOptions = {
  id?: string;
  label: string;
  version?: string;
  nodes?: FlowNode[];
  edges?: Edge[];
  variables?: Record<string, unknown>;
  metadata?: Partial<FlowMetadata>;
};

/**
 * Options for creating a node
 */
export type CreateNodeOptions = {
  id?: string;
  type: string;
  label: string;
  version?: string;
  position: Position;
  config?: Record<string, unknown>;
  inputs?: PortDefinition[];
  outputs?: PortDefinition[];
  metadata?: Partial<ExecutableMetadata>;
};

/**
 * Options for creating an edge
 */
export type CreateEdgeOptions = {
  id?: string;
  source: string;
  target: string;
  type?: "default" | "straight" | "step" | "smoothstep" | string;
  sourceHandle?: string;
  targetHandle?: string;
  animated?: boolean;
  hidden?: boolean;
  selected?: boolean;
  data?: Record<string, unknown>;
  markerStart?: EdgeMarker;
  markerEnd?: EdgeMarker;
  style?: CSSProperties;
  label?: string;
};
