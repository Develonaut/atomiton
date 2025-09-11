import { styled } from "@atomiton/ui";

export type CanvasSelectionProps = {
  className?: string;
  enabled?: boolean;
  mode?: "partial" | "full";
  [key: string]: unknown;
};

const CanvasSelectionStyled = styled("div", {
  name: "CanvasSelection",
})("atomiton-canvas-selection");

/**
 * Canvas selection box
 */
export function CanvasSelection({
  enabled = true,
  mode = "partial",
  ...props
}: CanvasSelectionProps) {
  return (
    <CanvasSelectionStyled data-enabled={enabled} data-mode={mode} {...props} />
  );
}
