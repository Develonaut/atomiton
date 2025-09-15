import { getNodes } from "@atomiton/nodes";
import type { NodeTypes } from "@xyflow/react";
import { useMemo } from "react";
import Node from "../components/Node";

/**
 * Hook to get node types for ReactFlow
 * Returns all registered node types using our custom Node component
 */
export function useNodeTypes(): NodeTypes {
  return useMemo(() => {
    // Get all registered nodes
    const nodeList = getNodes();

    // Create ReactFlow NodeTypes object - map each type to our Node component
    const reactFlowNodeTypes: NodeTypes = {};

    for (const node of nodeList) {
      // Use the actual type from node metadata (e.g., "image-composite")
      reactFlowNodeTypes[node.metadata.type] = Node;
    }

    // Add composite node type for blueprints
    // Composite nodes are created dynamically and use "composite" as their type
    reactFlowNodeTypes["composite"] = Node;

    return reactFlowNodeTypes;
  }, []);
}
