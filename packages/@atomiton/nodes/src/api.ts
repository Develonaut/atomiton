/**
 * Nodes API - Centralized API for the Nodes Package
 *
 * Provides a unified interface to all node functionality,
 * following the same pattern as @atomiton/core but using api.ts naming.
 *
 * Usage:
 *   import nodes from '@atomiton/nodes';
 *
 *   // Get node categories
 *   const categories = nodes.getCategories();
 *
 *   // Get available nodes
 *   const availableNodes = nodes.getAllNodes();
 *
 *   // Get a specific node
 *   const node = nodes.getNode('csv-reader');
 *
 *   // Get node UI components for the editor
 *   const nodeComponents = nodes.getNodeComponents();
 */

import { ExtendedNode, type ExtendedNodeConfig } from "./ExtendedNode.js";
import {
  getAvailableNodeTypes,
  isNodeTypeAvailable,
  loadAllNodes,
  loadNode,
} from "./atomic/index.js";
import type { INodeMetadata } from "./base/INodeMetadata.js";
import type { Node } from "./base/Node.js";
import { composite } from "./composite/index.js";
import type { NodeType } from "./types.js";

class NodesAPI {
  private static instance: NodesAPI;
  private nodes: Node[] = [];
  private initialized = false;
  public readonly composite = composite;

  private constructor() {
    // Nodes will be loaded lazily
    this.nodes = [];
  }

  static getInstance(): NodesAPI {
    if (!NodesAPI.instance) {
      NodesAPI.instance = new NodesAPI();
    }
    return NodesAPI.instance;
  }

  /**
   * Initialize the nodes system
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Load all atomic nodes
    this.nodes = await loadAllNodes();
    this.initialized = true;
  }

  /**
   * Get all registered nodes
   */
  getAllRegisteredNodes(): Node[] {
    return this.nodes;
  }

  /**
   * Get all available node metadata for the Assets sidebar
   */
  getAllNodes(): INodeMetadata[] {
    return this.nodes.map((node) => node.metadata);
  }

  /**
   * Get nodes organized by category for the Assets accordion
   */
  getCategories(): Array<{
    name: string;
    displayName: string;
    items: INodeMetadata[];
  }> {
    const nodes = this.getAllNodes();
    const categories = new Map<string, INodeMetadata[]>();

    for (const node of nodes) {
      const category = node.category;
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(node);
    }

    return Array.from(categories.entries()).map(([category, items]) => ({
      name: category,
      displayName: this.getCategoryDisplayName(category),
      items,
    }));
  }

  /**
   * Get nodes by category (synchronous)
   */
  getNodesByCategory(category: string): INodeMetadata[] {
    const categories = this.getCategories();
    const found = categories.find((cat) => cat.name === category);
    return found ? found.items : [];
  }

  /**
   * Get all nodes grouped by category as a single object for UI consumption
   */
  nodesByCategory(): Record<string, INodeMetadata[]> {
    const categories = this.getCategories();
    const result: Record<string, INodeMetadata[]> = {};

    for (const category of categories) {
      result[category.name] = category.items;
    }

    return result;
  }

  /**
   * Get a specific node metadata by its type
   */
  getNodeMetadata(nodeType: NodeType): INodeMetadata | null {
    const nodes = this.getAllNodes();
    return nodes.find((node) => node.type === nodeType) || null;
  }

  /**
   * Get node package by type for execution
   */
  getNodePackage(nodeType: NodeType): Node | undefined {
    return this.nodes.find((node) => node.definition.type === nodeType);
  }

  /**
   * Get node package by type for execution with lazy loading
   * This method will dynamically load the node if it's not already loaded
   */
  async getNodePackageAsync(nodeType: NodeType): Promise<Node | null> {
    // Check if already loaded
    const existing = this.getNodePackage(nodeType);
    if (existing) {
      return existing;
    }

    // Try to load it dynamically
    const node = await loadNode(nodeType);
    if (node) {
      // Add to registered nodes for future synchronous access
      this.registerNode(node);
      return node;
    }

    return null;
  }

  /**
   * Get node by ID
   */
  getNodeById(nodeId: string): Node | undefined {
    return this.nodes.find((node) => node.metadata.id === nodeId);
  }

  /**
   * Register a new node
   */
  registerNode(node: Node): void {
    // Check if node already exists
    const existing = this.getNodeById(node.metadata.id);
    if (existing) {
      // Node with this ID already registered, skip
      return;
    }

    // Validate node structure
    const validation = node.validate();
    if (!validation.valid) {
      throw new Error(
        `Invalid node structure: ${validation.errors.join(", ")}`,
      );
    }

    this.nodes.push(node);
  }

  /**
   * Unregister a node
   */
  unregisterNode(nodeId: string): boolean {
    const index = this.nodes.findIndex((node) => node.metadata.id === nodeId);
    if (index !== -1) {
      this.nodes.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Search nodes by name or description
   */
  searchNodes(query: string): INodeMetadata[] {
    const nodes = this.getAllNodes();
    return nodes.filter((node) => node.matchesSearch(query));
  }

  /**
   * Get available category names
   */
  getCategoryList(): string[] {
    const categories = this.getCategories();
    return categories.map((cat) => cat.name);
  }

  /**
   * Get available node types
   */
  getNodeTypes(): string[] {
    return this.nodes.map((node) => node.metadata.type);
  }

  /**
   * Get all available node types without loading nodes
   * This is more efficient for UI components that just need to know what's available
   */
  getAvailableNodeTypes(): string[] {
    return getAvailableNodeTypes();
  }

  /**
   * Check if a node type is available without loading it
   */
  isNodeTypeAvailable(nodeType: string): boolean {
    return isNodeTypeAvailable(nodeType);
  }

  /**
   * Convert category name to display name
   */
  getCategoryDisplayName(category: string): string {
    const names: Record<string, string> = {
      io: "Input/Output",
      data: "Data Processing",
      media: "Media Processing",
      system: "System",
      logic: "Logic & Control",
    };

    return (
      names[category] || category.charAt(0).toUpperCase() + category.slice(1)
    );
  }

  /**
   * Check if nodes are initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Extend the node system by creating a custom node from configuration
   * This is the primary way to create custom nodes - no classes required
   *
   * @example
   * ```typescript
   * const myNode = nodes.extendNode({
   *   id: 'my-custom-node',
   *   name: 'My Custom Node',
   *   type: 'custom',
   *   execute: async (context) => {
   *     return { success: true, outputs: { result: 'done' } };
   *   }
   * });
   * ```
   */
  extendNode(config: ExtendedNodeConfig): ExtendedNode {
    return new ExtendedNode(config);
  }
}

const nodes = NodesAPI.getInstance();

export default nodes;
export type { NodesAPI };
