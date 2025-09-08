/**
 * Nodes Core - Centralized API for the Nodes Package
 *
 * Provides a unified interface to all node functionality,
 * following the same pattern as @atomiton/core.
 *
 * Usage:
 *   import nodes from '@atomiton/nodes';
 *
 *   // Get node categories
 *   const categories = await nodes.getCategories();
 *
 *   // Register a node package
 *   nodes.registry.register(nodePackage);
 */

import { CATEGORY_NAMES, CATEGORY_ORDER, NODES } from "./constants/nodes";
import {
  NodePackageDiscovery,
  NodePackageRegistry,
  autoDiscoverNodes,
  getGlobalRegistry as getRegistry,
  resetGlobalRegistry,
} from "./registry";
import type { NodeCategory, NodeItem } from "./types";

class NodesCore {
  private static instance: NodesCore;
  private initialized = false;

  private constructor() {}

  static getInstance(): NodesCore {
    if (!NodesCore.instance) {
      NodesCore.instance = new NodesCore();
    }
    return NodesCore.instance;
  }

  /**
   * Registry access
   */
  get registry() {
    return {
      get: getRegistry,
      reset: resetGlobalRegistry,
      Registry: NodePackageRegistry,
      Discovery: NodePackageDiscovery,
      autoDiscover: autoDiscoverNodes,
    };
  }

  /**
   * Available nodes
   */
  get available() {
    return {
      nodes: {}, // Will be populated when nodes are added
      getPackage: async (nodeId: string) => {
        throw new Error(`Node package '${nodeId}' not found`);
      },
      getIds: () => [],
    };
  }

  /**
   * Initialize the nodes system and registry
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Since we have no nodes yet, just mark as initialized
    this.initialized = true;
  }

  /**
   * Get all available node categories with their nodes (synchronous)
   */
  getCategories(): NodeCategory[] {
    // Group nodes by category
    const categoriesMap = new Map<string, NodeItem[]>();

    NODES.forEach((node) => {
      const category = node.category || "uncategorized";

      if (!categoriesMap.has(category)) {
        categoriesMap.set(category, []);
      }

      categoriesMap.get(category)!.push({
        id: node.id,
        nodeType: node.type,
        title: node.name,
        category: node.category,
        description: node.description,
        icon: node.icon,
        tags: node.tags,
      });
    });

    // Convert to array with display names
    const categories: NodeCategory[] = Array.from(categoriesMap.entries()).map(
      ([name, items]) => ({
        name,
        displayName: CATEGORY_NAMES[name] || name,
        items,
      }),
    );

    // Sort categories by logical order
    categories.sort((a, b) => {
      const aIndex = CATEGORY_ORDER.indexOf(a.name);
      const bIndex = CATEGORY_ORDER.indexOf(b.name);
      const aOrder = aIndex === -1 ? 999 : aIndex;
      const bOrder = bIndex === -1 ? 999 : bIndex;
      return aOrder - bOrder;
    });

    return categories;
  }

  /**
   * Get all available nodes (flat list, synchronous)
   */
  getAllNodes(): NodeItem[] {
    return NODES.map((node) => ({
      id: node.id,
      nodeType: node.type,
      title: node.name,
      category: node.category,
      description: node.description,
      icon: node.icon,
      tags: node.tags,
    }));
  }

  /**
   * Get nodes by category (synchronous)
   */
  getNodesByCategory(category: string): NodeItem[] {
    const categories = this.getCategories();
    const found = categories.find((cat) => cat.name === category);
    return found ? found.items : [];
  }

  /**
   * Get a specific node by its type (synchronous)
   */
  getNode(nodeType: string): NodeItem | null {
    const node = NODES.find((n) => n.type === nodeType);
    if (!node) return null;

    return {
      id: node.id,
      nodeType: node.type,
      title: node.name,
      category: node.category,
      description: node.description,
      icon: node.icon,
      tags: node.tags,
    };
  }

  /**
   * Search nodes by name or description (synchronous)
   */
  searchNodes(query: string): NodeItem[] {
    const lowerQuery = query.toLowerCase();

    return NODES.filter(
      (node) =>
        node.name.toLowerCase().includes(lowerQuery) ||
        node.description?.toLowerCase().includes(lowerQuery) ||
        node.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    ).map((node) => ({
      id: node.id,
      nodeType: node.type,
      title: node.name,
      category: node.category,
      description: node.description,
      icon: node.icon,
      tags: node.tags,
    }));
  }

  /**
   * Get available category names (synchronous)
   */
  getCategoryList(): string[] {
    const categories = this.getCategories();
    return categories.map((cat) => cat.name);
  }

  /**
   * Convert category name to display name
   */
  getCategoryDisplayName(category: string): string {
    const categoryNames: Record<string, string> = {
      data: "Data Processing",
      transform: "Transformation",
      io: "Input/Output",
      logic: "Logic & Control",
      utility: "Utility",
      integration: "Integration",
      uncategorized: "Other",
    };

    return categoryNames[category] || category;
  }

  /**
   * Check if nodes are initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Reset the nodes system (mainly for testing)
   */
  reset(): void {
    resetGlobalRegistry();
    this.initialized = false;
  }
}

// Export singleton instance
const nodes = NodesCore.getInstance();

export default nodes;
export { nodes };
export type { NodeCategory, NodeItem, NodesCore };
