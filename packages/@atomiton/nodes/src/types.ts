/**
 * Node Package Type Definitions
 * Central location for all node-related types
 */

export type NodeExecutionContext = {
  /** Node instance ID */
  nodeId: string;

  /** Composite ID for context */
  compositeId?: string;

  /** Input data from connected ports */
  inputs: Record<string, unknown>;

  /** Node parameters */
  parameters?: Record<string, unknown>;

  /** Workspace root directory */
  workspaceRoot?: string;

  /** Temporary directory for execution */
  tempDirectory?: string;

  /** Execution start time */
  startTime: Date;

  /** Execution limits and constraints */
  limits: {
    /** Maximum execution time in milliseconds */
    maxExecutionTimeMs: number;
    /** Maximum memory usage in MB */
    maxMemoryMB?: number;
    /** Maximum disk space in MB */
    maxDiskSpaceMB?: number;
  };

  /** Progress reporting function */
  reportProgress: (progress: number, message?: string) => void;

  /** Log message functions */
  log: {
    debug?: (message: string, data?: Record<string, unknown>) => void;
    info?: (message: string, data?: Record<string, unknown>) => void;
    warn?: (message: string, data?: Record<string, unknown>) => void;
    error?: (message: string, data?: Record<string, unknown>) => void;
  };

  /** Whether to stop execution on first error (for composite nodes) */
  stopOnError?: boolean;

  /** Results from previously executed nodes (for composite nodes) */
  previousResults?: Record<string, NodeExecutionResult>;

  /** Abort signal for cancellation */
  abortSignal?: AbortSignal;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
};

export type NodeExecutionResult = {
  /** Whether execution succeeded */
  success: boolean;

  /** Output data for connected ports */
  outputs?: Record<string, unknown>;

  /** Error message if execution failed */
  error?: string;

  /** Additional metadata about the execution */
  metadata?: Record<string, unknown>;

  /** Performance metrics */
  metrics?: {
    executionTime: number;
    memoryUsed?: number;
  };
};

import type { PortType, PortDataType } from "./base/types";

export type NodePortDefinition = {
  /** Unique port identifier */
  id: string;

  /** Display name for the port */
  name: string;

  /** Port type (input/output) */
  type: PortType;

  /** Data type for this port */
  dataType: PortDataType;

  /** Whether this port is required */
  required?: boolean;

  /** Whether this port accepts multiple connections */
  multiple?: boolean;

  /** Description of what this port does */
  description?: string;

  /** Default value for this port */
  defaultValue?: unknown;
};

export type NodeDefinition = {
  /** Unique node type identifier */
  id: string;

  /** Display name for the node */
  name: string;

  /** Node description */
  description?: string;

  /** Node category for organization */
  category: string;

  /** Node type for runtime identification */
  type: string;

  /** Version of this node definition */
  version?: string;

  /** Input port definitions */
  inputPorts?: NodePortDefinition[];

  /** Output port definitions */
  outputPorts?: NodePortDefinition[];

  /** Icon identifier for UI */
  icon?: string;

  /** Default configuration for this node */
  defaultConfig?: Record<string, unknown>;

  /** Configuration schema for UI form generation */
  configSchema?: Record<string, unknown>;

  /** Execute function for the node */
  execute?: (
    context: NodeExecutionContext,
    config?: Record<string, unknown>,
  ) => Promise<NodeExecutionResult>;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
};
