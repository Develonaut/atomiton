/**
 * Core Node Definition Types
 * Central type definitions for the node system
 */

// Re-export types from separate modules
export * from "#core/types/edges";
export * from "#core/types/metadata";
export * from "#core/types/parameters";
export * from "#core/types/ports";

import type { NodeEdge } from "#core/types/edges";
import type { NodeMetadata } from "#core/types/metadata";
import type { NodeParameters } from "#core/types/parameters";
import type { NodePort } from "#core/types/ports";

// ============================================================================
// NODE DEFINITION TYPES
// ============================================================================

export type NodePosition = {
  x: number;
  y: number;
};

/**
 * Universal Node Definition
 *
 * Static, serializable structure defining a node's configuration.
 * All nodes share this interface - some may have nodes, some may not.
 */
export type NodeDefinition = {
  /** Unique identifier for this node */
  readonly id: string;

  /** Human-readable name */
  readonly name: string;

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

  /** Nodes contained within this node (optional - makes this a group/flow) */
  nodes?: NodeDefinition[];

  /** Edges connecting nodes */
  edges?: NodeEdge[];
};
