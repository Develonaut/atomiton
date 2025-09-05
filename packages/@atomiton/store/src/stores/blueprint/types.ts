/**
 * Blueprint Store Types
 */

export interface Blueprint {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  created: Date;
  modified: Date;
  tags: string[];
  nodes: unknown[]; // Node definitions
  connections: unknown[]; // Connection definitions
  metadata: Record<string, unknown>;
}

export interface BlueprintState {
  // All blueprints indexed by ID
  blueprints: Map<string, Blueprint>;

  // Currently selected blueprint ID
  selectedBlueprintId: string | null;

  // Search and filter state
  searchQuery: string;
  filterTags: string[];
  sortBy: "name" | "created" | "modified" | "author";
  sortDirection: "asc" | "desc";

  // UI state
  isLoading: boolean;
  error: string | null;
}
