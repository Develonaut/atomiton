/**
 * Core Node Definition Types
 * Central type definitions for the node system
 */

// Re-export types from separate modules
export * from "./edges.js";
export * from "./metadata.js";
export * from "./parameters.js";
export * from "./ports.js";

import type { NodeEdge } from "./edges.js";
import type { NodeMetadata } from "./metadata.js";
import type { NodeParameters } from "./parameters.js";
import type { NodePort } from "./ports.js";

// ============================================================================
// NODE DEFINITION TYPES
// ============================================================================

export type NodePosition = {
  x: number;
  y: number;
};

export type NodeType = "atomic" | "composite";

/**
 * Universal Node Definition
 *
 * Static, serializable structure defining a node's configuration.
 * Both atomic and composite nodes share this interface.
 */
export type NodeDefinition = {
  /** Unique identifier for this node */
  readonly id: string;

  /** Human-readable name */
  readonly name: string;

  /** Node type - atomic (leaf) or composite (has children) */
  readonly type: NodeType;

  /** Position of the node in the editor */
  position: NodePosition;

  /** Metadata about this node */
  metadata: NodeMetadata;

  /** Parameters schema, defaults, and field definitions */
  parameters: NodeParameters;

  /** Input port definitions */
  inputPorts: NodePort[];

  /** Output port definitions */
  outputPorts: NodePort[];

  /** Child nodes (only for composite nodes) */
  children?: NodeDefinition[];

  /** Edges connecting child nodes (only for composite nodes) */
  edges?: NodeEdge[];
};
