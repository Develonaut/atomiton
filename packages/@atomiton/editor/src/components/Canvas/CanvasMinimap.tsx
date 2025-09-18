import { styled } from "@atomiton/ui";
import { MiniMap } from "@xyflow/react";
import type { EditorNode } from "../../hooks/useEditorNodes";

type CanvasMinimapProps = {
  className?: string;
  show?: boolean;
  placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  nodeColor?: (node: EditorNode) => string;
  nodeStrokeColor?: (node: EditorNode) => string;
  nodeBorderRadius?: number;
};

const CanvasMinimapStyled = styled(MiniMap, {
  name: "CanvasMinimap",
})("border border-s-02 bg-surface-transparent rounded-xl");

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
