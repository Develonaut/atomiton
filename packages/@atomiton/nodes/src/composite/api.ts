/**
 * Composite API - Unified interface for all composite functionality
 *
 * Single entry point that handles both CompositeNode instances and CompositeNodeDefinition transparently.
 */

import { CompositeNode } from "./CompositeNode";
import type { CompositeNodeDefinition } from "./CompositeNode";
import type { JsonCompositeDefinition } from "./serializer/types";

// Import serializer functions for definitions
import {
  fromJson as fromJsonDef,
  fromYaml as fromYamlDef,
  toJson as toJsonDef,
  toYaml as toYamlDef,
  validate as validateDef,
} from "./serializer/index";

/**
 * Check if an object is a CompositeNode instance
 */
function isCompositeNode(obj: unknown): obj is CompositeNode {
  return obj instanceof CompositeNode;
}

/**
 * Composite API - ES6 Singleton Class
 */
export class CompositeAPI {
  private static instance: CompositeAPI;

  private constructor() {}

  static getInstance(): CompositeAPI {
    if (!CompositeAPI.instance) {
      CompositeAPI.instance = new CompositeAPI();
    }
    return CompositeAPI.instance;
  }

  /**
   * Create a composite node - either from scratch or from a definition
   */
  create(
    idOrDefinition: string | CompositeNodeDefinition,
    name?: string,
    category: string = "user-defined",
  ): CompositeNode {
    // If passed a definition, create from that
    if (typeof idOrDefinition === "object") {
      return new CompositeNode(idOrDefinition);
    }

    // Otherwise create a new one from scratch
    const definition: CompositeNodeDefinition = {
      id: idOrDefinition,
      name: name || idOrDefinition,
      category,
      version: "1.0.0",
      nodes: [],
      edges: [],
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
    };
    return new CompositeNode(definition);
  }

  /**
   * Clone a composite node
   */
  clone(
    composite: CompositeNode,
    newId?: string,
    newName?: string,
  ): CompositeNode {
    const definition = composite.getDefinition();
    const clonedDefinition: CompositeNodeDefinition = {
      ...definition,
      id: newId || `${definition.id}-copy`,
      name: newName || `${definition.name} (Copy)`,
      metadata: {
        ...definition.metadata,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
    };
    return new CompositeNode(clonedDefinition);
  }

  /**
   * Merge two composite nodes
   */
  merge(base: CompositeNode, overlay: CompositeNode): CompositeNode {
    const baseDefinition = base.getDefinition();
    const overlayDefinition = overlay.getDefinition();

    const mergedDefinition: CompositeNodeDefinition = {
      ...baseDefinition,
      nodes: [...baseDefinition.nodes, ...overlayDefinition.nodes],
      edges: [...baseDefinition.edges, ...overlayDefinition.edges],
      variables: {
        ...baseDefinition.variables,
        ...overlayDefinition.variables,
      },
      settings: { ...baseDefinition.settings, ...overlayDefinition.settings },
      metadata: {
        ...baseDefinition.metadata,
        updated: new Date().toISOString(),
      },
    };

    return new CompositeNode(mergedDefinition);
  }

  /**
   * Convert JSON to Composite (returns definition for storage)
   */
  fromJson(jsonData: JsonCompositeDefinition): CompositeNodeDefinition {
    return fromJsonDef(jsonData);
  }

  /**
   * Convert Composite to JSON (handles both nodes and definitions)
   */
  toJson(
    composite: CompositeNode | CompositeNodeDefinition,
  ): JsonCompositeDefinition {
    if (isCompositeNode(composite)) {
      // It's a node instance, get its definition first
      return toJsonDef(composite.getDefinition());
    }
    // It's already a definition
    return toJsonDef(composite);
  }

  /**
   * Convert YAML to Composite
   */
  async fromYaml(yamlContent: string): Promise<CompositeNodeDefinition> {
    return fromYamlDef(yamlContent);
  }

  /**
   * Convert Composite to YAML (handles both nodes and definitions)
   */
  toYaml(composite: CompositeNode | CompositeNodeDefinition): string {
    if (isCompositeNode(composite)) {
      // It's a node instance, get its definition first
      return toYamlDef(composite.getDefinition());
    }
    // It's already a definition
    return toYamlDef(composite);
  }

  /**
   * Validate a Composite (handles both nodes and definitions)
   */
  validate(composite: CompositeNode | CompositeNodeDefinition): {
    valid: boolean;
    errors: string[];
  } {
    if (isCompositeNode(composite)) {
      // Validate the node's definition
      return validateDef(composite.getDefinition());
    }
    // Validate the definition directly
    return validateDef(composite);
  }

  /**
   * Get the definition from a CompositeNode instance
   * Use this when you need to save or serialize a node
   */
  getDefinition(
    composite: CompositeNode | CompositeNodeDefinition,
  ): CompositeNodeDefinition {
    if (isCompositeNode(composite)) {
      return composite.getDefinition();
    }
    return composite;
  }
}

// Export singleton instance
export const composite = CompositeAPI.getInstance();
