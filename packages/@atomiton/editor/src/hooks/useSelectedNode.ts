import { shallow } from "@atomiton/store";
import { useStore } from "@xyflow/react";
import type { EditorNode } from "./useEditorNodes";

/**
 * Hook to efficiently track the first currently selected node in React Flow.
 *
 * This hook is optimized for single-selection scenarios where you only need
 * one selected node. It returns immediately on the first match, avoiding
 * full iteration through all nodes. Uses React Flow's internal `nodeLookup`
 * for O(1) access and shallow comparison for minimal re-renders.
 *
 * @public
 * @template NodeType - The type of nodes in your flow, extending the base Node type
 * @returns The first selected node object, or null if no nodes are selected
 *
 * @example
 * ```tsx
 * import { useSelectedNode } from './hooks';
 *
 * function NodeInspector() {
 *   const selectedNode = useSelectedNode();
 *
 *   if (!selectedNode) {
 *     return <div>No node selected</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <h3>Selected: {selectedNode.id}</h3>
 *       <p>Type: {selectedNode.type}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @performance
 * - Returns immediately on first match, avoiding full node iteration
 * - Uses `state.nodeLookup` Map for O(1) node access
 * - Shallow comparison prevents re-renders when selection IDs don't change
 * - More efficient than `useSelectedNodes()[0]` for single-selection UIs
 *
 * @see {@link useSelectedNodes} for multi-selection scenarios
 * @see {@link useSelectedNodeIds} for ID-only selection tracking
 */
export function useSelectedNode<
  NodeType extends EditorNode = EditorNode,
>(): NodeType | null {
  const selectedNode = useStore((state) => {
    for (const [, node] of state.nodeLookup) {
      if (node.selected) {
        return node.internals.userNode as NodeType;
      }
    }
    return null;
  }, shallow);

  return selectedNode;
}
