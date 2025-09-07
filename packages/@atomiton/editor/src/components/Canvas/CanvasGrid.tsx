import { Background, BackgroundVariant } from "@xyflow/react";
import { styled } from "@atomiton/ui";

export interface CanvasGridProps {
  className?: string;
  variant?: "dots" | "lines" | "cross";
  gap?: number;
  size?: number;
  color?: string;
}

const CanvasGridStyled = styled(Background, {
  name: "CanvasGrid",
})("atomiton-canvas-grid");

/**
 * Canvas grid/background
 */
export function CanvasGrid({
  variant = "dots",
  gap = 16,
  size = 1,
  color = "#e2e2e2",
  ...props
}: CanvasGridProps) {
  // Convert string variant to BackgroundVariant enum
  const bgVariant =
    variant === "dots"
      ? BackgroundVariant.Dots
      : variant === "lines"
        ? BackgroundVariant.Lines
        : BackgroundVariant.Cross;

  return (
    <CanvasGridStyled
      variant={bgVariant}
      gap={gap}
      size={size}
      color={color}
      {...props}
    />
  );
}
