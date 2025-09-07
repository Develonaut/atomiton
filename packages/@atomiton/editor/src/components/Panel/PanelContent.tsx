import { styled } from "@atomiton/ui";
import type { PanelContentProps } from "./Panel.types";

const PanelContentStyled = styled("div", {
  name: "PanelContent",
})(["atomiton-panel-content", "flex-1", "overflow-hidden"], {
  variants: {
    scrollable: {
      true: "overflow-y-auto scrollbar-none",
      false: "overflow-hidden",
    },
    padding: {
      sm: "p-2",
      md: "p-4",
      lg: "p-6",
    },
  },
  defaultVariants: {
    scrollable: false,
    padding: "md",
  },
});

/**
 * Panel content area with optional scrolling
 */
export function PanelContent({
  children,
  scrollable = false,
  padding = "md",
  ...props
}: PanelContentProps) {
  return (
    <PanelContentStyled
      scrollable={scrollable}
      padding={padding}
      data-scrollable={scrollable || undefined}
      {...props}
    >
      {children}
    </PanelContentStyled>
  );
}
