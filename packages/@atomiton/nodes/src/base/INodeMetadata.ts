/**
 * Node Metadata Type Definitions
 *
 * Types related to node metadata for discovery, search, and UI display
 */

import type { NodeCategory, NodeIcon, NodeRuntime } from "./types";

/**
 * Node Metadata Interface
 *
 * Defines all metadata for a node that's used for:
 * - Discovery and search
 * - UI display in the assets panel
 * - Community node registration
 * - Documentation and help
 */
export type INodeMetadata = {
  id: string;
  name: string;
  type: string;
  version: string;
  author: string;
  authorId?: string;
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
