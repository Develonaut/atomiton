/**
 * Atomic API - High-level interface for atomic node operations
 *
 * Singleton service that provides a convenient interface for working with atomic nodes.
 * No initialization required - everything loads on demand.
 */

import type { INodeMetadata, Node } from "../base";
import { atomicRegistry } from "./registry";

export class AtomicAPI {
  private static instance: AtomicAPI;

  private constructor() {
    // Registry is already a singleton and self-registers
  }

  static getInstance(): AtomicAPI {
    if (!AtomicAPI.instance) {
      AtomicAPI.instance = new AtomicAPI();
    }
    return AtomicAPI.instance;
  }

  /**
   * Load a specific node by type
   * Delegates to registry
   */
  async loadNode(nodeType: string): Promise<Node | null> {
    return atomicRegistry.loadNode(nodeType);
  }

  /**
   * Load all nodes
   * Delegates to registry
   */
  async loadAllNodes(): Promise<Node[]> {
    return atomicRegistry.loadAllNodes();
  }

  /**
   * Get all available node types
   * Delegates to registry
   */
  getAvailableNodeTypes(): string[] {
    return atomicRegistry.getNodeTypes();
  }

  /**
   * Check if a node type is available
   * Delegates to registry
   */
  isNodeTypeAvailable(nodeType: string): boolean {
    return atomicRegistry.has(nodeType);
  }

  /**
   * Get node metadata by type
   * Delegates to registry
   */
  async getNodeMetadata(nodeType: string): Promise<INodeMetadata | null> {
    return atomicRegistry.loadMetadata(nodeType);
  }

  /**
   * Get all node metadata
   * Delegates to registry
   */
  async getAllNodeMetadata(): Promise<INodeMetadata[]> {
    return atomicRegistry.loadAllMetadata();
  }

  /**
   * Get metadata for all available node types
   * Convenience method that combines registry operations
   */
  async getAvailableNodeMetadata(): Promise<INodeMetadata[]> {
    return this.getAllNodeMetadata();
  }

  /**
   * Get metadata organized by category for UI consumption
   */
  async getMetadataByCategory(): Promise<
    Array<{
      name: string;
      displayName: string;
      items: INodeMetadata[];
    }>
  > {
    const allMetadata = await this.getAllNodeMetadata();
    const categories = new Map<string, INodeMetadata[]>();

    for (const metadata of allMetadata) {
      // Default to 'uncategorized' if category is missing
      const category = metadata.category || "uncategorized";
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(metadata);
    }

    return Array.from(categories.entries()).map(([category, items]) => ({
      name: category,
      displayName: this.getCategoryDisplayName(category),
      items,
    }));
  }

  /**
   * Convert category name to display name
   */
  private getCategoryDisplayName(category: string): string {
    // Handle undefined or empty category
    if (!category) {
      return "Uncategorized";
    }

    const names: Record<string, string> = {
      io: "Input/Output",
      data: "Data Processing",
      media: "Media Processing",
      system: "System",
      logic: "Logic & Control",
      uncategorized: "Uncategorized",
    };

    return (
      names[category] || category.charAt(0).toUpperCase() + category.slice(1)
    );
  }

  /**
   * Get node configuration schema
   * Delegates to registry
   */
  async getNodeConfig(nodeType: string): Promise<any | null> {
    return atomicRegistry.loadConfig(nodeType);
  }

  /**
   * Get node execution logic
   * Delegates to registry
   */
  async getNodeLogic(nodeType: string): Promise<any | null> {
    return atomicRegistry.loadLogic(nodeType);
  }

  /**
   * Register a custom node
   * Delegates to registry
   */
  registerNode(
    nodeType: string,
    entry: {
      metadata: () => Promise<{ metadata: INodeMetadata }>;
      config: () => Promise<{ config: any }>;
      logic: () => Promise<{ logic: any }>;
      implementation: () => Promise<{ default: Node }>;
    },
  ): void {
    atomicRegistry.register(nodeType, entry);
  }

  /**
   * Unregister a node
   * Delegates to registry
   */
  unregisterNode(nodeType: string): boolean {
    return atomicRegistry.unregister(nodeType);
  }

  /**
   * Clear caches
   * Delegates to registry
   */
  clearCache(
    cacheType: "metadata" | "config" | "logic" | "node" | "all" = "all",
  ): void {
    atomicRegistry.clearCache(cacheType);
  }

  /**
   * Get cache statistics
   * Delegates to registry
   */
  getCacheStats(): {
    metadata: number;
    config: number;
    logic: number;
    nodes: number;
  } {
    return atomicRegistry.getCacheStats();
  }
}

// Create and export the singleton instance
const atomicAPI = AtomicAPI.getInstance();
export { atomicAPI };
