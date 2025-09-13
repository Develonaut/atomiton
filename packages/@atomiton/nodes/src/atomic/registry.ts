/**
 * Atomic Node Registry - Single source of truth for all atomic nodes
 *
 * This registry manages:
 * - Node registration and discovery
 * - Metadata loading (lightweight, for UI)
 * - Config loading (node configuration schema)
 * - Logic loading (execution logic)
 * - Full node loading (complete implementation)
 *
 * When adding a new node, register it here with paths to its different parts.
 */

import type { INodeMetadata, Node } from "../base";

/**
 * All available node types - single source of truth
 */
const AVAILABLE_NODE_TYPES = [
  "csv-reader",
  "file-system",
  "http-request",
  "shell-command",
  "image-composite",
  "transform",
  "code",
  "loop",
  "parallel",
] as const;

/**
 * Available atomic node types in the system.
 * This type is derived from the AVAILABLE_NODE_TYPES array.
 */
export type NodeType = (typeof AVAILABLE_NODE_TYPES)[number];

/**
 * Node registry entry containing paths to different node parts
 */
type NodeRegistryEntry = {
  // Path to metadata (lightweight, static info for UI)
  metadata: () => Promise<any>;
  // Path to config (schema and validation)
  config: () => Promise<any>;
  // Path to logic (execution logic)
  logic: () => Promise<any>;
  // Path to full node implementation (everything combined)
  implementation: () => Promise<any>;
};

/**
 * Atomic Node Registry
 *
 * Singleton service that manages node registration and lazy loading.
 * No initialization required - loads on demand.
 */
export class AtomicRegistry {
  private static instance: AtomicRegistry;

  // Node registration map
  private registry: Map<string, NodeRegistryEntry> = new Map();

  // Caches for different node parts
  private metadataCache = new Map<string, INodeMetadata>();
  private configCache = new Map<string, any>();
  private logicCache = new Map<string, any>();
  private nodeCache = new Map<string, Node>();

  private constructor() {
    // Register all nodes immediately - just registration, not loading
    this.registerNodes();
  }

  static getInstance(): AtomicRegistry {
    if (!AtomicRegistry.instance) {
      AtomicRegistry.instance = new AtomicRegistry();
    }
    return AtomicRegistry.instance;
  }

  /**
   * Register all known atomic nodes
   */
  private registerNodes(): void {
    // Register each node type using the predefined array
    for (const nodeType of AVAILABLE_NODE_TYPES) {
      this.registerNodeType(nodeType);
    }
  }

  /**
   * Register a single node type with its module paths
   */
  private registerNodeType(nodeType: NodeType): void {
    // Convert node type to PascalCase for file names
    const pascalCase = nodeType
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");

    this.register(nodeType, {
      metadata: () => import(`./${nodeType}/${pascalCase}NodeMetadata.js`),
      config: () => import(`./${nodeType}/${pascalCase}NodeConfig.js`),
      logic: () => import(`./${nodeType}/${pascalCase}NodeLogic.js`),
      implementation: () => import(`./${nodeType}/${pascalCase}Node.js`),
    });
  }

  /**
   * Register a new node type
   */
  register(nodeType: string, entry: NodeRegistryEntry): void {
    this.registry.set(nodeType, entry);
  }

  /**
   * Unregister a node type
   */
  unregister(nodeType: string): boolean {
    // Clear from caches
    this.metadataCache.delete(nodeType);
    this.configCache.delete(nodeType);
    this.logicCache.delete(nodeType);
    this.nodeCache.delete(nodeType);

    // Remove from registry
    return this.registry.delete(nodeType);
  }

  /**
   * Clear all registrations (for testing)
   */
  clearAllRegistrations(): void {
    this.registry.clear();
    this.clearAllCaches();
  }

  /**
   * Check if a node type is registered
   */
  has(nodeType: string): boolean {
    return this.registry.has(nodeType);
  }

  /**
   * Get all registered node types
   */
  getNodeTypes(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Load metadata for a specific node type
   */
  async loadMetadata(nodeType: string): Promise<INodeMetadata | null> {
    // Check cache first
    if (this.metadataCache.has(nodeType)) {
      return this.metadataCache.get(nodeType)!;
    }

    // Get registry entry
    const entry = this.registry.get(nodeType);
    if (!entry) {
      return null;
    }

    try {
      const module = await entry.metadata();
      // Handle both named exports and default exports
      const metadata = module.metadata || module.default || module;
      this.metadataCache.set(nodeType, metadata);
      return metadata;
    } catch (error) {
      console.warn(`Failed to load metadata for "${nodeType}":`, error);
      return null;
    }
  }

  /**
   * Load config for a specific node type
   */
  async loadConfig(nodeType: string): Promise<any | null> {
    // Check cache first
    if (this.configCache.has(nodeType)) {
      return this.configCache.get(nodeType)!;
    }

    // Get registry entry
    const entry = this.registry.get(nodeType);
    if (!entry) {
      return null;
    }

    try {
      const module = await entry.config();
      // Handle both named exports and default exports
      const config = module.config || module.default || module;
      this.configCache.set(nodeType, config);
      return config;
    } catch (error) {
      console.warn(`Failed to load config for "${nodeType}":`, error);
      return null;
    }
  }

  /**
   * Load logic for a specific node type
   */
  async loadLogic(nodeType: string): Promise<any | null> {
    // Check cache first
    if (this.logicCache.has(nodeType)) {
      return this.logicCache.get(nodeType)!;
    }

    // Get registry entry
    const entry = this.registry.get(nodeType);
    if (!entry) {
      return null;
    }

    try {
      const module = await entry.logic();
      // Handle both named exports and default exports
      const logic = module.logic || module.default || module;
      this.logicCache.set(nodeType, logic);
      return logic;
    } catch (error) {
      console.warn(`Failed to load logic for "${nodeType}":`, error);
      return null;
    }
  }

  /**
   * Load complete node implementation
   */
  async loadNode(nodeType: string): Promise<Node | null> {
    // Check cache first
    if (this.nodeCache.has(nodeType)) {
      return this.nodeCache.get(nodeType)!;
    }

    // Get registry entry
    const entry = this.registry.get(nodeType);
    if (!entry) {
      return null;
    }

    try {
      const module = await entry.implementation();
      // Handle both named exports and default exports
      const node = module.default || module.node || module;
      this.nodeCache.set(nodeType, node);
      return node;
    } catch (error) {
      console.warn(
        `Failed to load node implementation for "${nodeType}":`,
        error,
      );
      return null;
    }
  }

  /**
   * Load all metadata
   */
  async loadAllMetadata(): Promise<INodeMetadata[]> {
    const nodeTypes = this.getNodeTypes();
    const promises = nodeTypes.map((nodeType) => this.loadMetadata(nodeType));
    const results = await Promise.all(promises);
    return results.filter(
      (metadata): metadata is INodeMetadata => metadata !== null,
    );
  }

  /**
   * Load all node implementations
   */
  async loadAllNodes(): Promise<Node[]> {
    const nodeTypes = this.getNodeTypes();
    const promises = nodeTypes.map((nodeType) => this.loadNode(nodeType));
    const results = await Promise.all(promises);
    return results.filter((node): node is Node => node !== null);
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.metadataCache.clear();
    this.configCache.clear();
    this.logicCache.clear();
    this.nodeCache.clear();
  }

  /**
   * Clear specific cache
   */
  clearCache(
    cacheType: "metadata" | "config" | "logic" | "node" | "all",
  ): void {
    switch (cacheType) {
      case "metadata":
        this.metadataCache.clear();
        break;
      case "config":
        this.configCache.clear();
        break;
      case "logic":
        this.logicCache.clear();
        break;
      case "node":
        this.nodeCache.clear();
        break;
      case "all":
        this.clearAllCaches();
        break;
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    metadata: number;
    config: number;
    logic: number;
    nodes: number;
  } {
    return {
      metadata: this.metadataCache.size,
      config: this.configCache.size,
      logic: this.logicCache.size,
      nodes: this.nodeCache.size,
    };
  }

  /**
   * Static method to check if a string is a valid NodeType
   */
  static isValidNodeType(type: string): type is NodeType {
    return AVAILABLE_NODE_TYPES.includes(type as NodeType);
  }

  /**
   * Static method to get all available node types
   */
  static getAllNodeTypes(): readonly NodeType[] {
    return AVAILABLE_NODE_TYPES;
  }
}

// Create and export the singleton instance
const atomicRegistry = AtomicRegistry.getInstance();
export { atomicRegistry };
