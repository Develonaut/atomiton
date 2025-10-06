/**
 * Branded types for type-safe IDs
 *
 * Uses TypeScript's nominal typing pattern to create distinct types
 * for different kinds of IDs, preventing accidental mixing at compile time.
 */

import { generateExecutionId, generateNodeId } from "@atomiton/utils";

/**
 * Brand symbol for ExecutionId
 */
declare const ExecutionIdBrand: unique symbol;

/**
 * Brand symbol for NodeId
 */
declare const NodeIdBrand: unique symbol;

/**
 * Branded type for execution IDs
 * Prevents accidentally using a regular string where an ExecutionId is expected
 */
export type ExecutionId = string & {
  readonly [ExecutionIdBrand]: typeof ExecutionIdBrand;
};

/**
 * Branded type for node IDs
 * Prevents accidentally using a regular string where a NodeId is expected
 */
export type NodeId = string & { readonly [NodeIdBrand]: typeof NodeIdBrand };

/**
 * Create a new ExecutionId or convert from string
 */
export function createExecutionId(id?: string): ExecutionId {
  if (id) {
    return toExecutionId(id);
  }
  return generateExecutionId() as ExecutionId;
}

/**
 * Create an ExecutionId from an existing string
 * Use with caution - only for deserializing from trusted sources
 */
export function toExecutionId(id: string): ExecutionId {
  if (!id || typeof id !== "string") {
    throw new Error("Invalid execution ID: must be a non-empty string");
  }
  return id as ExecutionId;
}

/**
 * Create a new NodeId or convert from string
 */
export function createNodeId(id?: string): NodeId {
  if (id) {
    return toNodeId(id);
  }
  return generateNodeId() as NodeId;
}

/**
 * Create a NodeId from an existing string
 * Use with caution - only for deserializing from trusted sources
 */
export function toNodeId(id: string): NodeId {
  if (!id || typeof id !== "string") {
    throw new Error("Invalid node ID: must be a non-empty string");
  }
  return id as NodeId;
}

/**
 * Type guard for ExecutionId
 */
export function isExecutionId(value: unknown): value is ExecutionId {
  return typeof value === "string" && value.length > 0;
}

/**
 * Type guard for NodeId
 */
export function isNodeId(value: unknown): value is NodeId {
  return typeof value === "string" && value.length > 0;
}

/**
 * Extract the string value from an ExecutionId (for serialization)
 */
export function executionIdToString(id: ExecutionId): string {
  return id;
}

/**
 * Extract the string value from a NodeId (for serialization)
 */
export function nodeIdToString(id: NodeId): string {
  return id;
}

/**
 * Batch convert strings to NodeIds (for deserializing arrays)
 */
export function toNodeIds(ids: string[]): NodeId[] {
  return ids.map(toNodeId);
}

/**
 * Batch convert NodeIds to strings (for serializing arrays)
 */
export function nodeIdsToStrings(ids: NodeId[]): string[] {
  return ids.map(nodeIdToString);
}
