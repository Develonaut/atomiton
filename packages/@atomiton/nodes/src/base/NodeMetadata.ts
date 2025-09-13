/**
 * Node Metadata Base Class
 *
 * Base class for defining node metadata in a structured way.
 * Similar to NodeConfig but for static metadata instead of runtime configuration.
 */

import type { INodeMetadata } from "./INodeMetadata.js";

export abstract class NodeMetadata implements INodeMetadata {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly type: string;
  abstract readonly version: string;
  abstract readonly author: string;
  abstract readonly description: string;
  abstract readonly category: string;
  abstract readonly icon: string;

  // Optional properties with defaults
  readonly experimental: boolean = false;
  readonly deprecated: boolean = false;
  readonly runtime = { language: "typescript" as const };

  // Arrays that can be overridden
  readonly keywords: string[] = [];
  readonly tags: string[] = [];

  /**
   * Validate the node configuration
   * Can be overridden for custom validation
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.id) errors.push("Node ID is required");
    if (!this.name) errors.push("Node name is required");
    if (!this.type) errors.push("Node type is required");
    if (!this.category) errors.push("Node category is required");

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get search terms for this node
   * Can be overridden for custom search behavior
   */
  getSearchTerms(): string[] {
    const terms = new Set<string>();

    // Add basic properties
    terms.add(this.id.toLowerCase());
    terms.add(this.name.toLowerCase());
    terms.add(this.description.toLowerCase());
    terms.add(this.category.toLowerCase());

    // Add keywords and tags
    this.keywords.forEach((keyword) => terms.add(keyword.toLowerCase()));
    this.tags.forEach((tag) => terms.add(tag.toLowerCase()));

    return Array.from(terms);
  }

  /**
   * Check if this node matches a search query
   * Can be overridden for custom matching logic
   */
  matchesSearch(query: string): boolean {
    const lowerQuery = query.toLowerCase();
    const searchTerms = [
      this.id,
      this.name,
      this.description,
      this.category,
      ...this.keywords,
      ...this.tags,
    ];

    return searchTerms.some((term) => term.toLowerCase().includes(lowerQuery));
  }

  /**
   * Get the metadata as a plain object
   * Useful for serialization
   */
  toJSON(): INodeMetadata {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      version: this.version,
      author: this.author,
      description: this.description,
      category: this.category,
      keywords: this.keywords,
      icon: this.icon,
      tags: this.tags,
      runtime: this.runtime,
      experimental: this.experimental,
      deprecated: this.deprecated,
      validate: () => this.validate(),
      getSearchTerms: () => this.getSearchTerms(),
      matchesSearch: (query: string) => this.matchesSearch(query),
    };
  }
}
