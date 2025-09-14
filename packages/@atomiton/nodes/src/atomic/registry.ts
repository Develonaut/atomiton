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
import { nodeStore, nodeActions, nodeSelectors } from "../stores";

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

  // Local caches for non-metadata (config, logic, nodes)
  // Metadata uses the store for persistence
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
   *
   * IMPORTANT: We use explicit imports here instead of dynamic imports with variables
   * because Vite needs to statically analyze all imports at build time for proper
   * code splitting and bundling. Dynamic imports like `import(\`./\${nodeType}/\${file}.js\`)`
   * cannot be resolved by Vite and will result in runtime errors:
   * "Unknown variable dynamic import"
   *
   * Each node type must be explicitly registered with its full import paths.
   * This allows Vite to properly bundle and code-split each node's modules.
   */
  private registerNodes(): void {
    // Register csv-reader
    this.register("csv-reader", {
      metadata: () => import("./csv-reader/CSVReaderNodeMetadata.js"),
      config: () => import("./csv-reader/CSVReaderNodeConfig.js"),
      logic: () => import("./csv-reader/CSVReaderNodeLogic.js"),
      implementation: () => import("./csv-reader/CSVReaderNode.js"),
    });

    // Register file-system
    this.register("file-system", {
      metadata: () => import("./file-system/FileSystemNodeMetadata.js"),
      config: () => import("./file-system/FileSystemNodeConfig.js"),
      logic: () => import("./file-system/FileSystemNodeLogic.js"),
      implementation: () => import("./file-system/FileSystemNode.js"),
    });

    // Register http-request
    this.register("http-request", {
      metadata: () => import("./http-request/HttpRequestNodeMetadata.js"),
      config: () => import("./http-request/HttpRequestNodeConfig.js"),
      logic: () => import("./http-request/HttpRequestNodeLogic.js"),
      implementation: () => import("./http-request/HttpRequestNode.js"),
    });

    // Register shell-command
    this.register("shell-command", {
      metadata: () => import("./shell-command/ShellCommandNodeMetadata.js"),
      config: () => import("./shell-command/ShellCommandNodeConfig.js"),
      logic: () => import("./shell-command/ShellCommandNodeLogic.js"),
      implementation: () => import("./shell-command/ShellCommandNode.js"),
    });

    // Register image-composite
    this.register("image-composite", {
      metadata: () => import("./image-composite/ImageCompositeNodeMetadata.js"),
      config: () => import("./image-composite/ImageCompositeNodeConfig.js"),
      logic: () => import("./image-composite/ImageCompositeNodeLogic.js"),
      implementation: () => import("./image-composite/ImageCompositeNode.js"),
    });

    // Register transform
    this.register("transform", {
      metadata: () => import("./transform/TransformNodeMetadata.js"),
      config: () => import("./transform/TransformNodeConfig.js"),
      logic: () => import("./transform/TransformNodeLogic.js"),
      implementation: () => import("./transform/TransformNode.js"),
    });

    // Register code
    this.register("code", {
      metadata: () => import("./code/CodeNodeMetadata.js"),
      config: () => import("./code/CodeNodeConfig.js"),
      logic: () => import("./code/CodeNodeLogic.js"),
      implementation: () => import("./code/CodeNode.js"),
    });

    // Register loop
    this.register("loop", {
      metadata: () => import("./loop/LoopNodeMetadata.js"),
      config: () => import("./loop/LoopNodeConfig.js"),
      logic: () => import("./loop/LoopNodeLogic.js"),
      implementation: () => import("./loop/LoopNode.js"),
    });

    // Register parallel
    this.register("parallel", {
      metadata: () => import("./parallel/ParallelNodeMetadata.js"),
      config: () => import("./parallel/ParallelNodeConfig.js"),
      logic: () => import("./parallel/ParallelNodeLogic.js"),
      implementation: () => import("./parallel/ParallelNode.js"),
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
    // Metadata is in the store, not cached locally
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
    // Check store first
    const cached = nodeSelectors.getMetadataByType(nodeType);
    if (cached) {
      return cached;
    }

    // Get registry entry
    const entry = this.registry.get(nodeType);
    if (!entry) {
      return null;
    }

    try {
      nodeActions.setLoading("metadata", true);
      const metadata = await entry.metadata();

      // Store in the node store
      nodeActions.setMetadata(nodeType, metadata);
      nodeActions.setLoading("metadata", false);

      return metadata;
    } catch (error) {
      console.warn(`Failed to load metadata for "${nodeType}":`, error);
      nodeActions.setError(
        "metadata",
        error instanceof Error ? error : new Error(String(error)),
      );
      nodeActions.setLoading("metadata", false);
      return null;
    }
  }

  /**
   * Load config for a specific node type
   */
  async loadConfig(nodeType: string): Promise<any | null> {
    // Check store first
    const cached = nodeSelectors.getConfigByType(nodeType);
    if (cached) {
      return cached;
    }

    // Get registry entry
    const entry = this.registry.get(nodeType);
    if (!entry) {
      return null;
    }

    try {
      nodeActions.setLoading("configs", true);
      const module = await entry.config();
      // Handle both named exports and default exports
      const config = module.config || module.default || module;

      // Store in the node store
      nodeActions.setConfig(nodeType, config);
      nodeActions.setLoading("configs", false);

      return config;
    } catch (error) {
      console.warn(`Failed to load config for "${nodeType}":`, error);
      nodeActions.setError(
        "configs",
        error instanceof Error ? error : new Error(String(error)),
      );
      nodeActions.setLoading("configs", false);
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
    const validMetadata = results.filter(
      (metadata): metadata is INodeMetadata => metadata !== null,
    );

    // Build and store categories
    const categoryMap = new Map<string, INodeMetadata[]>();
    for (const metadata of validMetadata) {
      const category = metadata.category || "uncategorized";
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(metadata);
    }

    // Convert to category format and store
    const categories = Array.from(categoryMap.entries()).map(
      ([name, items]) => ({
        name,
        displayName: this.getCategoryDisplayName(name),
        items,
      }),
    );

    nodeActions.setCategories(categories);

    return validMetadata;
  }

  /**
   * Helper to convert category name to display name
   */
  private getCategoryDisplayName(category: string): string {
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
    // Clear local caches
    this.configCache.clear();
    this.logicCache.clear();
    this.nodeCache.clear();

    // Clear store
    nodeActions.clearAll();
  }

  /**
   * Clear specific cache
   */
  clearCache(
    cacheType: "metadata" | "config" | "logic" | "node" | "all",
  ): void {
    switch (cacheType) {
      case "metadata":
        nodeActions.clearMetadata();
        break;
      case "config":
        this.configCache.clear();
        nodeActions.clearConfigs();
        break;
      case "logic":
        this.logicCache.clear();
        // Logic clearing not yet implemented in nodeActions
        break;
      case "node":
        this.nodeCache.clear();
        // Node clearing not yet implemented in nodeActions
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
    const state = nodeStore.getState();
    return {
      metadata: Object.keys(state.metadata).length,
      config: Object.keys(state.configs).length,
      logic: Object.keys(state.logic).length,
      nodes: Object.keys(state.nodes).length,
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
