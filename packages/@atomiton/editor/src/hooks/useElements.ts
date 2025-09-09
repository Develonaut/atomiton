import { editorStore } from "../store";
import { useStore, shallow } from "./useStore";

/**
 * Thin wrapper hook that exposes element-related store state and actions
 */
export function useElements() {
  const selectedId = useStore((state) => state.selectedElementId);
  const elements = useStore((state) => state.flowSnapshot.nodes, shallow);

  return {
    elements,
    selectedId,
    selectElement: editorStore.selectElement,
    deleteElement: editorStore.deleteElement,
    addElement: editorStore.addNode,
  };
}
