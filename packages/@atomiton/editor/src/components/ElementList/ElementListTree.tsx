import { styled } from "@atomiton/ui";
import type { ElementListTreeProps } from "./ElementList.types";

const ElementListTreeStyled = styled("div", {
  name: "ElementListTree",
})(
  [
    "atomiton-element-list-tree",
    "flex-1",
    "overflow-y-auto",
    "overflow-x-hidden",
  ],
  {
    variants: {
      mode: {
        list: "space-y-0",
        tree: "space-y-1 p-2",
        grid: "grid grid-cols-2 gap-2 p-2",
      },
    },
    defaultVariants: {
      mode: "list",
    },
  },
);

/**
 * ElementList tree container
 */
export function ElementListTree({
  children,
  className,
  mode = "list",
  ...props
}: ElementListTreeProps) {
  return (
    <ElementListTreeStyled
      mode={mode}
      className={className}
      data-mode={mode}
      {...props}
    >
      {children}
    </ElementListTreeStyled>
  );
}
