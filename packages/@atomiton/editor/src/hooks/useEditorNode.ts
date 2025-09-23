import { useReactFlow } from "@xyflow/react";
import { useEditorStore } from "#hooks/useEditorStore";
import { useCallback } from "react";
import type { EditorNode } from "#types/EditorNode";

/**
 * Hook to get a specific node by ID from the editor.
 * Uses React Flow's internal nodeLookup for O(1) access and shallow comparison
 * to minimize re-renders. Only re-renders when the specific node changes.
 *
 * @performance
 * - Uses `state.nodeLookup` Map for O(1) node access instead of array iteration
 * - Shallow comparison prevents re-renders when the node hasn't actually changed
 * - Component only re-renders when the specific node it's watching changes
 */
export function useEditorNode(nodeId: string) {
  const { getNode, setNodes } = useReactFlow();

  // Use useEditorStore with shallow comparison for both node and selection state
  const { node, isSelected } = useEditorStore((state) => {
    const nodeInternal = state.nodeLookup.get(nodeId);
    return {
      node: nodeInternal?.internals.userNode as EditorNode | undefined,
      isSelected: nodeInternal?.selected || false,
    };
  });

  const getTypedNode = useCallback(() => {
    return getNode(nodeId) as EditorNode | undefined;
  }, [getNode, nodeId]);

  // Select this node (and deselect all others)
  const selectNode = useCallback(() => {
    setNodes((nodes) =>
      nodes.map((n) => ({
        ...n,
        selected: n.id === nodeId,
      })),
    );
  }, [setNodes, nodeId]);

  return {
    node,
    getNode: getTypedNode,
    isSelected,
    selectNode,
  };
}
