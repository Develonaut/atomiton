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
import type {
  FlatNodeMetadata,
  LegacyNodeMetadata,
} from "#core/types/metadata";
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
 * Legacy Node Definition (nested structure)
 * @deprecated Use NodeDefinition (flat structure) for new code
 *
 * Static, serializable structure defining a node's configuration.
 * All nodes share this interface - some may have nodes, some may not.
 */
export type LegacyNodeDefinition = {
  /** Unique identifier for this node */
  readonly id: string;

  /** Human-readable name */
  readonly name: string;

  /** Position of the node in the editor */
  position: NodePosition;

  /** Metadata about this node */
  metadata: LegacyNodeMetadata;

  /** Parameters schema, defaults, and field definitions */
  parameters: NodeParameters;

  /** Input port definitions */
  inputPorts: NodePort[];

  /** Output port definitions */
  outputPorts: NodePort[];

  /** Nodes contained within this node (optional - makes this a group/flow) */
  nodes?: LegacyNodeDefinition[];

  /** Edges connecting nodes */
  edges?: NodeEdge[];
};

/**
 * Modern Node Definition (flat structure)
 *
 * Static, serializable structure defining a node's configuration.
 * Uses a flat structure with parentId references for hierarchy.
 *
 * Nodes can optionally contain other nodes (making them a group/flow).
 * The contained nodes use the flat array structure with parentId references.
 */
export type NodeDefinition = {
  /** Unique identifier for this node */
  readonly id: string;

  /** Node type from metadata */
  readonly type: string;

  /** Version moved to top level from metadata */
  readonly version: string;

  /** Reference to parent node ID (undefined for root nodes) */
  readonly parentId?: string;

  /** Human-readable name */
  readonly name: string;

  /** Position of the node in the editor */
  position: NodePosition;

  /** Metadata about this node (without type and version) */
  metadata: FlatNodeMetadata;

  /** Parameters schema, defaults, and field definitions */
  parameters: NodeParameters;

  /** Input port definitions */
  inputPorts: NodePort[];

  /** Output port definitions */
  outputPorts: NodePort[];

  /** Contained nodes (optional - makes this a group/flow) - flat array with parentId */
  nodes?: NodeDefinition[];

  /** Edges connecting contained nodes */
  edges?: NodeEdge[];
};
