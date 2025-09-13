import core from "@atomiton/core";
import type { NodeTypes } from "@xyflow/react";
import { useMemo } from "react";
import Node from "../components/Node";

/**
 * Hook to get node types for ReactFlow
 * Returns all registered node types using our custom Node component
 */
export function useNodeTypes(
  customNodeTypes?: Record<string, React.ComponentType<unknown>>,
): NodeTypes {
  return useMemo(() => {
    // If custom node types are provided, use them directly
    if (customNodeTypes) {
      return customNodeTypes as NodeTypes;
    }

    // Get all registered node types and map them to our Node component
    const registeredNodes = core.nodes.getAllRegisteredNodes();
    const nodeTypes: NodeTypes = {};

    // Create a node type entry for each registered node, all using the same component
    for (const nodeType of registeredNodes) {
      nodeTypes[nodeType.definition.id] = Node;
    }

    return Object.keys(nodeTypes).length > 0 ? nodeTypes : {};
  }, [customNodeTypes]);
}
