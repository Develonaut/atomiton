import { useEditorStore } from "#hooks/useEditorStore";
import type { EditorNode } from "#types/EditorNode";

export function useSelectedNode<
  NodeType extends EditorNode = EditorNode,
>(): NodeType | null {
  return useEditorStore((state) => {
    for (const [, node] of state.nodeLookup) {
      if (node.selected) {
        return node.internals.userNode as NodeType;
      }
    }
    return null;
  });
}
