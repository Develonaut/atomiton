/**
 * Node Metadata Type Definitions
 *
 * Types related to node metadata for discovery, search, and UI display
 */

/**
 * Node Metadata Interface
 *
 * Defines all metadata for a node that's used for:
 * - Discovery and search
 * - UI display in the assets panel
 * - Community node registration
 * - Documentation and help
 */
export interface INodeMetadata {
  /** Unique identifier for the node */
  id: string;

  /** Display name for the node */
  name: string;

  /** Node version (semantic versioning) */
  version: string;

  /** Node author/creator */
  author: string;

  /** Detailed description of what the node does */
  description: string;

  /** Category for organizing nodes */
  category: string;

  /** Node type identifier (used for instantiation) */
  type: string;

  /** Keywords for search and discovery */
  keywords: string[];

  /** Icon identifier or path */
  icon: string;

  /** Tags for additional categorization */
  tags?: string[];

  /** Whether this node is experimental */
  experimental?: boolean;

  /** Whether this node is deprecated */
  deprecated?: boolean;

  /** Documentation URL */
  documentationUrl?: string;

  /** Examples of usage */
  examples?: Array<{
    name: string;
    description: string;
    config: Record<string, unknown>;
  }>;

  /** Validate metadata completeness */
  validate(): { valid: boolean; errors: string[] };

  /** Get search terms for this node */
  getSearchTerms(): string[];

  /** Check if node matches search query */
  matchesSearch(query: string): boolean;
}
