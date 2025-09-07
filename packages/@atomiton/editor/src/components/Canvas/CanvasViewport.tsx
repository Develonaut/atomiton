import { styled } from "@atomiton/ui";
import type { CanvasViewportProps } from "./Canvas.types";

const CanvasViewportStyled = styled("div", {
  name: "CanvasViewport",
})("atomiton-canvas-viewport absolute inset-0");

/**
 * Canvas viewport - container for the draggable/zoomable area
 */
export function CanvasViewport({
  children,
  className,
  minZoom = 0.1,
  maxZoom = 2,
  defaultZoom = 1,
  zoomOnScroll: _zoomOnScroll = true,
  zoomOnPinch: _zoomOnPinch = true,
  panOnScroll: _panOnScroll = false,
  panOnDrag: _panOnDrag = true,
  preventScrolling: _preventScrolling = true,
  ...props
}: CanvasViewportProps) {
  return (
    <CanvasViewportStyled
      className={className}
      data-min-zoom={minZoom}
      data-max-zoom={maxZoom}
      data-default-zoom={defaultZoom}
      {...props}
    >
      {children}
    </CanvasViewportStyled>
  );
}
