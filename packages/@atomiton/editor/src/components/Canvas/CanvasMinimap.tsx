import type { CanvasMinimapProps } from "#components/Canvas/CanvasMinimap.types";
import { styled } from "@atomiton/ui";
import { MiniMap } from "@xyflow/react";
import { memo } from "react";

/**
 * Styled MiniMap using UI package's styled function
 */
const StyledMiniMap = styled(MiniMap, { name: "CanvasMinimap" })(
  ["border", "rounded-xl", "transition-all", "duration-200", "shadow-sm"],
  {
    variants: {
      theme: {
        light: [
          "bg-white/90",
          "border-gray-200",
          "backdrop-blur-sm",
          "hover:shadow-md",
        ],
        dark: [
          "bg-gray-900/90",
          "border-gray-700",
          "backdrop-blur-sm",
          "hover:shadow-md",
        ],
        transparent: ["bg-white/50", "border-gray-300/50", "backdrop-blur-md"],
      },
      size: {
        sm: ["w-32", "h-24"],
        md: ["w-40", "h-30"],
        lg: ["w-48", "h-36"],
      },
    },
    defaultVariants: {
      theme: "light",
      size: "md",
    },
  }
);

/**
 * Canvas Minimap Component
 *
 * A performant minimap component for the editor canvas that:
 * - Uses UI package's styled function
 * - Uses Bento Box architecture
 * - Provides flexible positioning
 * - Supports custom node coloring
 */
function CanvasMinimapComponent({
  show = true,
  placement = "bottom-right",
  theme = "light",
  size = "md",
  nodeColor,
  nodeStrokeColor,
  nodeBorderRadius = 2,
  className,
  ...props
}: CanvasMinimapProps) {
  if (!show) return null;

  return (
    <StyledMiniMap
      position={placement}
      nodeColor={nodeColor}
      nodeStrokeColor={nodeStrokeColor}
      nodeBorderRadius={nodeBorderRadius}
      theme={theme}
      size={size}
      className={className}
      {...props}
    />
  );
}

// Memoize to prevent unnecessary re-renders
export const CanvasMinimap = memo(CanvasMinimapComponent);

// Default export for backward compatibility
export default CanvasMinimap;
