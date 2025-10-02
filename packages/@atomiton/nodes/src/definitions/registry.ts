/**
 * Node Definition Registry
 * Central registry for all node definitions (browser-safe)
 */

import type { NodeDefinition } from "#core/types/definition";

// Import all node definitions
import editFieldsDefinition from "#definitions/edit-fields";
import fileSystemDefinition from "#definitions/file-system";
import groupDefinition from "#definitions/group";
import httpRequestDefinition from "#definitions/http-request";
import imageDefinition from "#definitions/image";
import loopDefinition from "#definitions/loop";
import parallelDefinition from "#definitions/parallel";
import shellCommandDefinition from "#definitions/shell-command";
import spreadsheetDefinition from "#definitions/spreadsheet";
import transformDefinition from "#definitions/transform";

/**
 * Registry of all available node definitions
 */
export const nodeDefinitionRegistry: Map<string, NodeDefinition> = new Map([
  ["parallel", parallelDefinition],
  ["group", groupDefinition],
  ["image", imageDefinition],
  ["http-request", httpRequestDefinition],
  ["file-system", fileSystemDefinition],
  ["edit-fields", editFieldsDefinition],
  ["transform", transformDefinition],
  ["shell-command", shellCommandDefinition],
  ["spreadsheet", spreadsheetDefinition],
  ["loop", loopDefinition],
]);

/**
 * Get a node definition by ID
 */
export function getNodeDefinition(nodeId: string): NodeDefinition | undefined {
  return nodeDefinitionRegistry.get(nodeId);
}

/**
 * Get all node definitions
 */
export function getAllNodeDefinitions(): NodeDefinition[] {
  return Array.from(nodeDefinitionRegistry.values());
}

/**
 * Get node definitions by category
 */
export function getNodeDefinitionsByCategory(
  category: string,
): NodeDefinition[] {
  return getAllNodeDefinitions().filter(
    (node) => node.metadata.category === category,
  );
}

/**
 * Get all node definitions grouped by category
 * Returns an array of category objects with name, title, and items
 */
export function getNodeDefinitionsGroupedByCategory(): Array<{
  name: string;
  title: string;
  items: NodeDefinition[];
}> {
  const definitions = getAllNodeDefinitions();
  const categories = new Map<string, NodeDefinition[]>();

  // Group definitions by category
  definitions.forEach((definition) => {
    const category = definition.metadata.category;
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(definition);
  });

  // Convert to the expected format
  return Array.from(categories.entries()).map(([categoryName, items]) => ({
    name: categoryName,
    title: categoryName.charAt(0).toUpperCase() + categoryName.slice(1), // Capitalize first letter
    items,
  }));
}

/**
 * Check if a node definition exists
 */
export function hasNodeDefinition(id: string): boolean {
  return nodeDefinitionRegistry.has(id);
}

/**
 * Get all node definition IDs
 */
export function getNodeDefinitionIds(): string[] {
  return Array.from(nodeDefinitionRegistry.keys());
}

/**
 * Search node definitions by keywords
 */
export function searchNodeDefinitions(query: string): NodeDefinition[] {
  const lowerQuery = query.toLowerCase();
  return getAllNodeDefinitions().filter((node) => {
    const metadata = node.metadata;
    return (
      metadata.name.toLowerCase().includes(lowerQuery) ||
      metadata.description.toLowerCase().includes(lowerQuery) ||
      metadata.keywords?.some((k) => k.toLowerCase().includes(lowerQuery)) ||
      metadata.tags?.some((t) => t.toLowerCase().includes(lowerQuery))
    );
  });
}

// Export all definitions for convenience
export {
  editFieldsDefinition,
  fileSystemDefinition,
  groupDefinition,
  httpRequestDefinition,
  imageDefinition,
  loopDefinition,
  parallelDefinition,
  shellCommandDefinition,
  spreadsheetDefinition,
  transformDefinition,
};
