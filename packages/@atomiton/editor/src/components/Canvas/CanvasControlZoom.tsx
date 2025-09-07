import type { CanvasControlActionProps } from "./Canvas.types";

/**
 * Canvas control actions - zoom in/out, reset, etc.
 */
export function CanvasControlZoom({
  onClick,
  ...props
}: CanvasControlActionProps) {
  return (
    <button
      className="atomiton-canvas-control-zoom"
      onClick={onClick}
      aria-label="Zoom"
      {...props}
    >
      Zoom
    </button>
  );
}
