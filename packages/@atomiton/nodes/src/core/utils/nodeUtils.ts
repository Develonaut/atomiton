/**
 * Node Utility Functions
 * Common utilities for working with nodes and their components
 */

import type {
  NodeMetadata,
  NodeParameters,
  NodePort,
} from "#core/types/definition";

/**
 * Helper to check if an object is already a NodePort
 */
export function isNodePort(obj: unknown): obj is NodePort {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "type" in obj &&
    "dataType" in obj &&
    typeof (obj as Record<string, unknown>).type === "string" &&
    typeof (obj as Record<string, unknown>).dataType === "string"
  );
}

/**
 * Helper to check if an object is already a NodeMetadata
 */
export function isNodeMetadata(obj: unknown): obj is NodeMetadata {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "id" in obj &&
    "name" in obj &&
    "type" in obj &&
    "version" in obj &&
    typeof (obj as Record<string, unknown>).id === "string" &&
    typeof (obj as Record<string, unknown>).name === "string" &&
    typeof (obj as Record<string, unknown>).type === "string" &&
    typeof (obj as Record<string, unknown>).version === "string"
  );
}

/**
 * Helper to check if an object is already NodeParameters
 */
export function isNodeParameters(obj: unknown): obj is NodeParameters {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "parse" in obj &&
    "safeParse" in obj &&
    "isValid" in obj &&
    typeof (obj as Record<string, unknown>).parse === "function" &&
    typeof (obj as Record<string, unknown>).safeParse === "function" &&
    typeof (obj as Record<string, unknown>).isValid === "function"
  );
}
