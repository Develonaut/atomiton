import { useEditorStore } from "#hooks/useEditorStore";
import type { EditorNode } from "#types/EditorNode";

export function useSelectedNodes<
  NodeType extends EditorNode = EditorNode,
>(): NodeType[] {
  return useEditorStore((state) => {
    const selected = [];
    for (const [, node] of state.nodeLookup) {
      if (node.selected) {
        selected.push(node.internals.userNode);
      }
    }
    return selected as NodeType[];
  });
}
