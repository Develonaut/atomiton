import { styled } from "@atomiton/ui";
import type { ElementOverlayProps } from "./Element.types";

const ElementOverlayStyled = styled("div", {
  name: "ElementOverlay",
})(
  [
    "atomiton-element-overlay",
    "absolute",
    "inset-0",
    "pointer-events-none",
    "transition-opacity",
    "duration-200",
    "rounded-lg",
  ],
  {
    variants: {
      type: {
        selection: "ring-2 ring-accent-primary/50 bg-accent-primary/5",
        hover: "bg-accent-primary/10",
        highlight: "bg-status-warning/10 ring-2 ring-status-warning/50",
        error: "bg-status-error/10 ring-2 ring-status-error/50",
      },
      visible: {
        true: "opacity-100",
        false: "opacity-0",
      },
    },
    defaultVariants: {
      type: "selection",
      visible: false,
    },
  },
);

/**
 * Element overlay - selected/hover state overlay
 */
export function ElementOverlay({
  className,
  visible = false,
  type = "selection",
  content,
  ...props
}: ElementOverlayProps) {
  return (
    <ElementOverlayStyled
      type={type}
      visible={visible}
      className={className}
      data-type={type}
      data-visible={visible || undefined}
      {...props}
    >
      {content}
    </ElementOverlayStyled>
  );
}
