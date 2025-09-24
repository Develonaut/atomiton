import { useEditorStore } from "#hooks/useEditorStore";
import type { FitViewOptions, Viewport } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
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

/**
 * Hook to efficiently manage viewport state in the editor.
 * Uses React Flow's internal store for optimal performance.
 *
 * @performance
 * - Uses `useStore` to only subscribe to zoom changes
 * - Memoizes zoom percentage calculation
 * - Avoids unnecessary re-renders from viewport x/y changes when only zoom is needed
 */
export function useEditorViewport(): EditorViewportHook {
  const { getZoom, zoomIn, zoomOut, zoomTo, fitView } = useReactFlow();

  // Only subscribe to zoom changes, not x/y position changes
  const zoom = useEditorStore((state) => state.transform[2]);

  const zoomPercent = useMemo(() => {
    return `${Math.round(zoom * 100)}%`;
  }, [zoom]);

  // These functions are stable references from useReactFlow, no need to memoize
  return {
    zoom,
    zoomPercent,
    getZoom,
    zoomIn,
    zoomOut,
    zoomTo,
    fitView,
  };
}
