/**
 * Atomic Node Package Registry - Single Source of Truth
 *
 * This file provides lazy loading for atomic node packages.
 * Atomic nodes are standalone nodes that perform specific tasks.
 * Mental Model: These are the "building blocks" that do actual work.
 */

import type { Node } from "../base/Node";

/**
 * Node registry with lazy loading support
 * Maps node types to their dynamic import functions
 */
type NodeImportFunction = () => Promise<{ default: Node }>;

const NODE_REGISTRY: Record<string, NodeImportFunction> = {
  "csv-reader": () => import("./csv-reader"),
  "file-system": () => import("./file-system"),
  "http-request": () => import("./http-request"),
  "shell-command": () => import("./shell-command"),
  "image-composite": () => import("./image-composite"),
  transform: () => import("./transform"),
  code: () => import("./code"),
  loop: () => import("./loop"),
  parallel: () => import("./parallel"),
};

/**
 * Eagerly loaded nodes for immediate access
 * These are loaded synchronously during initialization
 */
let ATOMIC_NODES: Node[] = [];

/**
 * Cache for dynamically loaded nodes
 */
const loadedNodes = new Map<string, Node>();

/**
 * Load a specific node by type
 */
export async function loadNode(nodeType: string): Promise<Node | null> {
  // Check cache first
  if (loadedNodes.has(nodeType)) {
    return loadedNodes.get(nodeType)!;
  }

  // Check if node type exists in registry
  const importFn = NODE_REGISTRY[nodeType];
  if (!importFn) {
    return null;
  }

  try {
    const module = await importFn();
    const node = module.default;
    loadedNodes.set(nodeType, node);
    return node;
  } catch (error) {
    console.error(`Failed to load node ${nodeType}:`, error);
    return null;
  }
}

/**
 * Load all atomic nodes (for initialization)
 */
export async function loadAllNodes(): Promise<Node[]> {
  if (ATOMIC_NODES.length > 0) {
    return ATOMIC_NODES;
  }

  const promises = Object.keys(NODE_REGISTRY).map(async (nodeType) => {
    const node = await loadNode(nodeType);
    return node;
  });

  const results = await Promise.all(promises);
  ATOMIC_NODES = results.filter((node): node is Node => node !== null);
  return ATOMIC_NODES;
}

/**
 * Get all available node types without loading the nodes
 */
export function getAvailableNodeTypes(): string[] {
  return Object.keys(NODE_REGISTRY);
}

/**
 * Get all loaded atomic nodes (synchronous)
 * Use this for backward compatibility
 */
export function getLoadedNodes(): Node[] {
  return ATOMIC_NODES;
}

/**
 * Check if a node type is available
 */
export function isNodeTypeAvailable(nodeType: string): boolean {
  return nodeType in NODE_REGISTRY;
}

// Legacy export for backward compatibility
// This will be empty until loadAllNodes() is called
export { ATOMIC_NODES };
