import { useState, useEffect } from "react";
import { useEventCallback } from "@atomiton/hooks";
import { editorStore } from "../store";
import type { EditorState } from "../store/types";

export function useZoom() {
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    const state = editorStore.getState();
    setZoom(state.zoom);

    const unsubscribe = editorStore.subscribe((state: EditorState) => {
      setZoom(state.zoom);
    });

    const checkZoom = () => {
      const flowInstance = editorStore.getFlowInstance();
      if (flowInstance) {
        const viewport = flowInstance.getViewport();
        const newZoom = Math.max(
          10,
          Math.min(100, Math.round(viewport.zoom * 100)),
        );
        if (newZoom !== editorStore.getState().zoom) {
          editorStore.setZoom(newZoom);
        }
      }
    };

    const interval = setInterval(checkZoom, 100);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const zoomIn = useEventCallback(() => {
    editorStore.zoomIn();
  });

  const zoomOut = useEventCallback(() => {
    editorStore.zoomOut();
  });

  const zoomTo = useEventCallback((percentage: number) => {
    editorStore.zoomTo(percentage);
  });

  const fitView = useEventCallback(() => {
    editorStore.fitView();
  });

  return {
    zoom,
    zoomIn,
    zoomOut,
    zoomTo,
    fitView,
  };
}
