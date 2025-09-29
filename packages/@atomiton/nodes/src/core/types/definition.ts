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
import type { NodeFieldsConfig, NodeParameters } from "#core/types/parameters";
import type { NodePort } from "#core/types/ports";

// ============================================================================
// NODE DEFINITION TYPES
// ============================================================================

export type NodePosition = {
  x: number;
  y: number;
};

/**
 * Node Definition
 *
 * Static, serializable structure defining a node's configuration.
 * Uses parentId references for hierarchy.
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
  metadata: NodeMetadata;

  /** Runtime parameter values */
  parameters: NodeParameters;

  /** UI field configurations for form rendering */
  fields?: NodeFieldsConfig;

  /** Input port definitions */
  inputPorts: NodePort[];

  /** Output port definitions */
  outputPorts: NodePort[];

  /** Contained nodes (flows only) */
  nodes?: NodeDefinition[];

  /** Edges connecting contained nodes (flows only) */
  edges?: NodeEdge[];
};
