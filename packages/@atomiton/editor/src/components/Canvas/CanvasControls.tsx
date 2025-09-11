import { Controls } from "@xyflow/react";
import { styled } from "@atomiton/ui";

export type CanvasControlsProps = {
  className?: string;
  showZoomIn?: boolean;
  showZoomOut?: boolean;
  showFitView?: boolean;
  showInteractive?: boolean;
  placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  [key: string]: unknown;
};

const CanvasControlsStyled = styled(Controls, {
  name: "CanvasControls",
})("atomiton-canvas-controls");

/**
 * Canvas controls - zoom, fit view, etc.
 */
export function CanvasControls({
  showZoomIn = true,
  showZoomOut = true,
  showFitView = true,
  showInteractive = true,
  placement = "bottom-left",
  ...props
}: CanvasControlsProps) {
  return (
    <CanvasControlsStyled
      showZoom={showZoomIn || showZoomOut}
      showFitView={showFitView}
      showInteractive={showInteractive}
      position={placement}
      {...props}
    />
  );
}
