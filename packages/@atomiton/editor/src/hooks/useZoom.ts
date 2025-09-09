import { editorStore } from "../store";
import { useStore } from "./useStore";

/**
 * Thin wrapper hook that exposes zoom-related store state and actions
 */
export function useZoom() {
  const zoom = useStore((state) => state.zoom);

  return {
    zoom,
    zoomIn: editorStore.zoomIn,
    zoomOut: editorStore.zoomOut,
    zoomTo: editorStore.zoomTo,
    fitView: editorStore.fitView,
    handleViewportChange: editorStore.handleViewportChange,
  };
}
