/**
 * Event types for IPC communication between desktop and client
 *
 * These types define the contract for real-time event data sent over IPC.
 * Both desktop (sender) and client (receiver) must use these types to ensure
 * compile-time type safety across the process boundary.
 */

import type { NodeExecutionState } from "#execution/executionGraphStore";

/**
 * Snapshot of a node's state during execution
 */
export type ProgressNodeSnapshot = {
  id: string;
  name: string;
  state: NodeExecutionState;
  duration?: number;
  error?: string;
};

/**
 * Execution graph metadata and structure
 */
export type ProgressGraphMetadata = {
  /** Order in which nodes should/will be executed (grouped by parallelizable sets) */
  executionOrder: string[][];

  /** Critical path through the execution graph (longest dependency chain) */
  criticalPath: string[];

  /** Total weight of all nodes in the graph */
  totalWeight: number;

  /** Maximum number of nodes that can execute in parallel */
  maxParallelism: number;

  /** Edges representing dependencies between nodes */
  edges: Array<{ from: string; to: string }>;
};

/**
 * Progress event data sent over IPC during node execution
 *
 * This represents the complete state of execution progress, transmitted from
 * the desktop process to the client renderer process during flow execution.
 *
 * Transmission: Desktop → Client (broadcast)
 * Frequency: On every node state change
 * Format: Plain JSON object (no compression)
 */
export type ProgressEvent = {
  /** ID of the currently executing or completed node */
  nodeId: string;

  /** Array of all nodes in the execution graph with their current states */
  nodes: ProgressNodeSnapshot[];

  /** Overall execution progress as a percentage (0-100) */
  progress: number;

  /** Human-readable message describing current execution state */
  message: string;

  /** Execution graph metadata */
  graph: ProgressGraphMetadata;
};

/**
 * Type guard to validate ProgressEvent at runtime
 *
 * Use this for defensive validation of IPC data before processing.
 * Returns true if the data conforms to ProgressEvent shape.
 */
export function isValidProgressEvent(data: unknown): data is ProgressEvent {
  if (!data || typeof data !== "object") {
    return false;
  }

  const event = data as Record<string, unknown>;

  // Validate required top-level fields
  if (typeof event.nodeId !== "string") return false;
  if (typeof event.progress !== "number") return false;
  if (typeof event.message !== "string") return false;

  // Validate nodes array
  if (!Array.isArray(event.nodes)) return false;
  for (const node of event.nodes) {
    if (!node || typeof node !== "object") return false;
    const n = node as Record<string, unknown>;
    if (typeof n.id !== "string") return false;
    if (typeof n.name !== "string") return false;
    if (typeof n.state !== "string") return false;
  }

  // Validate graph metadata
  if (!event.graph || typeof event.graph !== "object") return false;
  const graph = event.graph as Record<string, unknown>;
  if (!Array.isArray(graph.executionOrder)) return false;
  if (!Array.isArray(graph.criticalPath)) return false;
  if (typeof graph.totalWeight !== "number") return false;
  if (typeof graph.maxParallelism !== "number") return false;
  if (!Array.isArray(graph.edges)) return false;

  return true;
}
