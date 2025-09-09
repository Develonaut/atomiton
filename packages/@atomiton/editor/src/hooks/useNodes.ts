import { editorStore } from "../store";
import { useStore, shallow } from "./useStore";

/**
 * Thin wrapper hook that exposes node-related store state and actions
 */
export function useNodes() {
  const selectedId = useStore((state) => state.selectedNodeId);
  const nodes = useStore((state) => state.flowSnapshot.nodes, shallow);

  return {
    nodes,
    selectedId,
    selectNode: editorStore.selectNode,
    deleteNode: editorStore.deleteNode,
    addNode: editorStore.addNode,
  };
}
