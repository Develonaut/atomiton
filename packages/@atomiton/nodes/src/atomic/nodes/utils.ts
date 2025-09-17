import { titleCase } from "@atomiton/utils";

/**
 * Node Utilities
 *
 * Helper functions for working with nodes
 */

import {
  NODE_CATEGORIES_ORDER,
  NODE_CATEGORY_DISPLAY_NAMES,
} from "../../constants";
import type { NodeCategory } from "../../types";
import { nodes } from "./index";

export function getNodes() {
  return Object.values(nodes);
}

export function getNodeByType(type: string) {
  // Find node by its metadata.variant field (e.g., "image-composite")
  return Object.values(nodes).find((node) => node.metadata.variant === type);
}

export function getNodeTypes() {
  // Return actual variant values from metadata (e.g., "image-composite")
  return Object.values(nodes).map((node) => node.metadata.variant);
}

export function getNodeCategories() {
  return [
    ...new Set(Object.values(nodes).map((node) => node.metadata.category)),
  ];
}

export function getCategoryDisplayName(category: string) {
  return (
    NODE_CATEGORY_DISPLAY_NAMES[category] ||
    titleCase(category) ||
    "Uncategorized"
  );
}

export function getNodesByCategory(category?: NodeCategory) {
  const nodeList = getNodes();
  const nodeCategories = getNodeCategories();

  // If a specific category is requested, return only that category
  if (category) {
    return [
      {
        name: category,
        title: getCategoryDisplayName(category),
        items: nodeList.filter((node) => node.metadata.category === category),
      },
    ];
  }

  // Sort categories according to NODE_CATEGORIES_ORDER
  const sortedCategories = nodeCategories.sort((a, b) => {
    const indexA = NODE_CATEGORIES_ORDER.indexOf(a);
    const indexB = NODE_CATEGORIES_ORDER.indexOf(b);

    // If both are in the order array, sort by their position
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    // If only one is in the order array, it comes first
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    // If neither is in the order array, sort alphabetically
    return a.localeCompare(b);
  });

  // Return sorted categories
  return sortedCategories.map((c) => ({
    name: c,
    title: getCategoryDisplayName(c),
    items: nodeList.filter((node) => node.metadata.category === c),
  }));
}
