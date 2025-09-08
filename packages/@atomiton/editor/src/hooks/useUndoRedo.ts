import { useState } from "react";
import { useDidMount, useEventCallback } from "@atomiton/hooks";
import { editorStore } from "../store";
import type { EditorState } from "../store/types";

function performUndo(): void {
  editorStore.undo();
}

function performRedo(): void {
  editorStore.redo();
}

export function useUndoRedo() {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useDidMount(() => {
    setCanUndo(editorStore.canUndo());
    setCanRedo(editorStore.canRedo());

    const unsubscribe = editorStore.subscribe((state: EditorState) => {
      setCanUndo(state.history.past.length > 0);
      setCanRedo(state.history.future.length > 0);
    });

    return unsubscribe;
  });

  const undo = useEventCallback(performUndo);
  const redo = useEventCallback(performRedo);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
  };
}
