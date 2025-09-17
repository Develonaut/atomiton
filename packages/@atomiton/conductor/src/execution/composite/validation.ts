/**
 * Validation functions for composite definitions
 */

import type { CompositeDefinition, INode } from "@atomiton/nodes/executable";
import type { CompositeValidationResult } from "./types";

/**
 * Validates a composite definition for execution
 */
export function validateComposite(
  composite: CompositeDefinition,
  nodeRegistry: Map<string, INode>,
): CompositeValidationResult {
  const errors: string[] = [];

  // Check for required fields
  if (!composite.id) errors.push("Composite ID is required");
  if (!composite.name) errors.push("Composite name is required");
  if (!composite.nodes || composite.nodes.length === 0) {
    errors.push("Composite must have at least one node");
  }

  // Validate node types exist
  for (const node of composite.nodes) {
    if (!nodeRegistry.has(node.type)) {
      errors.push(`Unknown node type: ${node.type}`);
    }
  }

  // Validate connections
  for (const connection of composite.edges) {
    const sourceNode = composite.nodes.find((n) => n.id === connection.source);
    const targetNode = composite.nodes.find((n) => n.id === connection.target);

    if (!sourceNode) {
      errors.push(
        `Connection references unknown source node: ${connection.source}`,
      );
    }
    if (!targetNode) {
      errors.push(
        `Connection references unknown target node: ${connection.target}`,
      );
    }
  }

  // Check for circular dependencies
  if (hasCircularDependencies(composite)) {
    errors.push("Composite contains circular dependencies");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Detects circular dependencies in a composite definition
 */
export function hasCircularDependencies(
  composite: CompositeDefinition,
): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const hasCycle = (nodeId: string): boolean => {
    if (recursionStack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;

    visited.add(nodeId);
    recursionStack.add(nodeId);

    // Find all nodes that depend on this node
    const dependents = composite.edges
      .filter((conn) => conn.source === nodeId)
      .map((conn) => conn.target);

    for (const dependent of dependents) {
      if (hasCycle(dependent)) return true;
    }

    recursionStack.delete(nodeId);
    return false;
  };

  return composite.nodes.some((node) => hasCycle(node.id));
}
