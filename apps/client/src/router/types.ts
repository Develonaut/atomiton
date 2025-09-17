import type { Node } from "@xyflow/react";
import type { CompositeNodeSpec, NodeEdge } from "@atomiton/core";

/**
 * Custom state for editor routes
 */
export type EditorRouteState = {
  defaultNodes?: Array<Node | CompositeNodeSpec>;
  defaultEdges?: NodeEdge[];
  name?: string;
  description?: string;
};

/**
 * Extended route state for our application
 */
export type AppRouteState = EditorRouteState;

// Module augmentation to extend TanStack Router's types
declare module "@tanstack/react-router" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Intentional module augmentation
  interface HistoryState extends AppRouteState {}
}
