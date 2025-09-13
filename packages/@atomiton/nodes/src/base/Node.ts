/**
 * Node - Abstract base class for all nodes
 *
 * Provides common functionality for both atomic and composite nodes.
 * All concrete node implementations should extend this class.
 */

import type { NodeExecutionContext, NodeExecutionResult } from "../types.js";
import type { NodePortDefinition } from "../types.js";
import type { INode } from "./INode.js";

export abstract class Node implements INode {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly type: string;

  /**
   * Get node metadata for serialization/API usage
   * Returns proper INodeMetadata format for API compatibility
   * Override this in subclasses to provide custom metadata
   */
  get metadata() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      version: "1.0.0",
      author: "Atomiton",
      description: `${this.name} node`,
      category: "unknown",
      keywords: [] as string[],
      icon: "node",
      tags: [] as string[],
      runtime: { language: "typescript" as const },
      experimental: false,
      deprecated: false,
      // Add required INodeMetadata methods
      validate: () => this.validate(),
      getSearchTerms: () => {
        const terms = new Set<string>();
        terms.add(this.id.toLowerCase());
        terms.add(this.name.toLowerCase());
        terms.add(this.metadata.description.toLowerCase());
        terms.add(this.metadata.category.toLowerCase());
        (this.metadata.tags || []).forEach((tag) =>
          terms.add(tag.toLowerCase()),
        );
        return Array.from(terms);
      },
      matchesSearch: (query: string) => {
        const lowerQuery = query.toLowerCase();
        const searchTerms = [
          this.id,
          this.name,
          this.metadata.description,
          this.metadata.category,
          ...(this.metadata.tags || []),
        ];
        return searchTerms.some((term) =>
          term.toLowerCase().includes(lowerQuery),
        );
      },
    };
  }

  /**
   * Get node definition for serialization/API usage
   * Default implementation - override in subclasses for specific definitions
   */
  get definition() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      category: this.metadata.category,
      description: this.metadata.description,
      version: this.metadata.version,
      inputPorts: this.inputPorts,
      outputPorts: this.outputPorts,
      metadata: {
        category: this.metadata.category,
        description: this.metadata.description,
        version: this.metadata.version,
        author: this.metadata.author,
        tags: this.metadata.tags,
        icon: this.metadata.icon,
      },
    };
  }

  /**
   * Core execution method - must be implemented by subclasses
   */
  abstract execute(context: NodeExecutionContext): Promise<NodeExecutionResult>;

  /**
   * Validate this executable's configuration
   * Default implementation - can be overridden
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.id || this.id.trim() === "") {
      errors.push("Node ID is required");
    }

    if (!this.name || this.name.trim() === "") {
      errors.push("Node name is required");
    }

    if (!this.type || this.type.trim() === "") {
      errors.push("Node type is required");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Input ports - default implementation returns empty array
   * Override in subclasses to define actual ports
   */
  get inputPorts(): NodePortDefinition[] {
    return [];
  }

  /**
   * Output ports - default implementation returns empty array
   * Override in subclasses to define actual ports
   */
  get outputPorts(): NodePortDefinition[] {
    return [];
  }

  /**
   * Check if this is a composite node
   * Default implementation returns false (atomic node)
   * Override in composite nodes to return true
   */
  isComposite(): boolean {
    return false;
  }

  /**
   * Dispose of resources used by this node
   * Default implementation - override in subclasses if needed
   */
  dispose(): void {}

  /**
   * Create a standardized success result
   */
  protected createSuccessResult(
    outputs: Record<string, unknown> | unknown,
  ): NodeExecutionResult {
    // Convert unknown values to Record<string, unknown> format
    const formattedOutputs =
      outputs && typeof outputs === "object" && !Array.isArray(outputs)
        ? (outputs as Record<string, unknown>)
        : { result: outputs };
    return {
      success: true,
      outputs: formattedOutputs,
      error: undefined,
      metadata: {
        executedAt: new Date().toISOString(),
        nodeId: this.id,
        nodeType: this.type,
      },
    };
  }

  /**
   * Create a standardized error result
   */
  protected createErrorResult(error: Error | string): NodeExecutionResult {
    const errorMessage = error instanceof Error ? error.message : error;

    return {
      success: false,
      outputs: undefined,
      error: errorMessage,
      metadata: {
        executedAt: new Date().toISOString(),
        nodeId: this.id,
        nodeType: this.type,
      },
    };
  }

  /**
   * Log execution information
   */
  protected log(
    context: NodeExecutionContext,
    level: "info" | "warn" | "error",
    message: string,
    data?: unknown,
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      nodeId: this.id,
      nodeType: this.type,
      message,
      data,
    };

    // Use context log functions if available, otherwise console
    if (context.log && context.log[level]) {
      context.log[level]!(message, data as Record<string, unknown>);
    } else if (level === "error") {
      console.error(`[ERROR]`, logEntry);
    } else if (level === "warn") {
      console.warn(`[WARN]`, logEntry);
    }
  }
}
