/**
 * Node Base Class
 *
 * The main base class that all nodes extend from.
 * Provides a clean ES6 class interface for node instances.
 */

import type {
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
} from "../types";
import type { INodeConfig } from "./INodeConfig";
import type { NodeLogic } from "./NodeLogic";
import type { INodeLogic } from "./INodeLogic";
import type { INode } from "./INode";
import type { INodeMetadata } from "./INodeMetadata";

/**
 * Base Node Class
 * All nodes should extend this class and implement the required properties.
 *
 * Note: This architecture supports Blueprint composition - a Blueprint (workflow)
 * can be wrapped as a Node and used in other Blueprints. This enables:
 * - Reusable workflow components
 * - Hierarchical composition
 * - Abstraction of complex logic into simple nodes
 *
 * Future: Consider a BlueprintNode subclass that wraps a Blueprint as a Node
 */
export abstract class Node<TConfig = Record<string, unknown>>
  implements INode<TConfig>
{
  /**
   * Node metadata
   */
  abstract readonly metadata: INodeMetadata;

  /**
   * Node configuration definition
   */
  abstract readonly config: INodeConfig<TConfig>;

  /**
   * Node logic implementation
   */
  abstract readonly logic: INodeLogic<TConfig> | NodeLogic<TConfig>;

  /**
   * Node definition for the runtime
   */
  abstract readonly definition: NodeDefinition;

  /**
   * Execute the node with the given context
   */
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    // Validate and parse configuration
    const config = this.config.schema.parse(
      context.config || this.config.defaults,
    );

    // Execute the logic
    return this.logic.execute(context, config);
  }

  /**
   * Get the node ID
   */
  getId(): string {
    return this.metadata.id;
  }

  /**
   * Get the node name
   */
  getName(): string {
    return this.metadata.name;
  }

  /**
   * Get the node version
   */
  getVersion(): string {
    return this.metadata.version;
  }

  /**
   * Check if node is experimental
   */
  isExperimental(): boolean {
    return this.metadata.experimental ?? false;
  }

  /**
   * Check if node is deprecated
   */
  isDeprecated(): boolean {
    return this.metadata.deprecated ?? false;
  }

  /**
   * Validate the node structure
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check and validate metadata
    if (!this.metadata) {
      errors.push("Node metadata is required");
    } else {
      const metadataValidation = this.metadata.validate();
      if (!metadataValidation.valid) {
        errors.push(...metadataValidation.errors);
      }
    }

    // Check config
    if (!this.config) {
      errors.push("Node config is required");
    } else {
      if (!this.config.schema) errors.push("Node config must have a schema");
      if (!this.config.defaults) errors.push("Node config must have defaults");
    }

    // Check logic
    if (!this.logic) {
      errors.push("Node logic is required");
    } else {
      if (typeof this.logic.execute !== "function") {
        errors.push("Node logic must have an execute function");
      }
    }

    // Check definition
    if (!this.definition) {
      errors.push("Node definition is required");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
