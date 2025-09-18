import { shallow } from "@atomiton/store";
import { useStore } from "@xyflow/react";
import type { EditorNode } from "./useEditorNodes";

/**
 * Hook to efficiently track all currently selected nodes in React Flow.
 *
 * This hook uses React Flow's internal `nodeLookup` map for O(1) node access
 * and only triggers re-renders when selection state changes, not when any
 * node property changes. This is significantly more performant than using
 * `useNodes().filter(node => node.selected)` which would re-render on every
 * node change.
 *
 * @public
 * @template NodeType - The type of nodes in your flow, extending the base Node type
 * @returns An array of selected node objects with all their properties
 *
 * @example
 * ```tsx
 * import { useSelectedNodes } from './hooks';
 *
 * function SelectionDisplay() {
 *   const selectedNodes = useSelectedNodes();
 *
 *   return (
 *     <div>
 *       Selected: {selectedNodes.map(node => node.id).join(', ')}
 *     </div>
 *   );
 * }
 * ```
 *
 * @performance
 * - Uses `state.nodeLookup` Map for O(1) node access instead of array iteration
 * - Leverages shallow comparison to prevent unnecessary re-renders
 * - Only subscribes to selection changes, not all node changes
 * - Extracts `userNode` from internal representation for clean API
 *
 * @see {@link useSelectedNode} for single node selection scenarios
 * @see {@link https://reactflow.dev/api-reference/hooks/use-store} for custom selectors
 */
export function useSelectedNodes<
  NodeType extends EditorNode = EditorNode,
>(): NodeType[] {
  const selectedNodes = useStore((state) => {
    const selectedNodes = [];
    for (const [, node] of state.nodeLookup) {
      if (node.selected) {
        selectedNodes.push(node.internals.userNode);
      }
    }
    return selectedNodes as NodeType[];
  }, shallow);

  return selectedNodes;
}
