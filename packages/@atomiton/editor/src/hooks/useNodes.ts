import { useEventCallback } from "@atomiton/hooks";
import type { Node } from "@xyflow/react";
import { editorStore } from "../store";

export function useNodes() {
  const handleAddNode = useEventCallback((node: Node) => {
    editorStore.addNode(node);
  });

  const handleUpdateNode = useEventCallback(
    (id: string, updates: Partial<Node>) => {
      editorStore.updateNode(id, updates);
    },
  );

  const handleDeleteNode = useEventCallback((id: string) => {
    editorStore.deleteNode(id);
  });

  const handleSetNodes = useEventCallback((nodes: Node[]) => {
    editorStore.setNodes(nodes);
  });

  const handleSelectNode = useEventCallback((id: string | null) => {
    editorStore.selectNode(id);
  });

  const getNodes = useEventCallback(() => {
    return editorStore.getNodes();
  });

  return {
    addNode: handleAddNode,
    updateNode: handleUpdateNode,
    deleteNode: handleDeleteNode,
    setNodes: handleSetNodes,
    selectNode: handleSelectNode,
    getNodes,
  };
}
