/**
 * Factory function for creating node metadata
 */

import type {
  NodeCategory,
  NodeIcon,
  FlatNodeMetadata,
  NodeRuntime,
} from "#core/types/definition";
import { isNodeMetadata } from "#core/utils/nodeUtils";
import { titleCase } from "@atomiton/utils";

export type NodeMetadataInput = {
  id?: string;
  name?: string;
  author?: string;
  description?: string;
  category?: NodeCategory;
  icon?: NodeIcon;
  keywords?: string[];
  tags?: string[];
  runtime?: {
    language: NodeRuntime;
  };
  experimental?: boolean;
  deprecated?: boolean;
  documentationUrl?: string;
  examples?: Array<{
    name: string;
    description: string;
    config: Record<string, unknown>;
  }>;
};

function createNodeMetadata(
  input: NodeMetadataInput | FlatNodeMetadata,
): FlatNodeMetadata {
  if (isNodeMetadata(input)) {
    return input;
  }

  const id = input.id || "node";
  const name = input.name || "Node";
  const formattedName = titleCase(name);
  const category = input.category || "utility";
  const icon = input.icon || "code-2";
  const description = input.description || `${formattedName} node`;

  return {
    id,
    name: formattedName,
    author: input.author || "Atomiton Core Team",
    description,
    category,
    icon,
    keywords: input.keywords || generateKeywords(id, formattedName),
    tags: input.tags || generateTags(id, category),
    runtime: input.runtime || { language: "typescript" },
    experimental: input.experimental ?? false,
    deprecated: input.deprecated ?? false,
    documentationUrl: input.documentationUrl,
    examples: input.examples,
  };
}

function generateKeywords(id: string, name: string): string[] {
  const keywords: string[] = [];
  const idParts = id.split("-").filter((part) => part.length > 2);
  const nameParts = name
    .toLowerCase()
    .split(" ")
    .filter((part) => part.length > 2);

  keywords.push(...idParts, ...nameParts);

  return [...new Set(keywords)];
}

function generateTags(id: string, category: NodeCategory): string[] {
  const tags: string[] = [];
  const idParts = id.split("-");

  tags.push(...idParts, category);

  return [...new Set(tags)];
}

export { createNodeMetadata };
export default createNodeMetadata;
