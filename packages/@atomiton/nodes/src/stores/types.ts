/**
 * Node Store Types
 *
 * Shared types for the node store modules
 */

import type { Store } from "@atomiton/store";
import type { INodeMetadata, Node } from "../base";

/**
 * Node store state - all node-related data in one place
 */
export interface NodeStoreState {
  // Node metadata indexed by type
  metadata: Map<string, INodeMetadata>;

  // Node configurations indexed by type
  configs: Map<string, any>;

  // Node logic implementations indexed by type
  logic: Map<string, any>;

  // Full node implementations indexed by type
  nodes: Map<string, Node>;

  // Categories with their nodes (derived from metadata)
  categories: Array<{
    name: string;
    displayName: string;
    items: INodeMetadata[];
  }>;

  // Track last update times for each domain
  lastUpdated: {
    metadata: number | null;
    configs: number | null;
    logic: number | null;
    nodes: number | null;
  };

  // Loading states for each domain
  loading: {
    metadata: boolean;
    configs: boolean;
    logic: boolean;
    nodes: boolean;
  };

  // Error states for each domain
  errors: {
    metadata: Error | null;
    configs: Error | null;
    logic: Error | null;
    nodes: Error | null;
  };
}

/**
 * Base store type that modules can use
 */
export type BaseStore = Store<NodeStoreState>;
