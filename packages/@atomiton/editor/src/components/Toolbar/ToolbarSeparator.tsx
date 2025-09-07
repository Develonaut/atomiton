import { styled } from "@atomiton/ui";
import type { ToolbarSeparatorProps } from "./Toolbar.types";

const ToolbarSeparatorStyled = styled("div", {
  name: "ToolbarSeparator",
})(["atomiton-toolbar-separator", "bg-s-01", "mx-1"], {
  variants: {
    orientation: {
      horizontal: "h-px w-4",
      vertical: "w-px h-6",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

/**
 * Toolbar separator for visual grouping
 */
export function ToolbarSeparator({
  orientation = "vertical",
  ...props
}: ToolbarSeparatorProps) {
  return (
    <ToolbarSeparatorStyled
      orientation={orientation}
      role="separator"
      aria-orientation={orientation}
      {...props}
    />
  );
}
