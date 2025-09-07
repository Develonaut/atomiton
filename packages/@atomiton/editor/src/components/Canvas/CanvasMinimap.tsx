import { MiniMap, type Node } from "@xyflow/react";
import { styled } from "@atomiton/ui";

export interface CanvasMinimapProps {
  className?: string;
  show?: boolean;
  placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  nodeColor?: (node: Node) => string;
  nodeStrokeColor?: (node: Node) => string;
  nodeBorderRadius?: number;
}

const CanvasMinimapStyled = styled(MiniMap, {
  name: "CanvasMinimap",
})("atomiton-canvas-minimap");

/**
 * Canvas minimap
 */
export function CanvasMinimap({
  show = true,
  placement = "bottom-right",
  nodeColor,
  nodeStrokeColor,
  nodeBorderRadius = 2,
  ...props
}: CanvasMinimapProps) {
  if (!show) return null;

  return (
    <CanvasMinimapStyled
      position={placement}
      nodeColor={nodeColor}
      nodeStrokeColor={nodeStrokeColor}
      nodeBorderRadius={nodeBorderRadius}
      {...props}
    />
  );
}
