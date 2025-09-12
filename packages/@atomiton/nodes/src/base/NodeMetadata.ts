/**
 * Node Metadata Base Class
 *
 * Base implementation for node metadata that all nodes extend
 */

import type { INodeMetadata } from "./INodeMetadata";

/**
 * Node Metadata Base Class
 *
 * Provides default implementation for node metadata
 * All nodes should extend this class for their metadata
 */
export class NodeMetadata implements INodeMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly author: string;
  readonly description: string;
  readonly category: string;
  readonly type: string;
  readonly runtime?: {
    language: "typescript";
  };
  readonly keywords: string[];
  readonly icon: string;
  readonly tags?: string[];
  readonly experimental?: boolean;
  readonly deprecated?: boolean;
  readonly documentationUrl?: string;
  readonly examples?: Array<{
    name: string;
    description: string;
    config: Record<string, unknown>;
  }>;

  constructor(
    metadata: Omit<
      INodeMetadata,
      "validate" | "getSearchTerms" | "matchesSearch"
    >,
  ) {
    this.id = metadata.id;
    this.name = metadata.name;
    this.version = metadata.version;
    this.author = metadata.author;
    this.description = metadata.description;
    this.category = metadata.category;
    this.type = metadata.type || metadata.id; // Default type to id if not specified
    this.runtime = metadata.runtime || { language: "typescript" }; // Default to TypeScript
    this.keywords = metadata.keywords;
    this.icon = metadata.icon;
    this.tags = metadata.tags;
    this.experimental = metadata.experimental;
    this.deprecated = metadata.deprecated;
    this.documentationUrl = metadata.documentationUrl;
    this.examples = metadata.examples;
  }

  /**
   * Validate metadata completeness
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.id) errors.push("Node metadata must have an ID");
    if (!this.name) errors.push("Node metadata must have a name");
    if (!this.version) errors.push("Node metadata must have a version");
    if (!this.author) errors.push("Node metadata must have an author");
    if (!this.description) errors.push("Node metadata must have a description");
    if (!this.category) errors.push("Node metadata must have a category");
    if (!this.icon) errors.push("Node metadata must have an icon");
    if (!this.keywords || this.keywords.length === 0) {
      errors.push("Node metadata must have at least one keyword");
    }

    // Validate version format (basic semver check)
    if (this.version && !/^\d+\.\d+\.\d+/.test(this.version)) {
      errors.push("Version must follow semantic versioning (e.g., 1.0.0)");
    }

    // Validate runtime if specified
    if (this.runtime && this.runtime.language !== "typescript") {
      errors.push("Only TypeScript runtime is currently supported");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get search terms for this node
   */
  getSearchTerms(): string[] {
    const terms = new Set<string>();

    // Add basic fields
    terms.add(this.id.toLowerCase());
    terms.add(this.name.toLowerCase());
    terms.add(this.description.toLowerCase());
    terms.add(this.category.toLowerCase());

    // Add keywords
    this.keywords.forEach((keyword) => terms.add(keyword.toLowerCase()));

    // Add tags if present
    this.tags?.forEach((tag) => terms.add(tag.toLowerCase()));

    // Add author
    terms.add(this.author.toLowerCase());

    return Array.from(terms);
  }

  /**
   * Check if node matches search query
   */
  matchesSearch(query: string): boolean {
    const lowerQuery = query.toLowerCase();
    const searchTerms = this.getSearchTerms();

    // Check if any search term includes the query
    return searchTerms.some((term) => term.includes(lowerQuery));
  }

  /**
   * Create a copy with overrides
   */
  with(
    overrides: Partial<
      Omit<INodeMetadata, "validate" | "getSearchTerms" | "matchesSearch">
    >,
  ): NodeMetadata {
    return new NodeMetadata({
      id: overrides.id ?? this.id,
      name: overrides.name ?? this.name,
      version: overrides.version ?? this.version,
      author: overrides.author ?? this.author,
      description: overrides.description ?? this.description,
      category: overrides.category ?? this.category,
      type: overrides.type ?? this.type,
      keywords: overrides.keywords ?? this.keywords,
      icon: overrides.icon ?? this.icon,
      tags: overrides.tags ?? this.tags,
      experimental: overrides.experimental ?? this.experimental,
      deprecated: overrides.deprecated ?? this.deprecated,
      documentationUrl: overrides.documentationUrl ?? this.documentationUrl,
      examples: overrides.examples ?? this.examples,
    });
  }
}
