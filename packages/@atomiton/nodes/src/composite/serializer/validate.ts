import type { CompositeNodeDefinition } from "../CompositeNode.js";

export function validate(composite: CompositeNodeDefinition): {
  valid: boolean;
  errors: string[];
} {
  try {
    // Basic validation - check required fields
    const errors: string[] = [];

    if (!composite.id) errors.push("ID is required");
    if (!composite.name) errors.push("Name is required");
    if (!composite.category) errors.push("Category is required");
    if (!composite.nodes) errors.push("Nodes array is required");
    if (!composite.edges) errors.push("Edges array is required");

    return {
      valid: errors.length === 0,
      errors,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}
