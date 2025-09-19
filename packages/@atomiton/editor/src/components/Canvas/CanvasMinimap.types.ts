import type { ComponentProps } from "react";
import type { MiniMap } from "@xyflow/react";
import type { EditorNode } from "../../types/EditorNode";

/**
 * Canvas Minimap component props
 * Extends React Flow's MiniMap props with styled variants
 */
export type CanvasMinimapProps = Omit<
  ComponentProps<typeof MiniMap>,
  "position" | "nodeColor" | "nodeStrokeColor"
> & {
  /**
   * Whether to show the minimap
   * @default true
   */
  show?: boolean;

  /**
   * Placement of the minimap on the canvas
   * @default "bottom-right"
   */
  placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";

  /**
   * Theme variant for the minimap
   * @default "light"
   */
  theme?: "light" | "dark" | "transparent";

  /**
   * Size variant for the minimap
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /**
   * Function to determine node color in the minimap
   */
  nodeColor?: (node: EditorNode) => string;

  /**
   * Function to determine node stroke color in the minimap
   */
  nodeStrokeColor?: (node: EditorNode) => string;

  /**
   * Border radius for nodes in the minimap
   * @default 2
   */
  nodeBorderRadius?: number;
};
