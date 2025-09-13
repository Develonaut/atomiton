import type { INode } from "@atomiton/nodes";

/**
 * Node constructor type
 */
type NodeConstructor = new () => INode;

/**
 * Node registration entry
 */
type NodeEntry = {
  type: string;
  constructor: NodeConstructor;
  instance?: INode;
  metadata: {
    category: string;
    version: string;
    deprecated?: boolean;
    experimental?: boolean;
  };
};

/**
 * NodeRegistry manages all available nodes in the system
 * Singleton pattern for global node registration
 */
export class NodeRegistry {
  private static instance: NodeRegistry;
  private readonly nodes: Map<string, NodeEntry>;
  private readonly categories: Map<string, Set<string>>;

  private constructor() {
    this.nodes = new Map();
    this.categories = new Map();

    // Register built-in nodes
    this.registerBuiltInNodes();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): NodeRegistry {
    if (!NodeRegistry.instance) {
      NodeRegistry.instance = new NodeRegistry();
    }
    return NodeRegistry.instance;
  }

  /**
   * Register a node type
   */
  register(
    type: string,
    constructor: NodeConstructor,
    metadata?: Partial<NodeEntry["metadata"]>,
  ): void {
    // Create node instance to extract metadata
    const instance = new constructor();

    const entry: NodeEntry = {
      type,
      constructor,
      instance, // Cache the instance for reuse
      metadata: {
        category:
          metadata?.category ?? instance.metadata.category ?? "uncategorized",
        version: metadata?.version ?? instance.getVersion(),
        deprecated: metadata?.deprecated ?? instance.isDeprecated(),
        experimental: metadata?.experimental ?? instance.isExperimental(),
      },
    };

    this.nodes.set(type, entry);

    // Update category index
    if (!this.categories.has(entry.metadata.category)) {
      this.categories.set(entry.metadata.category, new Set());
    }
    this.categories.get(entry.metadata.category)!.add(type);
  }

  /**
   * Get a node instance by type
   */
  async getNode(type: string): Promise<INode | null> {
    const entry = this.nodes.get(type);
    if (!entry) {
      // Try to load dynamically
      const loaded = await this.loadDynamicNode(type);
      if (loaded) {
        return loaded;
      }
      return null;
    }

    // Return cached instance or create new one
    if (entry.instance) {
      return entry.instance;
    }

    return new entry.constructor();
  }

  /**
   * Get all registered node types
   */
  getNodeTypes(): string[] {
    return Array.from(this.nodes.keys());
  }

  /**
   * Get nodes by category
   */
  getNodesByCategory(category: string): string[] {
    return Array.from(this.categories.get(category) ?? []);
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    return Array.from(this.categories.keys());
  }

  /**
   * Get node metadata
   */
  getNodeMetadata(type: string): NodeEntry["metadata"] | null {
    const entry = this.nodes.get(type);
    return entry?.metadata ?? null;
  }

  /**
   * Check if a node type is registered
   */
  hasNode(type: string): boolean {
    return this.nodes.has(type);
  }

  /**
   * Unregister a node type
   */
  unregister(type: string): boolean {
    const entry = this.nodes.get(type);
    if (!entry) {
      return false;
    }

    // Remove from nodes map
    this.nodes.delete(type);

    // Remove from category index
    const categoryNodes = this.categories.get(entry.metadata.category);
    if (categoryNodes) {
      categoryNodes.delete(type);
      if (categoryNodes.size === 0) {
        this.categories.delete(entry.metadata.category);
      }
    }

    return true;
  }

  /**
   * Clear all registered nodes
   */
  clear(): void {
    this.nodes.clear();
    this.categories.clear();
  }

  /**
   * Register built-in nodes
   */
  private registerBuiltInNodes(): void {
    // TODO: Import and register actual node implementations
    // For now, this is a placeholder for future implementation
    // Example registration (when nodes package is ready):
    // import { CSVReaderNode } from "@atomiton/nodes";
    // this.register("csv-reader", CSVReaderNode);
  }

  /**
   * Dynamically load a node module
   */
  private async loadDynamicNode(type: string): Promise<INode | null> {
    try {
      // Try to load from @atomiton/nodes package
      const modulePath = `@atomiton/nodes/${type}`;
      const module = await import(modulePath);

      // Look for default export or named export matching the type
      const NodeClass = module.default ?? module[type];

      if (NodeClass && typeof NodeClass === "function") {
        const instance = new NodeClass();

        // Register for future use
        this.register(type, NodeClass);

        return instance;
      }
    } catch {
      // Node not found or couldn't be loaded
      // This is expected for many cases
    }

    return null;
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    totalNodes: number;
    categories: number;
    deprecated: number;
    experimental: number;
  } {
    let deprecated = 0;
    let experimental = 0;

    for (const entry of this.nodes.values()) {
      if (entry.metadata.deprecated) deprecated++;
      if (entry.metadata.experimental) experimental++;
    }

    return {
      totalNodes: this.nodes.size,
      categories: this.categories.size,
      deprecated,
      experimental,
    };
  }
}
