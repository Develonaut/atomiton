import { styled } from "@atomiton/ui";
import type { InspectorActionsProps } from "./Inspector.types";

const InspectorActionsStyled = styled("div", {
  name: "InspectorActions",
})(
  [
    "atomiton-inspector-actions",
    "flex",
    "items-center",
    "px-4",
    "py-3",
    "border-t",
    "border-s-01",
    "bg-surface-02",
  ],
  {
    variants: {
      align: {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
        between: "justify-between",
      },
      spacing: {
        sm: "gap-2",
        md: "gap-3",
        lg: "gap-4",
      },
    },
    defaultVariants: {
      align: "right",
      spacing: "md",
    },
  },
);

/**
 * Inspector actions - buttons for various actions
 */
export function InspectorActions({
  children,
  className,
  align = "right",
  spacing = "md",
  ...props
}: InspectorActionsProps) {
  return (
    <InspectorActionsStyled
      align={align}
      spacing={spacing}
      className={className}
      data-align={align}
      data-spacing={spacing}
      {...props}
    >
      {children}
    </InspectorActionsStyled>
  );
}
