import type { NodeDefinition, LegacyNodeDefinition } from "#core/types/definition";
import type { LegacyNodeMetadata } from "#core/types/metadata";
import { convertLegacyToFlat, convertFlatToLegacy } from "#core/utils/flatStructure";

/**
 * Type guard to check if a node is using the legacy format
 */
export function isLegacyNode(node: unknown): node is LegacyNodeDefinition {
  if (!node || typeof node !== "object") return false;
  const n = node as Record<string, unknown>;
  return (
    typeof n.id === "string" &&
    typeof n.metadata === "object" &&
    n.metadata !== null &&
    "type" in (n.metadata as Record<string, unknown>) &&
    "version" in (n.metadata as Record<string, unknown>) &&
    !("type" in n && "version" in n && "parentId" in n)
  );
}

/**
 * Type guard to check if a node is using the flat format
 */
export function isFlatNode(node: unknown): node is NodeDefinition {
  if (!node || typeof node !== "object") return false;
  const n = node as Record<string, unknown>;
  return (
    typeof n.id === "string" &&
    typeof n.type === "string" &&
    typeof n.version === "string" &&
    typeof n.metadata === "object"
  );
}

/**
 * Normalize a node or array of nodes to the flat format
 */
export function normalizeToFlat(
  nodes: NodeDefinition | LegacyNodeDefinition | NodeDefinition[] | LegacyNodeDefinition[],
): NodeDefinition[] {
  const nodeArray = Array.isArray(nodes) ? nodes : [nodes];

  if (nodeArray.length === 0) return [];

  // Check if we have legacy nodes
  if (nodeArray.some(isLegacyNode)) {
    return convertLegacyToFlat(nodeArray as LegacyNodeDefinition[]);
  }

  return nodeArray as NodeDefinition[];
}

/**
 * Normalize a node or array of nodes to the legacy format
 */
export function normalizeToLegacy(
  nodes: NodeDefinition | LegacyNodeDefinition | NodeDefinition[] | LegacyNodeDefinition[],
): LegacyNodeDefinition[] {
  const nodeArray = Array.isArray(nodes) ? nodes : [nodes];

  if (nodeArray.length === 0) return [];

  // Check if we have flat nodes
  if (nodeArray.some(isFlatNode)) {
    return convertFlatToLegacy(nodeArray as NodeDefinition[]);
  }

  return nodeArray as LegacyNodeDefinition[];
}

/**
 * Helper to check if a node has children (works with both formats)
 */
export function nodeHasChildren(node: NodeDefinition | LegacyNodeDefinition): boolean {
  if (isLegacyNode(node)) {
    return Array.isArray(node.nodes) && node.nodes.length > 0;
  }
  // For flat nodes, we'd need access to all nodes to check for children
  // This is a limitation of the flat structure when working with single nodes
  return false;
}

/**
 * Helper to get node type (works with both formats)
 */
export function getNodeType(node: NodeDefinition | LegacyNodeDefinition): string {
  if (isLegacyNode(node)) {
    return node.metadata.type;
  }
  return node.type;
}

/**
 * Helper to get node version (works with both formats)
 */
export function getNodeVersion(node: NodeDefinition | LegacyNodeDefinition): string {
  if (isLegacyNode(node)) {
    return node.metadata.version;
  }
  return node.version;
}

/**
 * Create a flat node from components
 */
export function createFlatNode(
  id: string,
  name: string,
  type: string,
  version: string,
  metadata: Partial<NodeDefinition["metadata"]> = {},
  parentId?: string,
): Partial<NodeDefinition> {
  return {
    id,
    name,
    type,
    version,
    parentId,
    metadata: {
      id: metadata.id || id,
      name: metadata.name || name,
      author: metadata.author || "",
      description: metadata.description || "",
      category: metadata.category || "general",
      ...metadata,
    } as NodeDefinition["metadata"],
  };
}

/**
 * Create a legacy node from components
 */
export function createLegacyNode(
  id: string,
  name: string,
  metadata: LegacyNodeMetadata,
): Partial<LegacyNodeDefinition> {
  return {
    id,
    name,
    metadata,
  };
}