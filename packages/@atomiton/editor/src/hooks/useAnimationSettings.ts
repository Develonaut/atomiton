import { useState } from "react";
import { useDidMount, useEventCallback } from "@atomiton/hooks";
import { editorStore } from "../store";
import type { EditorState } from "../store/types";

export function useAnimationSettings() {
  const [isAnimationSettings, setIsAnimationSettings] = useState(false);

  useDidMount(() => {
    setIsAnimationSettings(editorStore.getState().isAnimationSettings);

    const unsubscribe = editorStore.subscribe((state: EditorState) => {
      setIsAnimationSettings(state.isAnimationSettings);
    });

    return unsubscribe;
  });

  const openAnimationSettings = useEventCallback(() => {
    editorStore.openAnimationSettings();
  });

  const closeAnimationSettings = useEventCallback(() => {
    editorStore.closeAnimationSettings();
  });

  return {
    isAnimationSettings,
    openAnimationSettings,
    closeAnimationSettings,
  };
}
