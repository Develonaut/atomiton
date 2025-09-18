import type { EditorEdge, EditorNode } from "@atomiton/editor";

/**
 * Custom state for editor routes
 */
export type EditorRouteState = {
  defaultNodes?: EditorNode[];
  defaultEdges?: EditorEdge[];
  name?: string;
  description?: string;
};

/**
 * Extended route state for our application
 */
export type AppRouteState = EditorRouteState;
