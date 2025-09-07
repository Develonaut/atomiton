import { styled } from "@atomiton/ui";
import type { ToolbarGroupProps } from "./Toolbar.types";

const ToolbarGroupStyled = styled("div", {
  name: "ToolbarGroup",
})(["atomiton-toolbar-group", "flex", "items-center"], {
  variants: {
    spacing: {
      sm: "gap-1",
      md: "gap-2",
      lg: "gap-3",
    },
  },
  defaultVariants: {
    spacing: "md",
  },
});

/**
 * Toolbar group for organizing related buttons
 */
export function ToolbarGroup({
  children,
  title,
  spacing = "md",
  ...props
}: ToolbarGroupProps) {
  return (
    <ToolbarGroupStyled
      spacing={spacing}
      role="group"
      aria-label={title}
      {...props}
    >
      {children}
    </ToolbarGroupStyled>
  );
}
