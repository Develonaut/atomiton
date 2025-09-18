import type { FitViewOptions, Viewport } from "@xyflow/react";
import { useReactFlow, useViewport } from "@xyflow/react";
import { useMemo } from "react";

export type ViewportOptions = Viewport;

export type EditorViewportHook = {
  zoom: number;
  zoomPercent: string;
  getZoom: () => number;
  zoomIn: (options?: { duration?: number }) => Promise<boolean>;
  zoomOut: (options?: { duration?: number }) => Promise<boolean>;
  zoomTo: (
    zoomLevel: number,
    options?: { duration?: number },
  ) => Promise<boolean>;
  fitView: (options?: FitViewOptions) => Promise<boolean>;
};

export function useEditorViewport(): EditorViewportHook {
  const { getZoom, zoomIn, zoomOut, zoomTo, fitView } = useReactFlow();
  const { zoom } = useViewport();

  const zoomPercent = useMemo(() => {
    return `${Math.round(zoom * 100)}%`;
  }, [zoom]);

  return useMemo(
    () => ({
      zoom,
      zoomPercent,
      getZoom,
      zoomIn,
      zoomOut,
      zoomTo,
      fitView,
    }),
    [zoom, zoomPercent, getZoom, zoomIn, zoomOut, zoomTo, fitView],
  );
}
