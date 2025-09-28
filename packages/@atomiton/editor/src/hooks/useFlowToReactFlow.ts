import { useMemo } from "react";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { flowToReactFlow } from "#utils/transform";

/**
 * Hook to transform a flow (NodeDefinition) to ReactFlow format
 */
export function useFlowToReactFlow(flow?: NodeDefinition) {
  return useMemo(() => {
    if (flow) {
      return flowToReactFlow(flow);
    }
    return { nodes: [], edges: [] };
  }, [flow]);
}