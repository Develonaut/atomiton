import { editorStore } from "../store";
import { useStore } from "./useStore";

/**
 * Thin wrapper hook that exposes undo/redo store state and actions
 */
export function useUndoRedo() {
  const canUndo = useStore((state) => state.history.past.length > 0);
  const canRedo = useStore((state) => state.history.future.length > 0);

  return {
    canUndo,
    canRedo,
    undo: editorStore.undo,
    redo: editorStore.redo,
  };
}
