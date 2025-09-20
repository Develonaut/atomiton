/**
 * Type-safe transformation functions for converting between node types
 */

import type { Node, NodeEdge } from "../../types";
import type { CompositeEdge, CompositeNodeSpec } from "../types";
import {
  extractPosition,
  isRecord,
  safeObject,
  safeString,
} from "./typeGuards";

/**
 * Transform a partial node-like object to a CompositeNodeSpec
 * This function safely extracts and validates all required properties
 * Provides reasonable defaults for missing required fields to be resilient
 */
export function transformToCompositeNodeSpec(
  input: unknown,
): CompositeNodeSpec | null {
  if (!isRecord(input)) {
    return null;
  }

  // Extract required fields with type safety and defaults
  const id =
    safeString(input.id) || `node-${Math.random().toString(36).slice(2)}`;
  const name = safeString(input.name) || "Unnamed Node";
  const type = safeString(input.type, "default");
  const category = safeString(input.category, "user");

  // Extract position using our safe position extractor
  const position = extractPosition(input);

  // Build the CompositeNodeSpec with type safety
  const nodeSpec: CompositeNodeSpec = {
    id,
    name,
    type,
    category,
    position,
  };

  // Add optional properties only if they exist and are valid
  if (input.description && typeof input.description === "string") {
    nodeSpec.description = input.description;
  }

  if (input.version && typeof input.version === "string") {
    nodeSpec.version = input.version;
  }

  if (input.metadata) {
    nodeSpec.metadata = safeObject(input.metadata);
  }

  if (input.inputPorts) {
    nodeSpec.inputPorts = input.inputPorts as Node["inputPorts"];
  }

  if (input.outputPorts) {
    nodeSpec.outputPorts = input.outputPorts as Node["outputPorts"];
  }

  if (input.settings) {
    nodeSpec.settings = safeObject(input.settings);
  }

  if (input.data) {
    nodeSpec.data = safeObject(input.data);
  }

  if (input.parameters) {
    nodeSpec.parameters = safeObject(input.parameters);
  }

  if (input.nodes) {
    nodeSpec.nodes = input.nodes as Node["nodes"];
  }

  if (input.edges) {
    nodeSpec.edges = input.edges as Node["edges"];
  }

  if (input.variables) {
    nodeSpec.variables = safeObject(input.variables);
  }

  // Visual editor properties
  if (typeof input.width === "number") {
    nodeSpec.width = input.width;
  }

  if (typeof input.height === "number") {
    nodeSpec.height = input.height;
  }

  if (typeof input.parentId === "string") {
    nodeSpec.parentId = input.parentId;
  }

  if (typeof input.dragHandle === "string") {
    nodeSpec.dragHandle = input.dragHandle;
  }

  if (input.style) {
    nodeSpec.style = safeObject(input.style);
  }

  if (typeof input.className === "string") {
    nodeSpec.className = input.className;
  }

  return nodeSpec;
}

/**
 * Transform a partial edge-like object to a CompositeEdge
 * More resilient - provides defaults for missing required fields
 */
export function transformToCompositeEdge(input: unknown): CompositeEdge | null {
  if (!isRecord(input)) {
    return null;
  }

  // Extract required fields with defaults
  const id =
    safeString(input.id) || `edge-${Math.random().toString(36).slice(2)}`;

  // Build the base edge - use Record to bypass type checking for potentially missing fields
  const edge: Record<string, unknown> = {
    id,
  };

  // Handle source and target fields
  // Special case: if the input already has an id but no source/target,
  // preserve that by not adding them (for YAML round-trip compatibility)
  const hasSource = "source" in input;
  const hasTarget = "target" in input;
  const hadOriginalId = "id" in input && safeString(input.id);

  if (!hasSource && !hasTarget && hadOriginalId) {
    // Edge already had an ID but missing source/target
    // Don't add them so they remain undefined when parsed from YAML
  } else {
    // Normal case: provide defaults for missing fields
    edge.source = hasSource ? safeString(input.source) : "";
    edge.target = hasTarget ? safeString(input.target) : "";
  }

  // Add optional properties
  if (typeof input.sourceHandle === "string") {
    edge.sourceHandle = input.sourceHandle;
  }

  if (typeof input.targetHandle === "string") {
    edge.targetHandle = input.targetHandle;
  }

  if (typeof input.type === "string") {
    edge.type = input.type;
  }

  if (typeof input.animated === "boolean") {
    edge.animated = input.animated;
  }

  if (input.style) {
    edge.style = safeObject(input.style);
  }

  if (input.data) {
    edge.data = safeObject(input.data);
  }

  if (typeof input.hidden === "boolean") {
    edge.hidden = input.hidden;
  }

  if (typeof input.deletable === "boolean") {
    edge.deletable = input.deletable;
  }

  if (typeof input.selectable === "boolean") {
    edge.selectable = input.selectable;
  }

  return edge as NodeEdge;
}

/**
 * Transform an array of unknown values to CompositeNodeSpec array
 * Per test expectations, non-object elements should be converted to default objects
 */
export function transformToCompositeNodeSpecs(
  input: unknown,
): CompositeNodeSpec[] {
  // Handle non-array inputs gracefully
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item, index) => {
    // Try to transform as a normal object
    let transformed = transformToCompositeNodeSpec(item);

    // If transformation failed (null/undefined/non-object), create a default object
    if (transformed === null) {
      transformed = transformToCompositeNodeSpec({
        id: `generated-node-${index}`,
        name: `Generated Node ${index}`,
        type: "default",
        position: { x: 0, y: 0 },
      });
    }

    return transformed!; // We know it's not null since we provide defaults
  });
}

/**
 * Transform an array of unknown values to CompositeEdge array
 * Per test expectations, non-object elements should be converted to default objects
 */
export function transformToCompositeEdges(input: unknown): CompositeEdge[] {
  // Handle non-array inputs gracefully
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item, index) => {
    // Try to transform as a normal object
    let transformed = transformToCompositeEdge(item);

    // If transformation failed (null/undefined/non-object), create a default object
    if (transformed === null) {
      transformed = transformToCompositeEdge({
        id: `generated-edge-${index}`,
        source: undefined,
        target: undefined,
      });
    }

    return transformed!; // We know it's not null since we provide defaults
  });
}
