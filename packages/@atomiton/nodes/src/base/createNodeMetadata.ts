/**
 * Factory function for creating type-safe node metadata
 */

import { titleCase } from "@atomiton/utils";
import type { INodeMetadata } from "./INodeMetadata";
import type { NodeCategory, NodeIcon, NodeRuntime } from "./types";

export type NodeMetadataInput = {
  id: string;
  name: string;
  type?: string;
  version?: string;
  author?: string;
  description: string;
  category: NodeCategory;
  icon: NodeIcon;
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

export function createNodeMetadata(input: NodeMetadataInput): INodeMetadata {
  const type = input.type || input.id;
  const name = input.name;
  const formattedName = titleCase(name);

  return {
    id: input.id,
    name: formattedName,
    type,
    version: input.version || "1.0.0",
    author: input.author || "Atomiton Core Team",
    description: input.description,
    category: input.category,
    icon: input.icon,
    keywords: input.keywords || generateKeywords(input.id, formattedName),
    tags: input.tags || generateTags(input.id, input.category),
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
