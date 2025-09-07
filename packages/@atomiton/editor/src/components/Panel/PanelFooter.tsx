import { styled } from "@atomiton/ui";
import type { PanelFooterProps } from "./Panel.types";

const PanelFooterStyled = styled("div", {
  name: "PanelFooter",
})(
  [
    "atomiton-panel-footer",
    "flex",
    "px-4",
    "py-3",
    "border-t",
    "border-s-01",
    "bg-surface-01",
    "rounded-b-[1.25rem]",
  ],
  {
    variants: {
      align: {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
        between: "justify-between",
      },
    },
    defaultVariants: {
      align: "right",
    },
  },
);

/**
 * Panel footer for actions and navigation
 */
export function PanelFooter({
  children,
  align = "right",
  ...props
}: PanelFooterProps) {
  return (
    <PanelFooterStyled align={align} {...props}>
      {children}
    </PanelFooterStyled>
  );
}
