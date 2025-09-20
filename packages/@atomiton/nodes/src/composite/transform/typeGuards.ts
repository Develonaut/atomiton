/**
 * Type guards for safe type checking in transformation functions
 */

import type { Node, NodeEdge, NodePosition } from "../../types";

/**
 * Type guard to check if a value is a valid plain object (not Date, RegExp, etc.)
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
}

/**
 * Type guard to check if a value has the basic structure of a Node
 */
export function isNodeLike(
  value: unknown,
): value is Partial<Node> & Record<string, unknown> {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.type === "string" &&
    (value.category === undefined || typeof value.category === "string")
  );
}

/**
 * Type guard to check if a value has the basic structure of an Edge
 */
export function isEdgeLike(
  value: unknown,
): value is Partial<NodeEdge> & Record<string, unknown> {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.source === "string" &&
    typeof value.target === "string"
  );
}

/**
 * Type guard to check if a value is a valid position
 */
export function isPosition(value: unknown): value is NodePosition {
  if (!isRecord(value)) return false;

  return typeof value.x === "number" && typeof value.y === "number";
}

/**
 * Extract position from various possible locations in a node
 */
export function extractPosition(node: Record<string, unknown>): NodePosition {
  // Handle null/invalid input gracefully
  if (!isRecord(node)) {
    return { x: 0, y: 0 };
  }

  // Try direct position property first
  if (isPosition(node.position)) {
    return node.position;
  }

  // Try position from settings.ui.position
  if (
    isRecord(node.settings) &&
    isRecord(node.settings.ui) &&
    isPosition(node.settings.ui.position)
  ) {
    return node.settings.ui.position;
  }

  // Try x,y properties directly on node (React Flow style)
  if (typeof node.x === "number" && typeof node.y === "number") {
    return { x: node.x, y: node.y };
  }

  // Default position
  return { x: 0, y: 0 };
}

/**
 * Safe string extraction with fallback
 */
export function safeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

/**
 * Safe number extraction with fallback
 */
export function safeNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : fallback;
}

/**
 * Safe boolean extraction with fallback
 */
export function safeBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

/**
 * Safe object extraction with fallback
 */
export function safeObject(
  value: unknown,
  fallback: Record<string, unknown> = {},
): Record<string, unknown> {
  return isRecord(value) ? value : fallback;
}
