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

import type { INodeMetadata } from "./base/INodeMetadata";
import type { Node } from "./base/Node";
import { NODES } from "./nodes";
import type { NodeType } from "./types";

class NodesAPI {
  private static instance: NodesAPI;
  private nodes: Node[] = [];
  private initialized = false;

  private constructor() {
    // Register all available nodes
    this.nodes = NODES;
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

    // Nodes are automatically available from src/nodes directory
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
      console.warn(`Node with ID ${node.metadata.id} already registered`);
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
}

const nodes = NodesAPI.getInstance();

export default nodes;
export { nodes };
export type { NodesAPI };
