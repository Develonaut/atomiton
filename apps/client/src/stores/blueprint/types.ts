/**
 * Blueprint Store Types
 *
 * Blueprints are serializable representations of composite nodes.
 * We store only the data, not the full composite node with functions.
 */

import type { ICompositeNode } from "@atomiton/nodes";
import type { CrudActions } from "./modules/crud";

/**
 * Serializable Blueprint data
 * Contains only data fields, no functions
 */
export type BlueprintData = {
  id: string;
  name: string;
  type: string;
  metadata: {
    description?: string;
    category?: string;
    authorId?: string;
    tags?: string[];
    [key: string]: any;
  };
  inputPorts: any[];
  outputPorts: any[];
  nodes: any[];
  edges: any[];
  variables?: any;
  settings?: any;
  content?: string;
  lastModified?: string;
  author?: string;
  isPublic?: boolean;
  isTemplate?: boolean;
};

/**
 * A Blueprint is the serializable data
 */
export type Blueprint = BlueprintData;

/**
 * Blueprint state for the store
 * Separates templates (read-only) from user-created blueprints
 */
export type BlueprintState = {
  templates: Blueprint[]; // Read-only templates from @atomiton/nodes
  userBlueprints: Blueprint[]; // User-created and editable blueprints
  isLoading: boolean;
  error: string | null;
};

export type BlueprintStoreActions = BaseStore & CrudActions;

export type BaseStore = {
  getState: () => BlueprintState;
  setState: (updater: (state: BlueprintState) => void) => void;
  subscribe: (listener: (state: BlueprintState) => void) => () => void;
};

/**
 * Helper to convert ICompositeNode to serializable BlueprintData
 */
export function compositeNodeToBlueprint(node: ICompositeNode): Blueprint {
  return {
    id: node.id,
    name: node.name,
    type: node.type,
    metadata: { ...node.metadata },
    inputPorts: node.inputPorts || [],
    outputPorts: node.outputPorts || [],
    nodes: node.getChildNodes ? node.getChildNodes() : [],
    edges: node.getExecutionFlow ? node.getExecutionFlow() : [],
    variables: (node as any).variables,
    settings: (node as any).settings,
  };
}
