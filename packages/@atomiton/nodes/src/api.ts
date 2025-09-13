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

import atomic, { type NodeType } from "./atomic";
import {
  ExtendedNode,
  type ExtendedNodeConfig,
  type INodeMetadata,
  type Node,
} from "./base";
import type {
  CompositeNodeDefinition,
  JsonCompositeDefinition,
} from "./composite";
import composite from "./composite";

class NodesAPI {
  private nodes: Node[] = [];

  constructor() {
    // Everything loads on demand, no initialization needed
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
   * NOTE: This method requires nodes to be initialized (loads all nodes)
   * For UI components that just need metadata, use getCategoriesMetadata() instead
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
   * Get node metadata organized by category without loading any nodes
   * This is the preferred method for UI components like the LeftSidebar
   */
  async getCategoriesMetadata(): Promise<
    Array<{
      name: string;
      displayName: string;
      items: INodeMetadata[];
    }>
  > {
    return atomic.getMetadataByCategory();
  }

  /**
   * Get all node metadata without loading any nodes
   * This is the preferred method for UI components that need node information
   */
  async getAllNodesMetadata(): Promise<INodeMetadata[]> {
    return atomic.getAllNodeMetadata();
  }

  /**
   * Get specific node metadata by type without loading the node
   */
  async getNodeMetadataByType(
    nodeType: NodeType,
  ): Promise<INodeMetadata | null> {
    return atomic.getNodeMetadata(nodeType);
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
    const node = await atomic.loadNode(nodeType);
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
    return atomic.getAvailableNodeTypes();
  }

  /**
   * Check if a node type is available without loading it
   */
  isNodeTypeAvailable(nodeType: string): boolean {
    return atomic.isNodeTypeAvailable(nodeType);
  }

  /**
   * Get node configuration schema by type
   */
  async getNodeConfig(nodeType: NodeType): Promise<any | null> {
    return atomic.getNodeConfig(nodeType);
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

  /**
   * Convert a node to YAML - works with any node type
   * @param nodeData - Any node instance (atomic or composite) or definition
   * @returns YAML string representation
   */
  toYaml(nodeData: Node | CompositeNodeDefinition): string {
    // For now, delegate to composite API
    // TODO: Add atomic node serialization support
    return composite.toYaml(nodeData as any);
  }

  /**
   * Convert YAML to a node definition
   * @param yaml - YAML string content
   * @returns Promise<CompositeNodeDefinition>
   */
  async fromYaml(yaml: string): Promise<CompositeNodeDefinition> {
    // For now, returns composite definitions
    // TODO: Add atomic node deserialization support
    return composite.fromYaml(yaml);
  }

  /**
   * Convert a node to JSON - works with any node type
   * @param nodeData - Any node instance (atomic or composite) or definition
   * @returns JSON representation
   */
  toJson(nodeData: Node | CompositeNodeDefinition): JsonCompositeDefinition {
    // For now, delegate to composite API
    // TODO: Add atomic node serialization support
    return composite.toJson(nodeData as any);
  }

  /**
   * Convert JSON to a node definition
   * @param jsonData - JSON definition
   * @returns Node definition
   */
  fromJson(jsonData: JsonCompositeDefinition): CompositeNodeDefinition {
    // For now, returns composite definitions
    // TODO: Add atomic node deserialization support
    return composite.fromJson(jsonData);
  }

  /**
   * Create a new composite node
   * @param idOrDefinition - Node ID or complete definition
   * @param name - Optional node name (if ID provided)
   * @param category - Optional category (defaults to "user-defined")
   * @returns CompositeNode instance
   */
  createComposite(
    idOrDefinition: string | CompositeNodeDefinition,
    name?: string,
    category?: string,
  ): Node {
    return composite.create(idOrDefinition, name, category);
  }

  /**
   * Validate a node - works with any node type
   * @param nodeData - Any node instance or definition
   * @returns Validation result with valid flag and errors array
   */
  validate(nodeData: Node | CompositeNodeDefinition): {
    valid: boolean;
    errors: string[];
  } {
    // Check if it's an atomic node with validate method
    if ("validate" in nodeData && typeof nodeData.validate === "function") {
      return nodeData.validate();
    }
    // Otherwise treat as composite
    return composite.validate(nodeData as any);
  }
}

// Create and export the singleton instance
const nodes = new NodesAPI();
export default nodes;
export type { NodesAPI };
