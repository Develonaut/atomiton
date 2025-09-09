import { core } from "@atomiton/core";
import { useMemo } from "react";
import type { NodeTypes } from "@xyflow/react";
import { wrapNodeComponents } from "../components/ReactFlowNodeWrapper";

/**
 * Hook to get node types for ReactFlow
 * Handles fetching node components from the nodes API and wrapping them
 * with ReactFlow-specific features like handles
 */
export function useNodeTypes(customNodeTypes?: NodeTypes): NodeTypes {
  return useMemo(() => {
    // If custom node types are provided, use them directly
    if (customNodeTypes) {
      return customNodeTypes;
    }

    // Otherwise, get components from the nodes API and wrap them for ReactFlow
    const components = core.nodes.getNodeComponents();
    return wrapNodeComponents(components as any) as NodeTypes;
  }, [customNodeTypes]);
}
