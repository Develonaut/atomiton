import type { NodeDefinition, NodeEdge } from "@atomiton/nodes/definitions";

/**
 * Custom state for editor routes
 * Uses raw NodeDefinitions and NodeEdges - the editor handles transformation
 */
export type EditorRouteState = {
  defaultNodes?: NodeDefinition[];
  defaultEdges?: NodeEdge[];
  name?: string;
  description?: string;
};

/**
 * Extended route state for our application
 */
export type AppRouteState = EditorRouteState;
