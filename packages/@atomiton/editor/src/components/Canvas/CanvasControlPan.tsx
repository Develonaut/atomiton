import type { CanvasControlActionProps } from "./Canvas.types";

export function CanvasControlPan({
  onClick,
  ...props
}: CanvasControlActionProps) {
  return (
    <button
      className="atomiton-canvas-control-pan"
      onClick={onClick}
      aria-label="Pan"
      {...props}
    >
      Pan
    </button>
  );
}
