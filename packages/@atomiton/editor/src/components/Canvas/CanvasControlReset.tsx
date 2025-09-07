import type { CanvasControlActionProps } from "./Canvas.types";

export function CanvasControlReset({
  onClick,
  ...props
}: CanvasControlActionProps) {
  return (
    <button
      className="atomiton-canvas-control-reset"
      onClick={onClick}
      aria-label="Reset View"
      {...props}
    >
      Reset
    </button>
  );
}
